#!/usr/bin/env python3
"""Música y efectos ORIGINALES generados por código (síntesis aditiva con numpy).
No usa muestras ni bancos externos: no hay licencias de terceros. Procedencia: este script (AKI Studio / Lupa y Linterna).
Salida: public/audio/music/*.wav y public/audio/sfx/*.wav (44.1 kHz, 16 bit)."""
import os, wave
import numpy as np

SR = 44100
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
rng = np.random.default_rng(7)

def save(path, x, stereo=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("✓", os.path.relpath(path, ROOT), f"{len(x)/SR:.2f}s")

def t(d): return np.arange(int(d * SR)) / SR
def env_exp(n, decay): return np.exp(-np.arange(n) / SR * decay)
def mix_at(buf, snd, at):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(snd)); buf[i:j] += snd[: j - i]

def pluck(f, d=1.2, bright=1.0, amp=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    s = np.sin(2*np.pi*f*tt) + 0.35*bright*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*9) + 0.15*bright*np.sin(2*np.pi*3.01*f*tt)*np.exp(-tt*14)
    e = np.minimum(tt/0.004, 1) * np.exp(-tt*4.2)
    return amp * s * e

def kalimba(f, d=1.6, amp=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    s = np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*f*5.4*tt)*np.exp(-tt*28) + 0.2*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*6)
    return amp * s * np.minimum(tt/0.002, 1) * np.exp(-tt*3.2)

def pad(f, d, amp=1.0, trem=0.0):
    n = int(d * SR); tt = np.arange(n) / SR
    s = np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*f*1.003*tt) + 0.2*np.sin(2*np.pi*2*f*tt)
    e = np.minimum(tt/0.8, 1) * np.minimum((d-tt)/1.0, 1)
    if trem: s = s * (0.8 + 0.2*np.sin(2*np.pi*trem*tt))
    return amp * s * np.clip(e, 0, 1)

