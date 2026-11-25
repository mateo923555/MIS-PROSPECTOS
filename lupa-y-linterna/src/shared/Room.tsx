import React from "react";
import { Img, staticFile } from "remotion";
import { H, W } from "./theme";

export const ROOM_WALL_Y = 768;
/** Pared verde petróleo + piso de madera (mismo escenario del canal), con la línea pared–piso en y = 768. */
export const RoomBg: React.FC<{ floorBrightness?: number; rug?: { x: number; y: number; rx: number; ry: number } }> = ({ floorBrightness = 0.9, rug }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: -800, width: W, height: ROOM_WALL_Y + 800, overflow: "hidden" }}>
      <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: 2777 }} />
    </div>
    <div style={{ position: "absolute", left: 0, top: ROOM_WALL_Y, width: W, height: H - ROOM_WALL_Y, overflow: "hidden", filter: `brightness(${floorBrightness}) saturate(0.8) hue-rotate(-8deg)` }}>
      <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: -1494, width: W, height: 2646 }} />
    </div>
    {rug && (
      <div style={{ position: "absolute", left: rug.x - rug.rx, top: rug.y - rug.ry, width: rug.rx * 2, height: rug.ry * 2, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 45%, #E9DCC0 0%, #DCCBA8 72%, #C9B48C 100%)", boxShadow: "0 10px 30px rgba(0,0,0,.4), inset 0 0 0 6px rgba(255,255,255,.25)" }} />
    )}
  </>
);
