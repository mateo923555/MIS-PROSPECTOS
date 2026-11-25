import { continueRender, delayRender, staticFile } from "remotion";

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fuentes");
  Promise.all(
    [600, 700].map((w) =>
      new FontFace("Fredoka", `url(${staticFile(`fonts/fredoka-latin-${w}-normal.woff2`)})`, { weight: String(w) })
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .catch((e) => console.warn("fuentes:", e))
    .finally(() => continueRender(handle));
};