def hz(note):  # nombre -> Hz
    names = {"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}
    n = names[note[0]]; o = int(note[-1]); acc = 1 if "#" in note else (-1 if "b" in note else 0)
    return 440.0 * 2 ** (((n + acc) + (o - 4) * 12 - 9) / 12)

def lowpass(x, cutoff):
    a = np.exp(-2*np.pi*cutoff/SR); y = np.zeros_like(x); p = 0.0
    for i, v in enumerate(x):
        p = (1-a)*v + a*p; y[i] = p
    return y

# ------------------------------------------------------------------ MÚSICA
def music_linterna(dur=25.0, bpm=100):
    """Ep. 001 — kalimba tibia, pulso suave. Do mayor pentatónica, progresión C–Am–F–G."""
    buf = np.zeros(int(dur * SR)); beat = 60 / bpm; bar = 4 * beat
    chords = [("C3", ["C4","E4","G4"]), ("A2", ["A3","C4","E4"]), ("F2", ["F3","A3","C4"]), ("G2", ["G3","B3","D4"])]
    penta = ["C5","D5","E5","G5","A5","C6"]
    k = 0; tcur = 0.0
    while tcur < dur - 0.1:
        root, tri = chords[k % 4]
        mix_at(buf, pluck(hz(root), 2.2, 0.6, 0.9), tcur)
        mix_at(buf, pluck(hz(root)*2, 1.2, 0.5, 0.35), tcur + 2*beat)
        for i in range(8):
            if rng.random() < 0.72:
                note = tri[i % 3] if i % 2 == 0 else penta[int(rng.integers(0, len(penta)))]
                if note[-1] == "4": note = note[:-1] + "5"
                mix_at(buf, kalimba(hz(note), 1.4, 0.5 if i % 2 else 0.65), tcur + i * beat / 2)
        mix_at(buf, pad(hz(tri[0]), bar + 0.6, 0.18), tcur)
        tcur += bar; k += 1
    fade = np.minimum(np.arange(len(buf))/SR/0.6, 1) * np.minimum((len(buf)-np.arange(len(buf)))/SR/1.2, 1)
    return buf * fade

def music_mar(dur=26.0, bpm=76):
    """Ep. 002 — mar en calma: colchón con trémolo lento, notas de campanita espaciadas, burbujas."""
    buf = np.zeros(int(dur * SR)); beat = 60 / bpm; bar = 4 * beat
    prog = [("D3", ["D4","F4","A4"]), ("Bb2", ["Bb3","D4","F4"]), ("G2", ["G3","Bb3","D4"]), ("A2", ["A3","C#4","E4"])]
    sc = ["D5","F5","G5","A5","C6","D6"]
    k = 0; tcur = 0.0
    while tcur < dur - 0.1:
        root, tri = prog[k % 4]
        for q, nt in enumerate(tri):
            mix_at(buf, pad(hz(nt), bar + 1.2, 0.20, 0.35 + 0.05*q), tcur)
        mix_at(buf, pad(hz(root), bar + 1.0, 0.38, 0.2), tcur)
        for i in range(4):
            if rng.random() < 0.7:
                mix_at(buf, kalimba(hz(sc[int(rng.integers(0, len(sc)))]), 2.0, 0.36), tcur + i * beat + rng.choice([0, beat/2]))
        tcur += bar; k += 1
    # burbujas suaves
    for _ in range(14):
        f0 = rng.uniform(500, 900); d = 0.12; tt = t(d)
        b = np.sin(2*np.pi*(f0*tt + 2200*tt**2)) * np.exp(-tt*28) * 0.14
        mix_at(buf, b, rng.uniform(1, dur - 1))
    fade = np.minimum(np.arange(len(buf))/SR/1.0, 1) * np.minimum((len(buf)-np.arange(len(buf)))/SR/1.5, 1)
    return buf * fade

# ------------------------------------------------------------------ EFECTOS
def sfx_pop():
    tt = t(0.12); return np.sin(2*np.pi*(380*tt + 3200*tt**2)) * np.exp(-tt*38)
def sfx_tap():
    tt = t(0.10); n = rng.normal(0, 1, len(tt)) * np.exp(-tt*140) * 0.35
    return np.sin(2*np.pi*150*tt) * np.exp(-tt*48) + n
def sfx_click():
    tt = t(0.09); n = rng.normal(0, 1, len(tt)) * np.exp(-tt*220)
    return n * 0.6 + np.sin(2*np.pi*95*tt) * np.exp(-tt*60)
def sfx_whoosh(d=0.9):
    n = rng.normal(0, 1, int(d*SR)); y = lowpass(n, 700)
    tt = t(d); e = np.sin(np.pi * np.clip(tt/d, 0, 1)) ** 2
    y2 = lowpass(rng.normal(0, 1, len(tt)), 2400) * 0.4
    return (y + y2) * e
def sfx_sparkle():
    out = np.zeros(int(1.4*SR))
    for i, n in enumerate(["E6","G6","C7","E7","G7"]):
        mix_at(out, kalimba(hz(n), 0.9, 0.7 - i*0.08), i*0.07)
    return out
def sfx_tada():
    out = np.zeros(int(1.8*SR))
    for i, n in enumerate(["C5","E5","G5","C6"]):
        mix_at(out, pluck(hz(n), 1.4, 1.0, 0.7), i*0.11)
    mix_at(out, pluck(hz("E6"), 1.2, 1.0, 0.5), 0.44)
    return out
def sfx_discover():
    """Revelación: dos notas brillantes ascendentes + destello."""
    out = np.zeros(int(1.6*SR))
    mix_at(out, pluck(hz("G5"), 1.0, 1.0, 0.8), 0.0)
    mix_at(out, pluck(hz("D6"), 1.2, 1.0, 0.8), 0.12)
    mix_at(out, sfx_sparkle()[: int(1.2*SR)] * 0.5, 0.18)
    return out
def sfx_morph(d=1.9):
    """Camuflaje: chasquidos finos (cromatóforos) sobre un soplo suave."""
    out = np.zeros(int(d*SR)); tt = t(d)
    breath = lowpass(rng.normal(0, 1, len(tt)), 1800) * np.sin(np.pi*np.clip(tt/d,0,1))**2 * 0.5
    out += breath
    for _ in range(70):
        at = rng.uniform(0.05, d-0.1) ** 1.0
        f = rng.uniform(1800, 5200); dd = 0.025; x = t(dd)
        mix_at(out, np.sin(2*np.pi*f*x) * np.exp(-x*150) * rng.uniform(0.15, 0.4) * np.sin(np.pi*min(at/d,1)), at)
    return out
def sfx_bubbles():
    out = np.zeros(int(1.2*SR))
    for _ in range(6):
        f0 = rng.uniform(420, 1000); x = t(0.14)
        mix_at(out, np.sin(2*np.pi*(f0*x + 2800*x**2)) * np.exp(-x*26) * 0.7, rng.uniform(0, 0.9))
    return out
def sfx_ding():
    return pluck(hz("A5"), 0.9, 1.0, 0.8)
def sfx_think():
    """Dos notas suaves y pausadas para el momento de pensar."""
    out = np.zeros(int(2.4*SR))
    mix_at(out, kalimba(hz("A5"), 1.2, 0.6), 0.0); mix_at(out, kalimba(hz("E5"), 1.4, 0.6), 0.7)
    mix_at(out, kalimba(hz("A5"), 1.4, 0.45), 1.4)
    return out


# ------------------------------------------------------------------ Teresa y Timoteo
def music_casita(dur=12.0, bpm=84):
    """Pruebas de Teresa y Timoteo — música suave, tierna: Sol mayor, celesta/kalimba + colchón cálido."""
    buf = np.zeros(int(dur * SR)); beat = 60 / bpm; bar = 4 * beat
    prog = [("G2", ["G4","B4","D5"]), ("E2", ["E4","G4","B4"]), ("C3", ["C4","E4","G4"]), ("D3", ["D4","F#4","A4"])]
    mel = ["G5","A5","B5","D6","E6","D6","B5","A5"]
    k = 0; tcur = 0.0
    while tcur < dur - 0.1:
        root, tri = prog[k % 4]
        mix_at(buf, pluck(hz(root), 2.0, 0.5, 0.8), tcur)
        mix_at(buf, pluck(hz(root) * 2, 1.0, 0.4, 0.3), tcur + 2 * beat)
        for i in range(8):
            if i % 2 == 0 or rng.random() < 0.35:
                mix_at(buf, kalimba(hz(mel[(i + k * 3) % len(mel)]), 1.3, 0.5), tcur + i * beat / 2)
        for nt in tri: mix_at(buf, pad(hz(nt), bar + 0.5, 0.12), tcur)
        tcur += bar; k += 1
    fade = np.minimum(np.arange(len(buf))/SR/0.5, 1) * np.minimum((len(buf)-np.arange(len(buf)))/SR/1.2, 1)
    return buf * fade
def sfx_yip():
    """Ladridito tierno: dos chirridos agudos con vibrato suave."""
    out = np.zeros(int(0.5*SR))
    for j, (f0, f1, at) in enumerate([(620, 980, 0.0), (700, 1100, 0.17)]):
        tt = t(0.14); fr = f0 + (f1 - f0) * (tt / 0.14)
        sig = np.sin(2*np.pi*np.cumsum(fr)/SR) + 0.3*np.sin(4*np.pi*np.cumsum(fr)/SR)
        mix_at(out, sig * np.sin(np.pi*np.clip(tt/0.14,0,1)) * 0.8, at)
    return out
def sfx_woof():
    tt = t(0.32); fr = 240 - 90 * (tt / 0.32)
    return (np.sin(2*np.pi*np.cumsum(fr)/SR) + 0.4*np.sin(4*np.pi*np.cumsum(fr)/SR)) * np.exp(-tt*9) * np.minimum(tt/0.01, 1)
def sfx_sniff():
    out = np.zeros(int(0.8*SR))
    for at in (0.0, 0.22, 0.46):
        tt = t(0.14); n = lowpass(rng.normal(0, 1, len(tt)), 2600) * np.sin(np.pi*np.clip(tt/0.14,0,1))**2 * 0.7
        mix_at(out, n, at)
    return out
def sfx_pawstep():
    tt = t(0.09); return (np.sin(2*np.pi*110*tt) * np.exp(-tt*55) + rng.normal(0, 1, len(tt)) * np.exp(-tt*120) * 0.15)
def sfx_heart():
    out = np.zeros(int(0.9*SR))
    mix_at(out, kalimba(hz("E6"), 0.6, 0.6), 0.0); mix_at(out, kalimba(hz("B6"), 0.7, 0.5), 0.12)
    return out

if __name__ == "__main__":
    m = os.path.join(ROOT, "public/audio/music"); s = os.path.join(ROOT, "public/audio/sfx")
    save(f"{m}/linterna.wav", music_linterna())
    save(f"{m}/mar.wav", music_mar())
    for name, fn in [("pop", sfx_pop), ("tap", sfx_tap), ("click", sfx_click), ("whoosh", sfx_whoosh), ("sparkle", sfx_sparkle),
                     ("tada", sfx_tada), ("discover", sfx_discover), ("morph", sfx_morph), ("bubbles", sfx_bubbles), ("ding", sfx_ding), ("think", sfx_think)]:
        save(f"{s}/{name}.wav", fn())
    save(f"{m}/casita.wav", music_casita())
    for name, fn in [("yip", sfx_yip), ("woof", sfx_woof), ("sniff", sfx_sniff), ("pawstep", sfx_pawstep), ("heart", sfx_heart)]:
        save(f"{s}/{name}.wav", fn())
