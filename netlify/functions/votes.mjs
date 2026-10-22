// Encuestas en vivo del módulo. Guarda un voto por dispositivo y encuesta en Netlify Blobs.
// Cada voto es una clave propia (v/<encuesta>/<ronda>/<votante>__<opción>), así los votos
// simultáneos nunca se pisan entre sí.
import { getStore } from "@netlify/blobs";

const POLL = /^[a-z0-9_]{1,40}$/;
const VOTER = /^[A-Za-z0-9]{8,40}$/;
const MAX_OPTIONS = 20;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const store = () => getStore({ name: "encuestas", consistency: "strong" });

async function getRounds(s) {
  return (await s.get("config/rounds", { type: "json" })) || {};
}

async function tally(s, poll, round) {
  const { blobs } = await s.list({ prefix: `v/${poll}/${round}/` });
  const seen = new Set();
  const counts = {};
  let total = 0;
  for (const { key } of blobs) {
    const [voter, option] = key.slice(`v/${poll}/${round}/`.length).split("__");
    if (!voter || !/^\d+$/.test(option || "") || seen.has(voter)) continue;
    seen.add(voter);
    counts[option] = (counts[option] || 0) + 1;
    total++;
  }
  return { round, counts, total };
}

function profeKey() {
  try { return globalThis.Netlify?.env?.get("PROFE_KEY") || process.env.PROFE_KEY || ""; }
  catch { return process.env.PROFE_KEY || ""; }
}

export default async (req) => {
  const s = store();

  if (req.method === "GET") {
    const ids = (new URL(req.url).searchParams.get("polls") || "")
      .split(",").filter((x) => POLL.test(x)).slice(0, 12);
    const rounds = await getRounds(s);
    const tallies = {};
    await Promise.all(ids.map(async (id) => { tallies[id] = await tally(s, id, rounds[id] || 0); }));
    return json({ tallies });
  }

  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Solicitud inválida" }, 400); }

  // Acciones del profesor
  if (body.action === "check" || body.action === "reset") {
    const key = profeKey();
    if (!key || req.headers.get("x-profe-key") !== key) return json({ error: "Clave de profesor inválida" }, 401);
    if (body.action === "check") return json({ ok: true });
    if (!POLL.test(body.poll || "")) return json({ error: "Encuesta inválida" }, 400);
    const rounds = await getRounds(s);
    rounds[body.poll] = (rounds[body.poll] || 0) + 1;
    await s.setJSON("config/rounds", rounds);
    return json({ tally: await tally(s, body.poll, rounds[body.poll]) });
  }

  // Voto
  const { poll, voter, option } = body;
  if (!POLL.test(poll || "")) return json({ error: "Encuesta inválida" }, 400);
  if (!VOTER.test(voter || "")) return json({ error: "Votante inválido" }, 400);
  if (!Number.isInteger(option) || option < 0 || option >= MAX_OPTIONS) return json({ error: "Opción inválida" }, 400);

  const rounds = await getRounds(s);
  const round = rounds[poll] || 0;
  const prefix = `v/${poll}/${round}/${voter}__`;
  const { blobs: previous } = await s.list({ prefix });
  await s.set(prefix + option, "1");
  await Promise.all(previous.filter((b) => b.key !== prefix + option).map((b) => s.delete(b.key)));
  return json({ tally: await tally(s, poll, round) });
};

export const config = { path: "/api/votes" };
