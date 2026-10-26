# Prépare les données de la maquette 3D d'un chantier à partir de ses vrais plans (repère : plan projet T1).
import sys, json, os, numpy as np, cv2
from scipy import ndimage as nd
P = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PXM = 300 / 25.4 / 50 * 1000          # pixels par mètre (plan au 1:50 scanné à 300 dpi) = 236.2
R = (840, 534, 4352, 3088)              # zone utile dans le repère du plan T1
W, H = R[2] - R[0], R[3] - R[1]
def load(name, dx=0, dy=0):
    a = cv2.imread(f"{P}/{name}")[..., ::-1]
    x0, y0 = R[0] + dx, R[1] + dy
    return np.ascontiguousarray(a[y0:y0 + H, x0:x0 + W])
def wallmask(a):
    a = a.astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (abs(r - g) < 10) & (abs(g - b) < 10) & (r > 100) & (r < 185)
    return nd.binary_opening(m, structure=np.ones((15, 15)))
# décalages des plans par rapport à T1 (cadres des murs)
def bbox(m):
    ys, xs = np.where(m); return xs.min(), ys.min(), xs.max(), ys.max()
full = lambda n: cv2.imread(f"{P}/{n}")[..., ::-1]
ref = bbox(wallmask(full("planT1-1.png")[600:3100, 800:4400]))
OFF = {}
for k in (1, 2, 3, 4, 5):
    b = bbox(wallmask(full(f"planT{k}-1.png")[450:3100, 700:4400]))
    OFF[k] = (round(((b[0] + 700) - (ref[0] + 800) + (b[2] + 700) - (ref[2] + 800)) / 2), round(((b[1] + 450) - (ref[1] + 600) + (b[3] + 450) - (ref[3] + 600)) / 2))
print("décalages", OFF)
T = {k: load(f"planT{k}-1.png", *OFF[k]) for k in (1, 2, 3, 4, 5)}
M = wallmask(T[3])
# ── ouvertures : trous dans un mur, bordés de mur des deux côtés, à peu près aussi épais que le mur ──
def gaps(mask):
    # un trou dans un mur : de part et d'autre, le même mur (même position, épaisseur de mur) continue
    h, w = mask.shape; m = mask.astype(np.int32)
    up = np.zeros_like(m); dn = np.zeros_like(m)
    for y in range(h): up[y] = (up[y - 1] + 1) * m[y] if y else m[y]
    for y in range(h - 1, -1, -1): dn[y] = (dn[y + 1] + 1) * m[y] if y < h - 1 else m[y]
    out = np.zeros_like(mask)
    for y in range(h):
        row = mask[y]; d = np.flatnonzero(np.diff(row.astype(np.int8)))
        starts = [i + 1 for i in d if row[i] and not row[i + 1]]
        ends = [j for j in d if not row[j] and row[j + 1]]
        for s_ in starts:
            e = next((j for j in ends if j >= s_), None)
            if e is None or not (90 <= e - s_ + 1 <= 700): continue
            l, r = s_ - 1, e + 1
            t1, t2 = up[y, l] + dn[y, l] - 1, up[y, r] + dn[y, r] - 1
            if not (18 <= t1 <= 150 and 18 <= t2 <= 150): continue
            a1, a2 = y - up[y, l] + 1, y - up[y, r] + 1
            ov = min(a1 + t1, a2 + t2) - max(a1, a2)
            if ov >= 0.5 * min(t1, t2): out[y, s_:e + 1] = True
    return out
