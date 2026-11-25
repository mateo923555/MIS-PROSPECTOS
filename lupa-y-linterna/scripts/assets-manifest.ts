// Manifiesto de recursos visuales. Cada entrada se genera una sola vez y queda en caché en assets/.
// Regenerar uno: `npm run assets -- --force c_wave_a`
export type AssetSpec = {
  id: string;
  out: string; // ruta relativa al proyecto (PNG final)
  prompt: string;
  size: string;
  refs?: string[]; // imágenes de referencia (rutas relativas); se usan con /images/edits
  key?: boolean; // true = fondo magenta que se recorta a PNG transparente
  quality?: "low" | "medium" | "high";
};

export const STYLE =
  "Handmade plasticine clay stop-motion animation look (Aardman-like), visible fingerprints and soft clay surface texture, soft rounded volumes, gentle soft studio lighting. Warm palette: deep petrol teal green, cream, warm yellow, one coral accent. Kid-friendly, simple composition with very few elements. No text, no letters, no logos, no watermark.";

const BASE_CHAR =
  "Using the attached character model sheet as the exact reference, draw ONLY the SAME baby character: identical round clay face, big glossy dark bead eyes, EXACTLY three small curled brown hair tufts, teal corduroy dungarees with two cream buttons and the small yellow flashlight tucked in the chest pocket, cream t-shirt, bare chubby clay feet, same plasticine material and proportions. Full body visible with generous margin around it, centered, no cast shadow on the ground, nothing else in the image. Perfectly flat solid pure magenta (#FF00FF) background with no gradient.";

const SHEET = "public/art/character/ficha-maestra.png";
const MASK =
  "The baby wears a small clay diving mask (coral-red soft frame, clear glass lens, cream strap around the head) over the eyes and nose; the eyes are visible through the lens. The three hair tufts stay visible above the strap.";

