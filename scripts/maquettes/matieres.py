# Textures de sol réalistes (vue de dessus), en couleurs 0..1 : parquet point de Hongrie, parquet droit,
# travertin 60x120, carrelage grand format, mosaïque ronde, moquette. cm = centimètres par pixel de texture.
import numpy as np, cv2


def textures(W, H, cm, noms):
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32) * cm

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
        return base[None, None, :] * (0.88 + 0.2 * tone[..., None]) * (0.965 + 0.05 * grain[..., None]) * (0.97 + 0.06 * mid[..., None])

    def hongrie():
        L, w = 60.0, 9.0; Wc = L * 0.7071
        k = np.floor(X / Wc); u = X - k * Wc; s = np.where(k % 2 == 0, 1.0, -1.0)
        q = (Y + s * u) / (w * 1.4142); n = np.floor(q); fr = q - n
        along = (u - s * Y) * 0.7071
        tone = h(k, n)
        grain = 0.5 + 0.5 * np.sin(fr * 7 + 2.0 * np.sin(along * 0.05 + tone * 40) + fine * 1.5)
        c = oak(tone, grain)
        c[(fr < 0.035) | (fr > 0.985) | (u < 0.25) | (u > Wc - 0.25)] *= 0.72
        return c

    def droit():
        w = 14.0; row = np.floor(Y / w); fr = Y / w - row
        off = h(row, row * 0 + 3) * 90
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
        c[(noise(0.8, 17) > 0.86) & (noise(3, 19) > 0.55)] *= 0.8
        c[(fx < 0.004) | (fx > 0.996) | (fy < 0.002) | (fy > 0.998)] = np.array([0.80, 0.78, 0.74])
        return c

    def carrelage():  # grand format 60x60, grès cérame clair
        t = 60.0; i = np.floor(X / t); j = np.floor(Y / t); fx = X / t - i; fy = Y / t - j
        tone = h(i, j)
        base = np.array([226, 223, 216], np.float32) / 255
        c = base[None, None, :] * (0.975 + 0.035 * tone[..., None]) * (0.97 + 0.04 * noise(12, 31)[..., None]) * (0.985 + 0.02 * fine[..., None])
        c[(fx < 0.005) | (fx > 0.995) | (fy < 0.005) | (fy > 0.995)] = np.array([0.72, 0.71, 0.69])
        return c

    def mosaique():  # mosaïque ronde 22 mm, blanc cassé, joints gris clair
        d = 2.4; i = np.floor(X / d); j = np.floor(Y / d)
        fx = X / d - i - 0.5; fy = Y / d - j - 0.5
        disc = fx * fx + fy * fy < 0.2
        c = np.empty((H, W, 3), np.float32); c[:] = np.array([0.80, 0.80, 0.78])
        tone = h(i, j)
        c[disc] = (np.array([0.95, 0.94, 0.92])[None, :] * (0.97 + 0.04 * tone[disc][:, None]))
        return c

    def moquette():  # moquette bouclée, beige
        base = np.array([196, 184, 166], np.float32) / 255
        loops = noise(0.35, 41) * 0.6 + noise(1.2, 43) * 0.4
        return base[None, None, :] * (0.9 + 0.12 * loops[..., None]) * (0.97 + 0.05 * noise(30, 47)[..., None])

    def droit_v():  # lames dans l'autre sens
        nonlocal X, Y
        X, Y = Y, X
        try: return droit()
        finally: X, Y = Y, X

    def carreau_vert():  # petits carreaux 10x10 vert sombre émaillé, joints clairs
        t = 10.0; i = np.floor(X / t); j = np.floor(Y / t); fx = X / t - i; fy = Y / t - j
        tone = h(i, j)
        base = np.array([62, 84, 70], np.float32) / 255
        c = base[None, None, :] * (0.9 + 0.2 * tone[..., None]) * (0.97 + 0.05 * fine[..., None])
        c[(fx < 0.04) | (fx > 0.96) | (fy < 0.04) | (fy > 0.96)] = np.array([0.78, 0.78, 0.74])
        return c

    fn = {"hongrie": hongrie, "carreau_vert": carreau_vert, "droit": droit, "droit_v": droit_v, "travertin": travertin, "carrelage": carrelage, "mosaique": mosaique, "moquette": moquette}
    return {n: fn[n]() for n in set(noms)}