G = gaps(M) | gaps(M.T).T
Gd = nd.binary_dilation(G, iterations=4)
# emprise du logement : murs + ouvertures refermés, petits jours bouchés, puis remplissage
# porte d'entrée (souvent en biais) : on la referme entre les deux bouts de mur les plus proches du triangle « Entrée »
seal = np.zeros(M.shape, np.uint8)
a_ = T[3].astype(int); red_ = (a_[..., 0] > 180) & (a_[..., 1] < 80) & (a_[..., 2] < 80)
def arrow(redm):
    lb, n = nd.label(redm); best_ = None
    for i, sl in enumerate(nd.find_objects(lb), 1):
        h_, w_ = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start; area = (lb[sl] == i).sum()
        if 40 <= h_ <= 260 and 40 <= w_ <= 260 and area / (h_ * w_) > 0.3 and (best_ is None or area > best_[0]):
            best_ = (area, (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2)
    return best_
A_ = arrow(red_)
if A_:
    ex, ey = A_[1], A_[2]
    wy, wx = np.where(M[max(0, int(ey) - 500):int(ey) + 500, max(0, int(ex) - 500):int(ex) + 500])
    wy = wy + max(0, int(ey) - 500); wx = wx + max(0, int(ex) - 500)
    d = np.hypot(wx - ex, wy - ey); o = np.argsort(d)
    p1 = (wx[o[0]], wy[o[0]]); v1 = np.array(p1) - (ex, ey)
    for k_ in o[1:]:
        v2 = np.array((wx[k_], wy[k_])) - (ex, ey)
        cosang = (v1 @ v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
        if np.hypot(wx[k_] - p1[0], wy[k_] - p1[1]) > 180 and cosang < 0.2:
            cv2.line(seal, (int(p1[0]), int(p1[1])), (int(wx[k_]), int(wy[k_])), 1, 14); print("entrée refermée", p1, (wx[k_], wy[k_])); break
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (161, 161))
pad = cv2.copyMakeBorder((M | Gd | seal.astype(bool)).astype(np.uint8) * 255, 230, 230, 230, 230, cv2.BORDER_CONSTANT, value=0)
cl = cv2.morphologyEx(pad, cv2.MORPH_CLOSE, k)
ff = cl.copy(); msk = np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8); cv2.floodFill(ff, msk, (0, 0), 128)
F = (ff != 128)[230:-230, 230:-230]
EXT = ~F
# entrée : triangle rouge du plan
a = T[3].astype(int); red = (a[..., 0] > 180) & (a[..., 1] < 80) & (a[..., 2] < 80)
entry = (A_[1], A_[2]) if A_ else (-1e9, -1e9)
glab, gn = nd.label(G)
windows, doors = [], []
for i, sl in enumerate(nd.find_objects(glab), 1):
    comp = glab == i
    ys, xs = np.where(comp)
    rect = cv2.minAreaRect(np.stack([xs, ys], 1).astype(np.float32))
    (cx, cy), (rw, rh), ang = rect
    touch_ext = (nd.binary_dilation(comp, iterations=8) & EXT).any()
    near_entry = np.hypot(cx - entry[0], cy - entry[1]) < 420
    item = {"x": round(cx / PXM, 3), "y": round(cy / PXM, 3), "w": round(max(rw, rh) / PXM, 3), "d": round(min(rw, rh) / PXM, 3),
            "a": round(np.deg2rad(ang if rw >= rh else ang + 90), 4)}
    (windows if touch_ext and not near_entry else doors).append(item)
