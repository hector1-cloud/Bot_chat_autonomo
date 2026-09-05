#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ -f .env ]; then set -a; . ./.env; set +a; fi
MODE="${MODE:-dev}"
case "$MODE" in
  overlay) exec npm run start:overlay ;;
  agent) exec npm run start:agent ;;
  *) exec npm run dev ;;
esac