export const ASSETS: AssetSpec[] = [
  // ---------- Personaje: poses (Short 001) ----------
  { id: "c_neutral", out: "public/art/character/c_neutral.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view facing the camera, standing relaxed with both arms down at the sides (hands empty), gentle closed-mouth smile.` },
  { id: "c_surprised", out: "public/art/character/c_surprised.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view facing the camera, SURPRISED: eyebrows high, mouth a small round 'o', both arms raised with open hands beside the head.` },
  { id: "c_wave_a", out: "public/art/character/c_wave_a.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view facing the camera, one arm raised high waving hello with an open hand (hand beside the head), the other arm relaxed, happy open smile.` },
  { id: "c_wave_b", out: "public/art/character/c_wave_b.png", refs: [SHEET, "public/art/character/c_wave_a.png"], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Use the second image as the base: EXACTLY the same pose, framing, body and costume as the second image, but the waving hand is tilted outward to the opposite side (wrist rotated, as the second frame of a hello-wave), head tilted very slightly. Keep everything else identical.` },
  { id: "c_chest", out: "public/art/character/c_chest.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view facing the camera, proud and happy, one hand placed on its own chest (pointing at itself), big open smile.` },
  { id: "c_point", out: "public/art/character/c_point.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view, body facing the camera, head turned slightly to the viewer's right, one arm stretched straight out to the viewer's right pointing with the index finger, curious smile.` },

  // ---------- Personaje: poses con visor (Short 002) ----------
  { id: "m_point", out: "public/art/character/m_point.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} ${MASK} Pose: body facing the camera, head turned toward the viewer's right, one arm stretched straight out to the viewer's right pointing with the index finger, curious smile.` },
  { id: "m_look", out: "public/art/character/m_look.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} ${MASK} Pose: front view, leaning forward slightly, one hand held flat above the mask like shading the eyes to look carefully, curious wide eyes, small 'hmm' mouth.` },
  { id: "m_surprised", out: "public/art/character/m_surprised.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} ${MASK} Pose: front view, SURPRISED and delighted: mouth open in a happy round 'o', both arms raised with open hands.` },

  // ---------- Personalidad: curioso · expresivo · cariñoso ----------
  { id: "c_think", out: "public/art/character/c_think.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view, CURIOUS and thoughtful: head tilted a little to one side, one hand with a finger on its chin, eyebrows raised, eyes looking up and to the side, small 'hmm' mouth.` },
  { id: "c_cheer", out: "public/art/character/c_cheer.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view, CELEBRATING a discovery: both arms raised high in the air with open hands, big open laughing mouth, eyes sparkling and happy, little jump with both feet slightly off the ground.` },
  { id: "m_think", out: "public/art/character/m_think.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} ${MASK} Pose: front view, CURIOUS and thoughtful: head tilted to one side, one hand with a finger on its chin, eyebrows raised, small 'hmm' mouth.` },
  { id: "m_cheer", out: "public/art/character/m_cheer.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} ${MASK} Pose: front view, CELEBRATING a discovery: both arms raised high with open hands, big open laughing mouth, joyful, little jump with feet slightly off the ground.` },
  { id: "c_love", out: "public/art/character/c_love.png", refs: [SHEET], key: true, size: "1024x1536", quality: "high",
    prompt: `${BASE_CHAR} Pose: front view, AFFECTIONATE and tender: both hands held together against its cheek, head tilted, soft warm closed-eye smile, rosy cheeks.` },

  // ---------- Escenarios y objetos ----------
  { id: "bg_room", out: "public/art/generated/bg_room.png", size: "1024x1792", quality: "high",
    prompt: `Empty plasticine diorama set seen straight on from the front: a back wall of smooth dusty teal-green clay (#4E8785) with subtle fingerprint texture, meeting a warm light-wood clay floor with soft plank lines at about 40% of the image height (the wall-floor line is perfectly horizontal and straight at exactly 40% from the top). The floor extends toward the camera in gentle perspective. Evenly lit, soft, NOTHING else on the wall or floor: no objects, no furniture, no characters, no shadows. ${STYLE}` },
  { id: "flashlight", out: "public/art/generated/flashlight.png", key: true, size: "1024x1024", quality: "high",
    prompt: `A large chunky yellow (#F6C945) plasticine flashlight standing horizontally on a small round cream clay block, seen from BEHIND and slightly from above (three-quarter back view): the round back cap is nearest the camera and the lens points away from the camera into the distance. Only the flashlight and the block, centered, no cast shadow. ${STYLE} Perfectly flat solid pure magenta (#FF00FF) background, no gradient.` },
  { id: "bg_sea", out: "public/art/generated/bg_sea.png", size: "1024x1792", quality: "high",
    prompt: `Plasticine clay stop-motion underwater diorama, vertical composition, seen straight on from the front, MUTED dusty blues: calm mid-blue water with soft lighter light-shaft glow at the top. Left third: a tall dense clump of green-teal seaweed/algae fronds. Right two thirds: one big rounded gray-brown clay rock with bumpy textured surface and a wide fairly flat face in the middle of the image (about 600px wide in a 1024px wide image), with a few small pebbles. Sandy seabed along the bottom. NO animals, no octopus, no fish, no characters, no text. ${STYLE}` },
  { id: "octopus", out: "public/art/generated/octopus.png", key: true, size: "1536x1024", quality: "high",
    prompt: `A cute plasticine clay octopus seen from the front, coral-pink and warm orange skin with lighter bumpy spots, big round head, two large friendly dark eyes with highlights, all eight arms spread out wide and flat to both sides and downward, clearly separated from each other with curled tips, as if spread flat against a wall. ONLY the octopus: absolutely NO rock, NO seabed, NO plants, NO flowers, NO coral, NO props, NOTHING under or around it; the arms hang freely in the air against the plain background. Centered, full body visible with margin, no cast shadow. ${STYLE} Perfectly flat solid pure magenta (#FF00FF) background, no gradient.` },
];