print(len(windows), "fenêtres,", len(doors), "portes/passages")
# ── murs en polygones (avec trous) ──
cs, hier = cv2.findContours(M.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
polys = []
for i, c in enumerate(cs):
    if hier[0][i][3] != -1 or cv2.contourArea(c) < 400: continue
    outer = cv2.approxPolyDP(c, 2.0, True)[:, 0] / PXM
    holes = []
    j = hier[0][i][2]
    while j != -1:
        if cv2.contourArea(cs[j]) > 200: holes.append((cv2.approxPolyDP(cs[j], 2.0, True)[:, 0] / PXM).round(3).tolist())
        j = hier[0][j][0]
    polys.append({"outer": outer.round(3).tolist(), "holes": holes})
print(len(polys), "polygones de murs")
# ── pièces (couleurs du plan projet T1) ──
a = T[1].astype(int)
COL = {"sejour": (254, 255, 127), "chambre1": (230, 230, 242), "chambre2": (255, 189, 128), "couloir": (188, 214, 237), "entree": (250, 248, 191), "sdb": (221, 189, 254), "wc": (110, 110, 250)}
inside = ~EXT & ~M
best = np.full(a.shape[:2], 1e9); room = np.full(a.shape[:2], -1)
for k, (name, c) in enumerate(COL.items()):
    d = np.sqrt(((a - np.array(c)) ** 2).sum(-1))
    sel = (d < 22) & (d < best) & inside
    best[sel] = d[sel]; room[sel] = k
for k in range(len(COL)):  # nettoyage
    mk = nd.binary_opening(room == k, iterations=3); room[(room == k) & ~mk] = -1
idx = nd.distance_transform_edt(room < 0, return_distances=False, return_indices=True)
room = room[idx[0], idx[1]]; room[~inside & ~M] = -1
np.save(f"{OUT}/../_room.npy", room); np.save(f"{OUT}/../_walls.npy", M); np.save(f"{OUT}/../_inside.npy", inside | M)
print("pièces (m²):", {n: round(((room == k).sum()) / PXM ** 2, 1) for k, n in enumerate(COL)})
# ── points lumineux (cercles barrés du plan électrique) ──
g = cv2.cvtColor(T[4], cv2.COLOR_RGB2GRAY)
cir = cv2.HoughCircles(cv2.GaussianBlur(g, (3, 3), 0), cv2.HOUGH_GRADIENT, dp=1, minDist=60, param1=40, param2=16, minRadius=15, maxRadius=24)
lights = []
if cir is not None:
    for x, y, r in cir[0]:
        x, y = int(x), int(y)
        near_wall = nd.binary_dilation(M, iterations=1)[max(0, y - 30):y + 30, max(0, x - 30):x + 30].any()
        dens = (g[max(0, y - 40):y + 40, max(0, x - 40):x + 40] < 200).mean()
        if inside[min(y, H - 1), min(x, W - 1)] and not near_wall and dens < 0.12:
            lights.append([round(x / PXM, 3), round(y / PXM, 3)])
print(len(lights), "points lumineux")
# ── calques (fond transparent) : démolition, électricité ──
def rgba(img, keep):
    o = np.zeros((H, W, 4), np.uint8); o[..., :3] = img; o[..., 3] = keep.astype(np.uint8) * 255; return o
a2 = T[2].astype(int)
dem = ((a2[..., 0] > 180) & (a2[..., 1] < 90) & (a2[..., 2] < 90)) | ((a2[..., 0] > 200) & (a2[..., 1] > 200) & (a2[..., 2] < 90))
dem = nd.binary_dilation(dem, iterations=2) & ~nd.binary_dilation(red, iterations=6)
base_dark = nd.binary_dilation(cv2.cvtColor(T[3], cv2.COLOR_RGB2GRAY) < 200, iterations=5) | nd.binary_dilation(M, iterations=6)
e4 = cv2.cvtColor(T[4], cv2.COLOR_RGB2GRAY) < 215; e5 = cv2.cvtColor(T[5], cv2.COLOR_RGB2GRAY) < 215
elec = (e4 | e5) & ~base_dark & inside
elec = nd.binary_opening(elec, iterations=0) if False else elec
eimg = np.zeros((H, W, 3), np.uint8); eimg[:] = (40, 90, 210)
dimg = T[2].copy()
cv2.imwrite(f"{OUT}/demolition.png", cv2.cvtColor(rgba(dimg, dem), cv2.COLOR_RGBA2BGRA))
cv2.imwrite(f"{OUT}/electricite.png", cv2.cvtColor(rgba(eimg, nd.binary_dilation(elec, iterations=1)), cv2.COLOR_RGBA2BGRA))
cv2.imwrite(f"{OUT}/papier.png", cv2.cvtColor(T[3], cv2.COLOR_RGB2BGR))
json.dump({"w": round(W / PXM, 3), "h": round(H / PXM, 3), "walls": polys, "windows": windows, "doors": doors, "lights": lights,
           "entry": [round(entry[0] / PXM, 3), round(entry[1] / PXM, 3)]}, open(f"{OUT}/scene.json", "w"))
# aperçu de contrôle
vis = (T[3] * 0.35 + 165).astype(np.uint8); vis[M] = (90, 90, 90)
for k, c in enumerate([(230, 200, 140), (200, 190, 230), (240, 170, 120), (170, 200, 230), (235, 225, 170), (200, 160, 240), (120, 120, 240)]):
    vis[(room == k) & ~M] = (np.array(c) * 0.6 + vis[(room == k) & ~M] * 0.4).astype(np.uint8)
vis[G] = (0, 170, 0)
for w_ in windows: cv2.circle(vis, (int(w_["x"] * PXM), int(w_["y"] * PXM)), 22, (0, 120, 255), 6)
for l in lights: cv2.circle(vis, (int(l[0] * PXM), int(l[1] * PXM)), 18, (255, 200, 0), -1)
vis[dem] = (220, 0, 0); vis[elec] = (30, 60, 200)
cv2.imwrite(f"{OUT}/../_controle.jpg", cv2.cvtColor(cv2.resize(vis, (W // 2, H // 2)), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 80])
