# Maquette 3D d'un lieu ouvert (café, boutique, plateau…) : murs, poteaux et sols décrits à la main
# dans un fichier de réglages, en pixels du plan de base, quand le plan n'a pas de murs fermés que chantier.py
# saurait détecter tout seul. Même sortie que chantier.py (scene.json, papier, sol, ombre, calques),
# lue par assets/js/maquette.js.
#   python espace.py chantiers/<id>.json <dossier des plans PNG> <dossier de travail> <assets/maquettes/<id>>
#
# Réglages :
#   base, cadre [x0, y0, x1, y1], pxm (pixels par mètre du plan de base), hauteur, soleil
#   murs        : rectangles [x0, y0, x1, y1], polygones [[x, y], …] (murs, poteaux)
#                 ou {"r": rectangle, "creux": épaisseur} (noyau, local fermé : seulement ses murs)
#   sols_defaut : matière partout (facultatif) ; sols_zones : [rectangle ou polygone, matière]
#   calques     : traits rouges d'un plan (plan électrique…), recalés par morceaux :
#                 sources = [{plan, zone [x0, y0, x1, y1] dans ce plan, echelle, de [x, y] dans ce plan, vers [x, y] du plan de base}]
#                 les points lumineux (cercles barrés) de ces traits deviennent les lumières de la maquette
#                 (teinte "rose" pour des cotes en rouge clair, points false pour ne pas y chercher de lumières)
#   fenetres    : rectangles [x0, y0, x1, y1] dans l'épaisseur du mur (allège, vitrage, linteau)
#   points_ajoutes, mobilier (comme chantier.py), texte_sols, texte_murs, texte_lumiere
import sys, json, os, numpy as np, cv2
from scipy import ndimage as nd
from matieres import textures

CFG = json.load(open(sys.argv[1])); P, WORK, OUT = sys.argv[2], sys.argv[3], sys.argv[4]
os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)
PXM = CFG["pxm"]
X0, Y0, X1, Y1 = CFG["cadre"]
W, H = X1 - X0, Y1 - Y0
rgb = lambda f: cv2.imread(f"{P}/{f}")[..., ::-1]
B = np.ascontiguousarray(rgb(CFG["base"])[Y0:Y1, X0:X1])
L = lambda v: [round(float(v[0] - X0) / PXM, 3), round(float(v[1] - Y0) / PXM, 3)]


def shape_mask(s):
    """Rectangle [x0, y0, x1, y1] ou polygone [[x, y], …] (pixels du plan de base) → masque du cadre."""
    m = np.zeros((H, W), np.uint8)
    if isinstance(s[0], (int, float)):
        x0, y0, x1, y1 = s; m[max(0, y0 - Y0):y1 - Y0, max(0, x0 - X0):x1 - X0] = 1
    else:
        cv2.fillPoly(m, [np.array([[x - X0, y - Y0] for x, y in s], np.int32)], 1)
    return m.astype(bool)


# murs : un polygone par élément, en mètres
M = np.zeros((H, W), bool)
polys = []
rect = lambda s: [[s[0], s[1]], [s[2], s[1]], [s[2], s[3]], [s[0], s[3]]]
for s in CFG["murs"]:
    if isinstance(s, dict):   # {"r": [x0, y0, x1, y1], "creux": e} : volume creux, murs d'épaisseur e (pixels)
        r, e = s["r"], s["creux"]; inner = [r[0] + e, r[1] + e, r[2] - e, r[3] - e]
        M |= shape_mask(r) & ~shape_mask(inner)
        polys.append({"outer": [L(p) for p in rect(r)], "holes": [[L(p) for p in rect(inner)]]})
        continue
    M |= shape_mask(s)
    polys.append({"outer": [L(p) for p in (rect(s) if isinstance(s[0], (int, float)) else s)], "holes": []})
print(len(polys), "murs et poteaux")

