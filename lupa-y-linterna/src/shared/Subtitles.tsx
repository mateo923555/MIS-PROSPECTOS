import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SAFE, W } from "./theme";
import { pop } from "./motion";
import type { VoiceSegment, VoiceWord } from "./voice";

type Chunk = { words: VoiceWord[]; start: number; end: number };

/** Parte cada segmento en frases cortas (máx. ~3 palabras o hasta una puntuación) para leer de un vistazo. */
export function buildChunks(segments: VoiceSegment[], maxWords = 3): Chunk[] {
  const out: Chunk[] = [];
  for (const seg of segments) {
    let cur: VoiceWord[] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    };
    for (const w of seg.words) {
      cur.push(w);
      if (/[.!?]$/.test(w.text) || cur.length >= maxWords || (/,$/.test(w.text) && cur.length >= 2)) flush();
    }
    flush();
  }
  // evita palabras sueltas muy cortas al final de una frase: se pegan a la anterior si cabe
  return out;
}

export const Subtitles: React.FC<{ segments: VoiceSegment[]; y?: number; maxWords?: number; fontSize?: number }> = ({
  segments, y = SAFE.subtitleY, maxWords = 3, fontSize = 92,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => buildChunks(segments, maxWords), [segments, maxWords]);
  const idx = chunks.findIndex((c) => t >= c.start - 0.05 && t < c.end + 0.45); // cada frase se queda un instante tras terminar
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const s = 0.9 + 0.1 * pop(t, chunk.start - 0.05, 0.22);
  return (
    <div style={{ position: "absolute", left: 60, right: SAFE.right, top: y, height: SAFE.subtitleH, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`, fontFamily: FONT, fontWeight: 700, fontSize, lineHeight: 1.05, textAlign: "center",
          color: C.cream, padding: "14px 34px 18px", borderRadius: 48,
          background: "rgba(18,60,64,0.82)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          maxWidth: W - 60 - SAFE.right, letterSpacing: 0.5,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.02 && t < w.end + 0.1;
          return (
            <span key={i} style={{ color: active ? C.warmYellow : C.cream, marginRight: i < chunk.words.length - 1 ? 22 : 0 }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
