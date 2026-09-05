#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE="${TELEMETRY_FILE:-$ROOT/local-agent/data/telemetry.json}"
mkdir -p "$(dirname "$FILE")"
[ -f "$FILE" ] || printf '[]\n' > "$FILE"
printf 'Telemetry local: %s\n' "$FILE"
printf 'Eventos guardados: '
node -e "const fs=require('fs'); const file=process.argv[1]; try { console.log(JSON.parse(fs.readFileSync(file,'utf8')).length) } catch { console.log(0) }" "$FILE"
