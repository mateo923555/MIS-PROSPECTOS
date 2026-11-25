import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { VoiceData } from "./voice";

/** Pista de voz: cada segmento se ubica donde empieza su voz (ver scripts/gen-voice.ts). */
export const VoiceTrack: React.FC<{ voice: VoiceData }> = ({ voice }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {voice.segments.filter((s) => s.file).map((s) => {
        const from = Math.round(s.offset * fps);
        const startFrom = from < 0 ? -from : 0;
        return (
          <Sequence key={s.id} from={Math.max(0, from)} durationInFrames={Math.ceil(s.duration * fps) + 2} name={`voz-${s.id}`}>
            <Audio src={staticFile(s.file!)} startFrom={startFrom} volume={1} />
          </Sequence>
        );
      })}
    </>
  );
};

/** Música baja con "ducking": baja un poco mientras habla la narración y sale con fundido al final. */
export const MusicTrack: React.FC<{ src: string; voice?: VoiceData; base?: number; duckTo?: number; totalSec: number }> = ({
  src, voice, base = 0.2, duckTo = 0.11, totalSec,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      src={staticFile(src)}
      volume={(f) => {
        const t = f / fps;
        let v = base;
        if (voice) {
          for (const s of voice.segments) if (t > s.voiceStart - 0.15 && t < s.voiceEnd + 0.25) v = duckTo;
        }
        const fadeIn = Math.min(1, t / 0.6);
        const fadeOut = Math.min(1, Math.max(0, (totalSec - 0.25 - t) / 1.0));
        return v * fadeIn * fadeOut;
      }}
    />
  );
};

export type Sfx = { at: number; name: string; volume?: number };
export const SfxTrack: React.FC<{ cues: Sfx[] }> = ({ cues }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * fps)} name={`sfx-${c.name}`}>
          <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.volume ?? 0.6} />
        </Sequence>
      ))}
    </>
  );
};
