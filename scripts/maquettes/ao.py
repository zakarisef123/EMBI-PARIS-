# Ombre de contact au pied des murs (occlusion ambiante « cuite ») : noir + alpha, posée sur le sol
import sys, cv2, numpy as np
D, OUT = sys.argv[1], sys.argv[2]
PXM = 300 / 25.4 / 50 * 1000
walls = np.load(f"{D}/_walls.npy"); inside = np.load(f"{D}/_inside.npy")
d = cv2.distanceTransform((~walls).astype(np.uint8), cv2.DIST_L2, 5) / PXM   # distance au mur, en mètres
a = 0.55 * np.exp(-d / 0.16) + 0.22 * np.exp(-d / 0.7)
a[walls] = 0; a[~inside] = 0
a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 3)
h, w = a.shape; W2 = 1024; H2 = round(h * W2 / w)
a = cv2.resize(a, (W2, H2), interpolation=cv2.INTER_AREA)
im = np.zeros((H2, W2, 4), np.uint8); im[..., 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
im[..., :3] = (18, 22, 30)
cv2.imwrite(f"{OUT}/ombre.webp", im, [cv2.IMWRITE_WEBP_QUALITY, 90])
print(im.shape, a.max())
