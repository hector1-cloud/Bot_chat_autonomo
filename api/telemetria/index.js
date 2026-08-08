// Endpoint de telemetría ligera para HECTRON.
//
// POST registra un evento (event_type + payload arbitrario) en Neon.
// GET devuelve los últimos eventos, útil para depuración rápida.
// Ambos métodos requieren el mismo secreto compartido que el webhook de
// tributos (header `x-webhook-secret`) para evitar que cualquiera pueda leer
// o inyectar eventos en la tabla.

import { neon } from "@neondatabase/serverless";

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS telemetry_events (
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL DEFAULT 'generic',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      source_ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function requireSecret(req, res) {
  const expected = process.env.WEBHOOK_SECRET;
  const provided = req.headers["x-webhook-secret"];
  if (!expected || !timingSafeEqual(String(provided ?? ""), expected)) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ error: "server_misconfigured" });
  }

  if (!requireSecret(req, res)) {
    return;
  }

  const sql = neon(databaseUrl);
  await ensureTable(sql);

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const eventType = typeof body.event_type === "string" ? body.event_type.slice(0, 64) : "generic";
    const payload = typeof body.payload === "object" && body.payload !== null ? body.payload : {};
    const forwardedFor = req.headers["x-forwarded-for"];
    const sourceIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor ?? "")
      .toString()
      .split(",")[0]
      .trim() || null;
    const userAgent = req.headers["user-agent"] ?? null;

    const [row] = await sql`
      INSERT INTO telemetry_events (event_type, payload, source_ip, user_agent)
      VALUES (${eventType}, ${JSON.stringify(payload)}::jsonb, ${sourceIp}, ${userAgent})
      RETURNING id, created_at
    `;
    return res.status(201).json({ ok: true, id: row.id, created_at: row.created_at });
  }

  if (req.method === "GET") {
    const limit = Math.min(Number.parseInt(req.query?.limit ?? "50", 10) || 50, 200);
    const rows = await sql`
      SELECT id, event_type, payload, source_ip, user_agent, created_at
      FROM telemetry_events
      ORDER BY id DESC
      LIMIT ${limit}
    `;
    return res.status(200).json({ events: rows });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method_not_allowed" });
}
