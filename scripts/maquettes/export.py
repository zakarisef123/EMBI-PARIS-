# Écrit les données de la maquette dans le site : textures en webp, scène + mobilier en JSON (mètres)
import sys, json, cv2, numpy as np
D, OUT = sys.argv[1], sys.argv[2]
PXM = 300 / 25.4 / 50 * 1000; C = 2 / PXM          # 1 px de l'image de contrôle = C mètres
sc = json.load(open(f"{D}/out/scene.json"))
def wr(src, dst, q=80):
    im = cv2.imread(f"{D}/out/{src}", cv2.IMREAD_UNCHANGED)
    h, w = im.shape[:2]; im = cv2.resize(im, (2048, round(h * 2048 / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{OUT}/{dst}", im, [cv2.IMWRITE_WEBP_QUALITY, q])
wr("papier.png", "papier.webp", 82); wr("demolition.png", "demolition.webp", 90); wr("electricite.png", "electricite.webp", 90); wr("sol.png", "sol.webp", 86)
R = lambda x0, y0, x1, y1: [round(x0 * C, 3), round(y0 * C, 3), round(x1 * C, 3), round(y1 * C, 3)]
P = lambda x, y: [round(x * C, 3), round(y * C, 3)]
F = [
  {"t": "cheminee", "r": R(165, 238, 222, 480), "face": "e"},
  {"t": "cheminee", "r": R(1097, 327, 1135, 445), "face": "w"},
  {"t": "cheminee", "r": R(1430, 560, 1545, 600), "face": "n"},
  {"t": "cuisine", "r": R(225, 566, 588, 633), "colonne": R(588, 566, 640, 633), "face": "n"},
  {"t": "table", "r": R(345, 233, 551, 335)},
  *[{"t": "chaise", "p": P(x, y), "face": f} for x, y, f in [(404, 212, "s"), (491, 212, "s"), (409, 356, "n"), (489, 356, "n"), (324, 284, "e"), (572, 284, "w")]],
  {"t": "tapis", "r": R(790, 280, 1050, 470)},
  {"t": "canape", "a": R(757, 265, 857, 523), "b": R(757, 423, 1017, 523), "dos": ["w", "s"]},
  {"t": "table_basse", "r": R(880, 320, 960, 380)},
  {"t": "plante", "p": P(1085, 190)},
  {"t": "plante", "p": P(200, 180)},
  {"t": "lit", "r": R(1430, 226, 1613, 416), "tete": "e"},
  {"t": "armoire", "r": R(1613, 143, 1683, 226), "h": 2.2, "m": "bleu"},
  {"t": "armoire", "r": R(1613, 416, 1683, 500), "h": 2.2, "m": "bleu"},
  {"t": "armoire", "r": R(1613, 226, 1640, 416), "h": 1.05, "m": "bleu"},
  {"t": "armoire", "r": R(1613, 226, 1683, 416), "h": 0.45, "z": 1.75, "m": "bleu"},
  {"t": "bureau", "r": R(1183, 180, 1237, 298)}, {"t": "chaise", "p": P(1252, 239), "face": "w"},
  {"t": "lit_superpose", "r": R(257, 676, 467, 773)},
  {"t": "bureau", "r": R(246, 798, 314, 893)}, {"t": "chaise", "p": P(330, 846), "face": "w"},
  {"t": "armoire", "r": R(314, 906, 386, 1116), "h": 2.2, "m": "blanc"},
  {"t": "armoire", "r": R(250, 906, 314, 1150), "h": 0.45, "m": "chene"},
  {"t": "armoire", "r": R(683, 783, 763, 868), "h": 2.1, "m": "blanc"},
  {"t": "vasque", "r": R(643, 978, 703, 1073), "face": "e"},
  {"t": "armoire", "r": R(643, 1073, 703, 1203), "h": 2.1, "m": "chene"},
  {"t": "baignoire", "r": R(871, 871, 951, 1038)},
  {"t": "douche", "r": R(859, 1058, 951, 1203), "verre": "w"},
  {"t": "armoire", "r": R(963, 778, 1035, 1058), "h": 2.3, "m": "greige"},
  {"t": "armoire", "r": R(865, 778, 961, 858), "h": 2.3, "m": "greige"},
  {"t": "wc", "p": P(1118, 1150), "face": "w"},
  {"t": "lave_mains", "r": R(958, 1156, 990, 1190)},
]
sc["mobilier"] = F
sc["balcon"] = {"r": R(112, 58, 1720, 112)}
sc["hauteur"] = 2.4
json.dump(sc, open(f"{OUT}/scene.json", "w"), separators=(",", ":"))
print("ok", len(F), "meubles", sc["w"], sc["h"])
