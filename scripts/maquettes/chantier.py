# Maquette 3D d'un chantier à partir de ses vrais plans, décrits dans un fichier de réglages (chantiers/<id>.json).
#   python chantier.py chantiers/<id>.json <dossier des plans PNG> <dossier de travail> <assets/maquettes/<id>>
# Le plan « base » donne les murs et le repère (pixels → mètres) ; les autres plans y sont recalés
# (échelle + décalage estimés sur les murs, puis affinés), et deviennent des calques transparents.
import sys, json, os, numpy as np, cv2
from scipy import ndimage as nd
from matieres import textures

CFG = json.load(open(sys.argv[1])); P, WORK, OUT = sys.argv[2], sys.argv[3], sys.argv[4]
os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)
PXM = CFG.get("pxm", 300 / 25.4 / 50 * 1000)        # pixels par mètre du plan de base
X0, Y0, X1, Y1 = CFG["cadre"]                          # zone utile, en pixels du plan de base
W, H = X1 - X0, Y1 - Y0
K = PXM / 236.22                                       # facteur par rapport à un plan au 1:50 rendu à 300 dpi
rgb = lambda f: cv2.imread(f"{P}/{f}")[..., ::-1]


def wallmask(a, lo=100, hi=185):
    a = a.astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    neutre = (abs(r - g) < 10) & (abs(g - b) < 10)
    m = neutre & (r > lo) & (r < hi)
    if CFG.get("contour_noir"):   # cloisons fines : remplissage gris bordé d'un trait noir
        m = m | (neutre & (r < 60) & nd.binary_dilation(m, iterations=5))
    return nd.binary_opening(m, structure=np.ones((max(5, int(CFG.get("ouverture", 15) * K)),) * 2))


BASE = rgb(CFG["base"])
MB = wallmask(BASE)


def bbox(m):
    ys, xs = np.where(m); return np.array([xs.min(), ys.min(), xs.max(), ys.max()], float)


