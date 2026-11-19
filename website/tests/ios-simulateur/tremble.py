# Indice de tremblement d'une bande de l'écran sur toute une vidéo : nombre
# d'inversions de sens (petits allers-retours ≤ 3 pt) entre images
# consécutives, rapporté aux images en mouvement.
import sys, subprocess, numpy as np
f, y0, y1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
W = 330; H = (y1 - y0) // 4
cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", f, "-vf", f"crop=1320:{y1-y0}:0:{y0},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
raw = subprocess.run(cmd, capture_output=True).stdout
n = len(raw) // (W * H)
win = np.hanning(H)[:, None] * np.hanning(W)[None, :]
prev = None; ds = []
for i in range(n):
    a = np.frombuffer(raw[i*W*H:(i+1)*W*H], dtype=np.uint8).reshape(H, W).astype(float)
    if prev is not None:
        if np.abs(a - prev).mean() < 0.4: ds.append(0.0)
        else:
            A = np.fft.fft2((a - a.mean()) * win); B = np.fft.fft2((prev - prev.mean()) * win)
            R = A * np.conj(B); R /= np.abs(R) + 1e-9
            c = np.fft.ifft2(R).real; k = np.unravel_index(np.argmax(c), c.shape)[0]
            if k > H // 2: k -= H
            ds.append(k * 4 / 3)
    prev = a
ds = np.array(ds)
mouv = int((ds != 0).sum())
inv = sum(1 for k in range(1, len(ds)) if ds[k] * ds[k-1] < 0 and abs(ds[k]) <= 3 and abs(ds[k-1]) <= 3)
print(f"{f.split('/')[-1]:14s} bande {y0}-{y1}px : {mouv} images en mouvement, {inv} allers-retours ({100*inv/max(1,mouv):.1f} %)")
