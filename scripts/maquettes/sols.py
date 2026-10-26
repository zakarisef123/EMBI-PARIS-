# Sols réalistes d'après les plans : point de Hongrie (chêne), parquet droit, travertin 60x120
import sys, numpy as np, cv2
D = sys.argv[1]; OUT = sys.argv[2]; MAT = sys.argv[3].split(",")   # matière par pièce, dans l'ordre des pièces
room = np.load(f"{D}/_room.npy"); H0, W0 = room.shape
PXM = 300 / 25.4 / 50 * 1000
S = 2048 / W0; W, H = 2048, int(round(H0 * S))
r = cv2.resize(room.astype(np.int16), (W, H), interpolation=cv2.INTER_NEAREST)
cm = 100 / (PXM * S)                                   # centimètres par pixel de texture
Y, X = np.mgrid[0:H, 0:W].astype(np.float32) * cm
rng = np.random.default_rng(7)
def noise(scale_cm, seed):
    g = np.random.default_rng(seed).random((int(H * cm / scale_cm) + 3, int(W * cm / scale_cm) + 3)).astype(np.float32)
    return cv2.resize(g, (W, H), interpolation=cv2.INTER_CUBIC)
def h(*a):  # hachage → [0,1)
    v = np.zeros_like(a[0], dtype=np.float64)
    for i, x in enumerate(a): v = v + x.astype(np.float64) * (12.9898 + 31.7 * i)
    return (np.sin(v) * 43758.5453) % 1
fine = noise(0.6, 3); mid = noise(4, 5)
def oak(tone, grain):
    base = np.array([186, 140, 92], np.float32) / 255
    c = base[None, None, :] * (0.88 + 0.2 * tone[..., None]) * (0.965 + 0.05 * grain[..., None]) * (0.97 + 0.06 * mid[..., None])
    return c
def hongrie():
    L, w = 60.0, 9.0; Wc = L * 0.7071
    k = np.floor(X / Wc); u = X - k * Wc; s = np.where(k % 2 == 0, 1.0, -1.0)
    q = (Y + s * u) / (w * 1.4142); n = np.floor(q); fr = q - n
    along = (u - s * Y) * 0.7071
    tone = h(k, n)
    grain = 0.5 + 0.5 * np.sin(fr * 7 + 2.0 * np.sin(along * 0.05 + tone * 40) + fine * 1.5)
    c = oak(tone, grain)
    joint = (fr < 0.035) | (fr > 0.985) | (u < 0.25) | (u > Wc - 0.25)
    c[joint] *= 0.72
    return c
def droit():
    w = 14.0; row = np.floor(Y / w); fr = Y / w - row
    off = h(row, row * 0 + 3) * 90; Lp = 80 + 40 * h(row, row * 0 + 5)
    xx = X + off; seg = np.floor(xx / 110); fx = xx / 110 - seg
    tone = h(row, seg)
    grain = 0.5 + 0.5 * np.sin(fr * 7 + 2 * np.sin(xx * 0.04 + tone * 30) + fine * 1.5)
    c = oak(tone, grain)
    c[(fr < 0.03) | (fr > 0.98) | (fx < 0.004)] *= 0.72
    return c
def travertin():
    tw, th = 60.0, 120.0
    i = np.floor(X / tw); j = np.floor(Y / th); fx = X / tw - i; fy = Y / th - j
    tone = h(i, j)
    vein = noise(25, 11) * 0.6 + noise(6, 13) * 0.4
    bands = 0.5 + 0.5 * np.sin(Y * 0.35 + vein * 6 + tone * 20) * (0.4 + 0.6 * noise(30, 23))
    base = np.array([214, 198, 170], np.float32) / 255
    c = base[None, None, :] * (0.95 + 0.07 * tone[..., None]) * (0.95 + 0.06 * bands[..., None]) * (0.96 + 0.06 * noise(40, 29)[..., None]) * (0.97 + 0.05 * fine[..., None])
    pores = (noise(0.8, 17) > 0.86) & (noise(3, 19) > 0.55); c[pores] *= 0.8
    joint = (fx < 0.004) | (fx > 0.996) | (fy < 0.002) | (fy > 0.998)
    c[joint] = np.array([0.80, 0.78, 0.74])
    return c
TEX = {"hongrie": hongrie(), "droit": droit(), "travertin": travertin()}
out = np.zeros((H, W, 4), np.float32)
for k, m in enumerate(MAT):
    sel = r == k; out[sel, :3] = TEX[m][sel]; out[sel, 3] = 1
wall = cv2.resize(np.load(f"{D}/_walls.npy").astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST) > 0
out[wall, :3] = 0.85; out[wall, 3] = 1          # sous les murs (caché)
# légère ombre de contact le long des murs
cont = cv2.GaussianBlur(wall.astype(np.float32), (0, 0), 6)
out[..., :3] *= (1 - 0.35 * np.clip(cont, 0, 1))[..., None]
img = (np.clip(out, 0, 1) * 255).astype(np.uint8)
cv2.imwrite(f"{OUT}/sol.png", cv2.cvtColor(img, cv2.COLOR_RGBA2BGRA))
cv2.imwrite(f"{D}/_sol-apercu.jpg", cv2.cvtColor(img[..., :3], cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85])
print("sol", W, H, "cm/px", round(cm, 3))
