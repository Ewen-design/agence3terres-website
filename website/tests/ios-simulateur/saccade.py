# Saccades du défilement : pendant les glissés, part des images où le contenu
# NE bouge PAS alors que celles d'avant et d'après bougent (arrêt puis saut).
import sys, subprocess, numpy as np
f = sys.argv[1]; y0, y1 = int(sys.argv[2]), int(sys.argv[3])
W = 330; H = (y1 - y0) // 4
raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", f, "-vf", f"crop=1320:{y1-y0}:0:{y0},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
n = len(raw) // (W * H)
win = np.hanning(H)[:, None] * np.hanning(W)[None, :]
prev = None; ds = []
for i in range(n):
    a = np.frombuffer(raw[i*W*H:(i+1)*W*H], dtype=np.uint8).reshape(H, W).astype(float)
    if prev is not None:
        A = np.fft.fft2((a - a.mean()) * win); B = np.fft.fft2((prev - prev.mean()) * win)
        R = A * np.conj(B); R /= np.abs(R) + 1e-9
        k = np.unravel_index(np.argmax(np.fft.ifft2(R).real), (H, W))[0]
        if k > H // 2: k -= H
        ds.append(abs(k * 4 / 3))
    prev = a
ds = np.array(ds)
mov = ds > 0.5
arrets = sum(1 for k in range(1, len(ds) - 1) if not mov[k] and mov[k-1] and mov[k+1])
print(f"{f.split('/')[-1]:16s} {int(mov.sum())} images en mouvement, {arrets} arrêts isolés ({100*arrets/max(1,mov.sum()):.1f} %), pas max {ds.max():.0f} pt")