def recale(f, zone=None):
    """Plan f ramené dans le repère du plan de base (cadre compris). Renvoie l'image recalée."""
    a = rgb(f)
    if f == CFG["base"]:
        return np.ascontiguousarray(a[Y0:Y1, X0:X1])
    m = wallmask(a)
    zb = zone or CFG.get("zone_murs")
    mb = MB.copy()
    if zb: z = np.zeros_like(mb); z[zb[1]:zb[3], zb[0]:zb[2]] = True; mb &= z
    zo = CFG.get("zones", {}).get(f)
    if zo: z = np.zeros_like(m); z[zo[1]:zo[3], zo[0]:zo[2]] = True; m &= z
    b0, b1 = bbox(mb), bbox(m)
    s = ((b0[2] - b0[0]) / (b1[2] - b1[0]) + (b0[3] - b0[1]) / (b1[3] - b1[1])) / 2
    tx, ty = b0[0] - s * b1[0], b0[1] - s * b1[1]
    A = np.array([[s, 0, tx], [0, s, ty]], np.float32)
    # affinage (ECC) sur les murs adoucis, à 1/4
    q = 0.25
    src = cv2.GaussianBlur(cv2.resize(m.astype(np.float32), None, fx=q, fy=q, interpolation=cv2.INTER_AREA), (0, 0), 3)
    dst = cv2.GaussianBlur(cv2.resize(mb.astype(np.float32), None, fx=q, fy=q, interpolation=cv2.INTER_AREA), (0, 0), 3)
    Aq = A.copy(); Aq[:, 2] *= q
    # ECC cherche la transformation de dst vers src : on part de l'inverse
    Ai = cv2.invertAffineTransform(Aq).astype(np.float32)
    try:
        _, Ai = cv2.findTransformECC(dst, src, Ai, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
        Aq = cv2.invertAffineTransform(Ai); A = Aq.copy(); A[:, 2] /= q
    except cv2.error as e:
        print("  ECC non convergé pour", f, e)
    A[:, 2] -= (X0, Y0)
    out = cv2.warpAffine(a, A, (W, H), flags=cv2.INTER_LINEAR, borderValue=(255, 255, 255))
    print(f"  recalage {f}: échelle {A[0,0]:.4f} {A[1,1]:.4f}, décalage {A[0,2]:.1f} {A[1,2]:.1f}")
    return out


T = {k: recale(f) for k, f in CFG["plans"].items() if f}
B = T["base"] = np.ascontiguousarray(BASE[Y0:Y1, X0:X1])
M = wallmask(B)
if CFG.get("murs_effaces"):                            # éléments gris qui ne sont pas des murs (légendes…)
    for x0, y0, x1, y1 in CFG["murs_effaces"]: M[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
if CFG.get("murs_ajoutes"):                            # bouts de mur à ajouter (rectangles)
    for x0, y0, x1, y1 in CFG["murs_ajoutes"]: M[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = True
L = lambda v: [round(float(v[0] - X0) / PXM, 3), round(float(v[1] - Y0) / PXM, 3)]   # pixel du plan de base → mètres


def gaps(mask):
    """Trous dans un mur : de part et d'autre, le même mur (même position, épaisseur de mur) continue."""
    h, w = mask.shape; m = mask.astype(np.int32)
    up = np.zeros_like(m); dn = np.zeros_like(m)
    for y in range(h): up[y] = (up[y - 1] + 1) * m[y] if y else m[y]
    for y in range(h - 1, -1, -1): dn[y] = (dn[y + 1] + 1) * m[y] if y < h - 1 else m[y]
    out = np.zeros_like(mask)
    gmin, gmax, tmin, tmax = 0.38 * PXM, 3.0 * PXM, 0.06 * PXM, 0.7 * PXM
    for y in range(h):
        row = mask[y]; d = np.flatnonzero(np.diff(row.astype(np.int8)))
        starts = [i + 1 for i in d if row[i] and not row[i + 1]]
        ends = [j for j in d if not row[j] and row[j + 1]]
        for s_ in starts:
            e = next((j for j in ends if j >= s_), None)
            if e is None or not (gmin <= e - s_ + 1 <= gmax): continue
            l, r = s_ - 1, e + 1
            t1, t2 = up[y, l] + dn[y, l] - 1, up[y, r] + dn[y, r] - 1
            if not (tmin <= t1 <= tmax and tmin <= t2 <= tmax): continue
            a1, a2 = y - up[y, l] + 1, y - up[y, r] + 1
            ov = min(a1 + t1, a2 + t2) - max(a1, a2)
            if ov >= 0.5 * min(t1, t2): out[y, s_:e + 1] = True
    return out


G = gaps(M) | gaps(M.T).T
for x0, y0, x1, y1 in CFG.get("ouvertures_effacees", []): G[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
for x0, y0, x1, y1 in CFG.get("ouvertures_ajoutees", []): G[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = True
Gd = nd.binary_dilation(G, iterations=4)

# emprise du logement : murs + ouvertures + bouchons, refermés, puis remplissage depuis l'extérieur
seal = np.zeros(M.shape, np.uint8)
for (xa, ya), (xb, yb) in CFG.get("bouchons", []) + [((f[0], f[1]), (f[2], f[3])) for f in CFG.get("fenetres", [])]:
    cv2.line(seal, (xa - X0, ya - Y0), (xb - X0, yb - Y0), 1, max(6, int(14 * K)))
ks = max(31, int(161 * K) | 1)
pad = 2 * ks
img = cv2.copyMakeBorder((M | Gd | seal.astype(bool)).astype(np.uint8) * 255, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
cl = cv2.morphologyEx(img, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ks, ks)))
ff = cl.copy(); msk = np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8); cv2.floodFill(ff, msk, (0, 0), 128)
F = (ff != 128)[pad:-pad, pad:-pad]
for x0, y0, x1, y1 in CFG.get("hors_logement", []): F[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
# congés de la fermeture dans les angles rentrants, côté extérieur : petites zones collées à l'extérieur, hors des murs
lab0, n0 = nd.label(F & ~M & ~Gd & ~seal.astype(bool))
touch = nd.binary_dilation(~F, iterations=2)
for i, sl in enumerate(nd.find_objects(lab0), 1):
    comp = lab0[sl] == i
    if comp.sum() < 1.0 * PXM * PXM and (comp & touch[sl]).any(): F[sl][comp] = False
EXT = ~F
inside = F & ~M

# ouvertures : fenêtres (sur l'extérieur), portes (entre deux pièces)
entry = CFG.get("entree")
glab, gn = nd.label(G)
windows, doors = [], []
for i, sl in enumerate(nd.find_objects(glab), 1):
    comp = glab == i
    ys, xs = np.where(comp)
    if len(xs) < 20: continue
    (cx, cy), (rw, rh), ang = cv2.minAreaRect(np.stack([xs, ys], 1).astype(np.float32))
    touch_ext = (nd.binary_dilation(comp, iterations=8) & EXT).any()
    near_entry = entry and np.hypot(cx + X0 - entry[0], cy + Y0 - entry[1]) < 1.6 * PXM
    if any(x0 <= cx + X0 <= x1 and y0 <= cy + Y0 <= y1 for x0, y0, x1, y1 in CFG.get("hors_logement", [])): continue
    item = {"x": round(cx / PXM, 3), "y": round(cy / PXM, 3), "w": round(max(rw, rh) / PXM, 3), "d": round(min(rw, rh) / PXM, 3),
            "a": round(float(np.deg2rad(ang if rw >= rh else ang + 90)), 4)}
    (windows if touch_ext and not near_entry else doors).append(item)
for xa, ya, xb, yb, ep in CFG.get("fenetres", []):   # fenêtres sur des murs en biais (non détectées)
    windows.append({"x": round((xa + xb) / 2 - X0, 1) / PXM, "y": round((ya + yb) / 2 - Y0, 1) / PXM, "w": round(np.hypot(xb - xa, yb - ya) / PXM, 3), "d": round(ep / PXM, 3), "a": round(float(np.arctan2(yb - ya, xb - xa)), 4)})
for w_ in windows: w_["x"], w_["y"] = round(w_["x"], 3), round(w_["y"], 3)
print(len(windows), "fenêtres,", len(doors), "portes/passages")

# murs en polygones (avec trous), en mètres
cs, hier = cv2.findContours(M.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
polys = []
for i, c in enumerate(cs):
    if hier[0][i][3] != -1 or cv2.contourArea(c) < 400 * K * K: continue
    outer = cv2.approxPolyDP(c, 2.0 * K, True)[:, 0] / PXM
    holes = []
    j = hier[0][i][2]
    while j != -1:
        if cv2.contourArea(cs[j]) > 200 * K * K: holes.append((cv2.approxPolyDP(cs[j], 2.0 * K, True)[:, 0] / PXM).round(3).tolist())
        j = hier[0][j][0]
    polys.append({"outer": outer.round(3).tolist(), "holes": holes})
print(len(polys), "polygones de murs")

# pièces : l'intérieur coupé aux portes ; matière de chaque pièce par une graine (x, y, matière)
lab, n = nd.label(inside & ~Gd)
room = np.full(M.shape, -1)
mats = []
if CFG.get("sols_couleurs"):   # d'après les aplats du plan des sols : une couleur → une matière
    sc_ = CFG["sols_couleurs"]; a_ = T[sc_["plan"]].astype(int)
    for rgb_, mat in sc_["couleurs"]:
        if mat not in mats: mats.append(mat)
        room[(np.sqrt(((a_ - np.array(rgb_)) ** 2).sum(-1)) < sc_.get("tolerance", 14)) & inside] = mats.index(mat)
for x, y, mat in CFG.get("sols", []):
    k = lab[y - Y0, x - X0]
    if k <= 0: print("  graine hors pièce", x, y, mat); continue
    if mat not in mats: mats.append(mat)
    room[lab == k] = mats.index(mat)
if CFG.get("sols_defaut"):     # une matière partout, puis des zones (rectangles) dans une autre matière
    for mat in [CFG["sols_defaut"]] + [z[4] for z in CFG.get("sols_zones", [])]:
        if mat not in mats: mats.append(mat)
    room[inside] = mats.index(CFG["sols_defaut"])
    for x0, y0, x1, y1, mat in CFG.get("sols_zones", []):
        z = np.zeros_like(inside); z[max(0, y0 - Y0):y1 - Y0, max(0, x0 - X0):x1 - X0] = True
        room[z & inside] = mats.index(mat)
idx = nd.distance_transform_edt(room < 0, return_distances=False, return_indices=True)
room = room[idx[0], idx[1]]; room[~inside] = -1
print("sols (m²):", {m: round(((room == k).sum()) / PXM ** 2, 1) for k, m in enumerate(mats)})

# points lumineux (cercles du plan électrique)
lights = []
if "elec" in T:
    g = cv2.cvtColor(T["elec"], cv2.COLOR_RGB2GRAY)
    r0, r1 = CFG.get("rayon_points", [15, 24])
    cir = cv2.HoughCircles(cv2.GaussianBlur(g, (3, 3), 0), cv2.HOUGH_GRADIENT, dp=1, minDist=int(60 * K), param1=40, param2=CFG.get("hough", 16), minRadius=int(r0 * K), maxRadius=int(r1 * K))
    near = nd.binary_dilation(M, iterations=int(4 * K) + 1)
    if cir is not None:
        for x, y, r in cir[0]:
            x, y = int(x), int(y)
            if not (0 <= x < W and 0 <= y < H): continue
            dens = (g[max(0, y - int(40 * K)):y + int(40 * K), max(0, x - int(40 * K)):x + int(40 * K)] < 200).mean()
            if inside[y, x] and not near[max(0, y - int(30 * K)):y + int(30 * K), max(0, x - int(30 * K)):x + int(30 * K)].any() and dens < CFG.get("densite_max", 0.12):
                lights.append([round(x / PXM, 3), round(y / PXM, 3)])
    lights += [L(p) for p in CFG.get("points_ajoutes", [])]
    lights = [l for l in lights if not any(np.hypot(l[0] - (x - X0) / PXM, l[1] - (y - Y0) / PXM) < 0.3 for x, y in CFG.get("points_effaces", []))]
print(len(lights), "points lumineux")


# calques transparents
def save(name, im):
    h, w = im.shape[:2]; im = cv2.resize(im, (2048, round(h * 2048 / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{OUT}/{name}.webp", cv2.cvtColor(im, cv2.COLOR_RGBA2BGRA if im.shape[2] == 4 else cv2.COLOR_RGB2BGR), [cv2.IMWRITE_WEBP_QUALITY, 86])


def rgba(colors, keep):
    o = np.zeros((H, W, 4), np.uint8); o[..., :3] = colors; o[..., 3] = keep.astype(np.uint8) * 255; return o


base_dark = nd.binary_dilation(cv2.cvtColor(T.get("papier", B), cv2.COLOR_RGB2GRAY) < 200, iterations=int(5 * K) + 1) | nd.binary_dilation(M, iterations=int(6 * K) + 1)
for x0, y0, x1, y1 in CFG.get("calques_effaces", []): base_dark[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = True
calques = []
for c in CFG["calques"]:
    a = T[c["plan"]].astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if c["type"] == "demolition":   # traits rouges et jaunes du plan de démolition
        keep = ((r > 180) & (g < 110) & (b < 110)) | ((r > 200) & (g > 180) & (b < 110))
        keep = nd.binary_dilation(keep, iterations=1) & nd.binary_dilation(F, iterations=int(10 * K))
        col = a.astype(np.uint8)
    elif c["type"] == "electricite":   # ce qui est dessiné en plus sur le plan électrique : réseaux, points, prises
        gr = cv2.cvtColor(T[c["plan"]], cv2.COLOR_RGB2GRAY) < 215
        keep = nd.binary_dilation(gr & ~base_dark & F, iterations=1)
        col = np.zeros((H, W, 3), np.uint8); col[:] = (40, 90, 210)
    elif c["type"] == "cotes":   # textes et cotes du plan (traits sombres absents du plan de base)
        gr = cv2.cvtColor(T[c["plan"]], cv2.COLOR_RGB2GRAY) < 150
        keep = gr & ~nd.binary_dilation(M, iterations=int(3 * K) + 1)
        col = np.zeros((H, W, 3), np.uint8); col[:] = (150, 40, 40)
    elif c["type"] == "existant":   # murs de l'état existant qui ne sont plus dans le projet
        keep = wallmask(T[c["plan"]]) & ~nd.binary_dilation(M, iterations=int(4 * K) + 1)
        col = np.zeros((H, W, 3), np.uint8); col[:] = (96, 104, 118)
    elif c["type"] == "plafonds":   # hachures des faux plafonds
        keep = (r > 150) & (r - g > 40) & (r - b > 40)
        keep = cv2.dilate(keep.astype(np.uint8), np.ones((3, 3))) > 0
        keep &= F
        col = np.zeros((H, W, 3), np.uint8); col[:] = (200, 70, 60)
    elif c["type"] == "couleurs":   # aplats de couleur (plan des sols…), sans les murs
        sat = (np.max(a, -1) - np.min(a, -1)) > 25
        keep = sat & F & ~M
        col = a.astype(np.uint8)
    else:
        raise SystemExit("type de calque inconnu " + c["type"])
    for x0, y0, x1, y1 in c.get("effacer", []): keep[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = False
    save(c["id"], rgba(col, keep))
    calques.append({"f": c["id"] + ".webp", "titre": c["titre"], "texte": c["texte"], **({"complet": False} if c["type"] == "couleurs" else {})})
    print("calque", c["id"], int(keep.sum()), "px")

save("papier", T.get("papier", B))

# sols (texture 2048 px de large), ombre de contact
S2 = 2048 / W; W2, H2 = 2048, int(round(H * S2)); cm = 100 / (PXM * S2)
r2 = cv2.resize(room.astype(np.int16), (W2, H2), interpolation=cv2.INTER_NEAREST)
TEX = textures(W2, H2, cm, mats)
out = np.zeros((H2, W2, 4), np.float32)
for k, m in enumerate(mats):
    sel = r2 == k; out[sel, :3] = TEX[m][sel]; out[sel, 3] = 1
wall2 = cv2.resize(M.astype(np.uint8), (W2, H2), interpolation=cv2.INTER_NEAREST) > 0
out[wall2, :3] = 0.85; out[wall2, 3] = 1
cont = cv2.GaussianBlur(wall2.astype(np.float32), (0, 0), 6)
out[..., :3] *= (1 - 0.35 * np.clip(cont, 0, 1))[..., None]
save("sol", (np.clip(out, 0, 1) * 255).astype(np.uint8))
d = cv2.distanceTransform((~M).astype(np.uint8), cv2.DIST_L2, 5) / PXM
ao = 0.55 * np.exp(-d / 0.16) + 0.22 * np.exp(-d / 0.7); ao[M] = 0; ao[~F] = 0
ao = cv2.GaussianBlur(ao.astype(np.float32), (0, 0), 3 * K)
o = np.zeros((H, W, 4), np.uint8); o[..., 3] = np.clip(ao * 255, 0, 255).astype(np.uint8); o[..., :3] = (30, 22, 18)
h_, w_ = o.shape[:2]; o = cv2.resize(o, (1024, round(h_ * 1024 / w_)), interpolation=cv2.INTER_AREA)
cv2.imwrite(f"{OUT}/ombre.webp", cv2.cvtColor(o, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 90])

# mobilier : rectangles et points en pixels du plan de base → mètres
def conv(it):
    o = dict(it)
    for k in ("r", "a", "b", "colonne"):
        if k in o: o[k] = L(o[k][:2]) + L(o[k][2:])
    if "p" in o: o["p"] = L(o["p"])
    return o


scene = {"w": round(W / PXM, 3), "h": round(H / PXM, 3), "walls": polys, "windows": windows, "doors": doors, "lights": lights,
         "mobilier": [conv(it) for it in CFG.get("mobilier", [])], "hauteur": CFG.get("hauteur", 2.5),
         "calques": calques, "sols": CFG.get("texte_sols", "Les sols posés pièce par pièce, d'après les plans."),
         "titre": CFG.get("titre", "")}
if CFG.get("balcon"): scene["balcon"] = {"r": L(CFG["balcon"][:2]) + L(CFG["balcon"][2:])}
if CFG.get("lumiere_soleil"): scene["soleil"] = CFG["lumiere_soleil"]
json.dump(scene, open(f"{OUT}/scene.json", "w"), separators=(",", ":"))
print("scène", scene["w"], "×", scene["h"], "m,", len(scene["mobilier"]), "meubles")

# aperçu de contrôle (avec quadrillage en pixels du plan de base)
vis = (T.get("papier", B) * 0.35 + 165).astype(np.uint8); vis[M] = (90, 90, 90)
pal = [(230, 200, 140), (170, 200, 230), (200, 160, 240), (150, 220, 160), (240, 170, 120), (200, 200, 120)]
for k in range(len(mats)): vis[(room == k)] = (np.array(pal[k % 6]) * 0.6 + vis[room == k] * 0.4).astype(np.uint8)
vis[G] = (0, 170, 0)
for w_ in windows: cv2.circle(vis, (int(w_["x"] * PXM), int(w_["y"] * PXM)), int(22 * K), (0, 120, 255), max(2, int(6 * K)))
for l in lights: cv2.circle(vis, (int(l[0] * PXM), int(l[1] * PXM)), int(18 * K), (255, 200, 0), -1)
for it in scene["mobilier"]:
    for k in ("r", "a", "b", "colonne"):
        if k in it: x0, y0, x1, y1 = [v * PXM for v in it[k]]; cv2.rectangle(vis, (int(x0), int(y0)), (int(x1), int(y1)), (200, 40, 40), max(1, int(3 * K)))
    if "p" in it: cv2.circle(vis, (int(it["p"][0] * PXM), int(it["p"][1] * PXM)), int(12 * K), (200, 40, 40), -1)
step = 100
for x in range((X0 // step + 1) * step, X1, step): cv2.line(vis, (x - X0, 0), (x - X0, H), (120, 170, 255) if x % 500 else (60, 60, 255), 1)
for y in range((Y0 // step + 1) * step, Y1, step): cv2.line(vis, (0, y - Y0), (W, y - Y0), (120, 170, 255) if y % 500 else (60, 60, 255), 1)
for x in range((X0 // 500 + 1) * 500, X1, 500): cv2.putText(vis, str(x), (x - X0 + 4, int(30 * K) + 10), 0, 1.0 * K + 0.3, (220, 0, 0), 2)
for y in range((Y0 // 500 + 1) * 500, Y1, 500): cv2.putText(vis, str(y), (4, y - Y0 - 6), 0, 1.0 * K + 0.3, (220, 0, 0), 2)
cv2.imwrite(f"{WORK}/_controle.jpg", cv2.cvtColor(cv2.resize(vis, (min(2000, W), int(H * min(2000, W) / W))), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 82])
for k, im in T.items():
    if k == "base": continue
    ov = (B.astype(np.float32) * 0.5 + im.astype(np.float32) * 0.5).astype(np.uint8)
    cv2.imwrite(f"{WORK}/_recalage-{k}.jpg", cv2.cvtColor(cv2.resize(ov, (1400, int(H * 1400 / W))), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 75])