# sols
# (sans sols_defaut : seulement les zones, le reste du cadre garde le papier du plan)
mats = list(dict.fromkeys(([CFG["sols_defaut"]] if CFG.get("sols_defaut") else []) + [z[1] for z in CFG.get("sols_zones", [])]))
room = np.full((H, W), 0 if CFG.get("sols_defaut") else -1, np.int16)
for s, mat in CFG.get("sols_zones", []): room[shape_mask(s)] = mats.index(mat)
room[M] = -1
print("sols (m²):", {m: round(float((room == k).sum()) / PXM ** 2, 1) for k, m in enumerate(mats)})


def save(name, im):
    h, w = im.shape[:2]; im = cv2.resize(im, (2048, round(h * 2048 / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{OUT}/{name}.webp", cv2.cvtColor(im, cv2.COLOR_RGBA2BGRA if im.shape[2] == 4 else cv2.COLOR_RGB2BGR), [cv2.IMWRITE_WEBP_QUALITY, 86])


# calques : traits rouges des plans, recalés morceau par morceau (échelle + décalage)
calques, lights = [], []
for c in CFG.get("calques", []):
    keep = np.zeros((H, W), bool)
    for src in c["sources"]:
        a = rgb(src["plan"]).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
        if c.get("teinte") == "rose":   # cotes en rouge clair
            red = ((r > 200) & (r - g > 40) & (abs(g - b) < 25)).astype(np.uint8)
        else:
            red = ((r > 170) & (g < 120) & (b < 120)).astype(np.uint8)
        zx0, zy0, zx1, zy1 = src["zone"]; z = np.zeros_like(red); z[zy0:zy1, zx0:zx1] = 1; red &= z
        s = src.get("echelle", 1.0); (fx, fy), (tx, ty) = src["de"], src["vers"]
        A = np.array([[s, 0, tx - X0 - s * fx], [0, s, ty - Y0 - s * fy]], np.float32)
        keep |= cv2.warpAffine(red * 255, A, (W, H), flags=cv2.INTER_LINEAR) > 60
        # points lumineux : petits ensembles rouges à peu près carrés, en croix dans un cercle (coins vides)
        if c.get("points") is False: continue
        lab, n = nd.label(red)
        for i, sl in enumerate(nd.find_objects(lab), 1):
            hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
            if not (24 <= ww <= 60 and 0.8 <= ww / max(hh, 1) <= 1.25): continue
            comp = lab[sl] == i; k = max(2, ww // 8)
            if comp[:k, :k].any() or comp[-k:, -k:].any() or comp[:k, -k:].any() or comp[-k:, :k].any(): continue
            cx, cy = (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2
            lights.append(L((tx + s * (cx - fx), ty + s * (cy - fy))))
    keep = nd.binary_dilation(keep, iterations=1)
    o = np.zeros((H, W, 4), np.uint8); o[..., :3] = (205, 40, 40); o[..., 3] = keep.astype(np.uint8) * 255
    save(c["id"], o)
    calques.append({"f": c["id"] + ".webp", "titre": c["titre"], "texte": c["texte"]})
    print("calque", c["id"], int(keep.sum()), "px")
lights += [L(p) for p in CFG.get("points_ajoutes", [])]
print(len(lights), "points lumineux")

save("papier", B)

# texture des sols (2048 px de large), murs en gris clair, ombre de contact au pied des murs
S2 = 2048 / W; W2, H2 = 2048, int(round(H * S2)); cm = 100 / (PXM * S2)
r2 = cv2.resize(room, (W2, H2), interpolation=cv2.INTER_NEAREST)
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
ao = 0.55 * np.exp(-d / 0.16) + 0.22 * np.exp(-d / 0.7); ao[M] = 0
ao = cv2.GaussianBlur(ao.astype(np.float32), (0, 0), 3)
o = np.zeros((H, W, 4), np.uint8); o[..., 3] = np.clip(ao * 255, 0, 255).astype(np.uint8); o[..., :3] = (30, 22, 18)
o = cv2.resize(o, (1024, round(H * 1024 / W)), interpolation=cv2.INTER_AREA)
cv2.imwrite(f"{OUT}/ombre.webp", cv2.cvtColor(o, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 90])


def conv(it):
    o = dict(it)
    for k in ("r", "a", "b", "colonne"):
        if k in o: o[k] = L(o[k][:2]) + L(o[k][2:])
    if "p" in o: o["p"] = L(o["p"])
    return o


windows = []
for x0, y0, x1, y1 in CFG.get("fenetres", []):
    hz = (x1 - x0) >= (y1 - y0)
    windows.append({"x": round((x0 + x1) / 2 - X0, 1) / PXM, "y": round((y0 + y1) / 2 - Y0, 1) / PXM, "w": round(max(x1 - x0, y1 - y0) / PXM, 3), "d": round(min(x1 - x0, y1 - y0) / PXM, 3), "a": 0 if hz else 1.5708})
for w_ in windows: w_["x"], w_["y"] = round(w_["x"], 3), round(w_["y"], 3)
scene = {"w": round(W / PXM, 3), "h": round(H / PXM, 3), "walls": polys, "windows": windows, "doors": [], "lights": lights,
         "mobilier": [conv(it) for it in CFG.get("mobilier", [])], "hauteur": CFG.get("hauteur", 2.5),
         "calques": calques, "sols": CFG.get("texte_sols", "Les sols posés zone par zone, d'après les plans."),
         "titre": CFG.get("titre", "")}
for k in ("texte_murs", "texte_lumiere"):
    if CFG.get(k): scene[k] = CFG[k]
if CFG.get("soleil") is not None: scene["soleil"] = CFG["soleil"]
json.dump(scene, open(f"{OUT}/scene.json", "w"), separators=(",", ":"), ensure_ascii=False)
print("scène", scene["w"], "×", scene["h"], "m,", len(scene["mobilier"]), "meubles")

# aperçu de contrôle : plan pâli, murs, sols, calques, lumières et meubles, quadrillage en pixels du plan de base
vis = (B * 0.35 + 165).astype(np.uint8)
pal = [(230, 200, 140), (170, 200, 230), (200, 160, 240), (150, 220, 160)]
for k in range(len(mats)): vis[room == k] = (np.array(pal[k % 4]) * 0.5 + vis[room == k] * 0.5).astype(np.uint8)
vis[M] = (90, 90, 90)
for c in calques:
    im = cv2.imread(f"{OUT}/{c['f']}", cv2.IMREAD_UNCHANGED); im = cv2.resize(im, (W, H)); vis[im[..., 3] > 100] = (205, 40, 40)
for l in lights: cv2.circle(vis, (int(l[0] * PXM), int(l[1] * PXM)), 14, (255, 200, 0), -1)
for it in scene["mobilier"]:
    for k in ("r", "a", "b", "colonne"):
        if k in it: x0, y0, x1, y1 = [v * PXM for v in it[k]]; cv2.rectangle(vis, (int(x0), int(y0)), (int(x1), int(y1)), (40, 40, 200), 3)
    if "p" in it: cv2.circle(vis, (int(it["p"][0] * PXM), int(it["p"][1] * PXM)), 9, (40, 40, 200), -1)
for x in range((X0 // 100 + 1) * 100, X1, 100): cv2.line(vis, (x - X0, 0), (x - X0, H), (120, 170, 255) if x % 500 else (60, 60, 255), 1)
for y in range((Y0 // 100 + 1) * 100, Y1, 100): cv2.line(vis, (0, y - Y0), (W, y - Y0), (120, 170, 255) if y % 500 else (60, 60, 255), 1)
for x in range((X0 // 500 + 1) * 500, X1, 500): cv2.putText(vis, str(x), (x - X0 + 4, 30), 0, 1.0, (220, 0, 0), 2)
for y in range((Y0 // 500 + 1) * 500, Y1, 500): cv2.putText(vis, str(y), (4, y - Y0 - 6), 0, 1.0, (220, 0, 0), 2)
cv2.imwrite(f"{WORK}/_controle.jpg", cv2.cvtColor(cv2.resize(vis, (min(2000, W), int(H * min(2000, W) / W))), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 82])
