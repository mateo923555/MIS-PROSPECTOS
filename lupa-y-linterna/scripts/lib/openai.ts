// Cliente mínimo de OpenAI (sin SDK). Lee la clave de OPENAI_API_KEY; nunca la guarda ni la imprime.
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const key = () => process.env.OPENAI_API_KEY ?? "proxy-managed"; // en este entorno el proxy inyecta la credencial real

export async function openaiJson(endpoint: string, body: unknown): Promise<any> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI ${endpoint} -> ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

export async function openaiForm(endpoint: string, form: FormData): Promise<any> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`OpenAI ${endpoint} -> ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

export async function openaiBinary(endpoint: string, body: unknown): Promise<Buffer> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI ${endpoint} -> ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return Buffer.from(await res.arrayBuffer());
}

export const fileBlob = (p: string) => new Blob([fs.readFileSync(p)], { type: "image/png" });
export const ensureDir = (p: string) => fs.mkdirSync(path.dirname(p), { recursive: true });
