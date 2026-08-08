#!/usr/bin/env bash
# ==============================================================================
# HECTRON · Polling de tributos en Bitcoin (Termux / Linux / PC)
#
# Consulta las transacciones de ROYAL_WALLET_ADDRESS en Blockstream, detecta
# txids nuevos que aún no se han notificado, y los envía uno por uno al
# webhook (WEBHOOK_URL) con el secreto compartido (WEBHOOK_SECRET). Guarda los
# txids ya notificados en un archivo de estado local para no duplicar avisos.
#
# El webhook vuelve a verificar cada transacción de forma independiente
# contra Blockstream antes de acreditar nada, así que este script solo actúa
# como disparador; nunca es la fuente de verdad.
#
# Uso:
#   export ROYAL_WALLET_ADDRESS=...
#   export WEBHOOK_URL=https://tu-dominio.vercel.app/api/webhook/tribute
#   export WEBHOOK_SECRET=...
#   bash scripts/poll_wallet_tributes.sh
# ==============================================================================
set -euo pipefail

: "${ROYAL_WALLET_ADDRESS:?Define ROYAL_WALLET_ADDRESS antes de ejecutar este script}"
: "${WEBHOOK_URL:?Define WEBHOOK_URL antes de ejecutar este script}"
: "${WEBHOOK_SECRET:?Define WEBHOOK_SECRET antes de ejecutar este script}"

STATE_FILE="${HECTRON_TRIBUTE_STATE_FILE:-$HOME/.hectron_tribute_seen.txt}"
touch "$STATE_FILE"

log() { echo "[poll] $*"; }

log "Consultando transacciones de ${ROYAL_WALLET_ADDRESS} en Blockstream..."

txids="$(curl -sf "https://blockstream.info/api/address/${ROYAL_WALLET_ADDRESS}/txs" |
  python3 -c "import sys, json; print('\n'.join(t['txid'] for t in json.load(sys.stdin)))")"

if [ -z "$txids" ]; then
  log "Sin transacciones para esta dirección."
  exit 0
fi

new_count=0
while IFS= read -r txid; do
  [ -z "$txid" ] && continue

  if grep -qx "$txid" "$STATE_FILE" 2>/dev/null; then
    continue
  fi

  log "Nuevo txid detectado: $txid"

  response_file="$(mktemp)"
  http_code="$(curl -s -o "$response_file" -w '%{http_code}' \
    -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d "{\"txid\":\"$txid\"}")"

  log "Respuesta ($http_code): $(cat "$response_file")"
  rm -f "$response_file"

  case "$http_code" in
    200|202)
      # 200 = acreditado o ya acreditado antes; 202 = válido pero aún sin
      # confirmaciones suficientes. En ambos casos ya no hace falta reintentar
      # este txid en el próximo ciclo salvo que quieras reintentar el 202
      # (elimínalo de este caso si prefieres reintentar hasta que confirme).
      echo "$txid" >> "$STATE_FILE"
      new_count=$((new_count + 1))
      ;;
    *)
      log "Aviso: fallo notificando $txid, se reintentará en el próximo ciclo."
      ;;
  esac
done <<< "$txids"

log "Completado. Nuevos procesados: $new_count"
