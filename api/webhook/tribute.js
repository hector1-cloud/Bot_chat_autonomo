// Webhook de tributos en Bitcoin.
//
// Re-verifica cada transacción directamente contra Blockstream (nunca confía
// en los datos que envía el cliente), suma solo los outputs que van a
// ROYAL_WALLET_ADDRESS, exige un mínimo de confirmaciones y usa una tabla en
// Neon (Postgres) con `ON CONFLICT DO NOTHING` para garantizar idempotencia
// real entre invocaciones serverless (una variable en memoria no sirve aquí:
// cada invocación puede ejecutarse en un proceso distinto).
//
// Requiere las variables de entorno:
//   DATABASE_URL          (ya provisionada por Neon)
//   ROYAL_WALLET_ADDRESS  (ya configurada)
//   WEBHOOK_SECRET        (secreto compartido, ver header x-webhook-secret)
//   MIN_CONFIRMATIONS     (opcional, por defecto 1)
//   CALCITA_RATIO         (opcional, por defecto 0.001)

import { neon } from "@neondatabase/serverless";

const BLOCKSTREAM_API = "https://blockstream.info/api";
const TXID_PATTERN = /^[0-9a-fA-F]{64}$/;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Blockstream respondió ${res.status} para ${url}`);
  }
  return res.json();
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS tribute_payments (
      txid TEXT PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      amount_sats BIGINT NOT NULL,
      confirmations INTEGER NOT NULL,
      credited_amount NUMERIC NOT NULL,
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const expectedSecret = process.env.WEBHOOK_SECRET;
  const providedSecret = req.headers["x-webhook-secret"];
  if (!expectedSecret || !timingSafeEqual(String(providedSecret ?? ""), expectedSecret)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const walletAddress = process.env.ROYAL_WALLET_ADDRESS;
  const databaseUrl = process.env.DATABASE_URL;
  if (!walletAddress || !databaseUrl) {
    return res.status(500).json({ error: "server_misconfigured" });
  }

  const minConfirmations = Number.parseInt(process.env.MIN_CONFIRMATIONS ?? "1", 10);
  const ratio = Number.parseFloat(process.env.CALCITA_RATIO ?? "0.001");

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const txid = typeof body.txid === "string" ? body.txid.trim().toLowerCase() : "";
  if (!TXID_PATTERN.test(txid)) {
    return res.status(400).json({ error: "invalid_txid" });
  }

  const sql = neon(databaseUrl);

  try {
    await ensureTable(sql);

    const [tx, status, tipHeight] = await Promise.all([
      fetchJson(`${BLOCKSTREAM_API}/tx/${txid}`),
      fetchJson(`${BLOCKSTREAM_API}/tx/${txid}/status`),
      fetchJson(`${BLOCKSTREAM_API}/blocks/tip/height`),
    ]);

    if (!status.confirmed) {
      return res.status(202).json({ credited: false, reason: "unconfirmed" });
    }

    const confirmations = tipHeight - status.block_height + 1;
    if (confirmations < minConfirmations) {
      return res.status(202).json({
        credited: false,
        reason: "insufficient_confirmations",
        confirmations,
        required: minConfirmations,
      });
    }

    const amountSats = (tx.vout ?? [])
      .filter((out) => out.scriptpubkey_address === walletAddress)
      .reduce((sum, out) => sum + out.value, 0);

    if (amountSats <= 0) {
      return res.status(400).json({ error: "no_matching_output", wallet: walletAddress });
    }

    const creditedAmount = amountSats * ratio;

    const inserted = await sql`
      INSERT INTO tribute_payments (txid, wallet_address, amount_sats, confirmations, credited_amount)
      VALUES (${txid}, ${walletAddress}, ${amountSats}, ${confirmations}, ${creditedAmount})
      ON CONFLICT (txid) DO NOTHING
      RETURNING txid
    `;

    if (inserted.length === 0) {
      return res.status(200).json({ credited: false, reason: "already_credited", txid });
    }

    return res.status(200).json({
      credited: true,
      txid,
      wallet: walletAddress,
      amount_sats: amountSats,
      confirmations,
      credited_amount: creditedAmount,
    });
  } catch (error) {
    console.error("[v0] tribute webhook verification failed", error);
    return res.status(502).json({ error: "verification_failed", message: error.message });
  }
}
