export type VoiceWord = { text: string; start: number; end: number };
export type VoiceSegment = {
  id: string; text: string; file: string | null; // null = sin audio (modo --estimate)
  offset: number; // segundo del episodio donde empieza el archivo (puede ser <0 si la voz arranca pegada)
  duration: number; voiceStart: number; voiceEnd: number; words: VoiceWord[];
};
export type VoiceData = { model: string; voice: string; segments: VoiceSegment[] };
