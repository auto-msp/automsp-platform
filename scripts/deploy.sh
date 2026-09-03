#!/usr/bin/env bash
# Deploy automsp.cloud: build, then restart the pm2 process serving it.
# The restart is REQUIRED — a running next-server keeps serving prerendered
# HTML that references old hashed chunks after a rebuild (broke CSS 2026-09-03).
set -euo pipefail

cd /root/automsp-platform
PM2_NAME=automsp-platform
LOG=/var/log/automsp-platform.log

echo "[$(date -Is)] deploy: building..." | tee -a "$LOG"
if ! npm run build >>"$LOG" 2>&1; then
  echo "[$(date -Is)] deploy: BUILD FAILED — keeping current process running" | tee -a "$LOG"
  exit 1
fi

echo "[$(date -Is)] deploy: build ok, restarting $PM2_NAME" | tee -a "$LOG"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" --cwd /root/automsp-platform -- start -- -p 80
fi
pm2 save

sleep 4
CSS=$(curl -s --max-time 15 http://127.0.0.1:80/ | grep -oE '/_next/static/chunks/[a-z0-9_-]+\.css' | head -1)
if [ -n "$CSS" ]; then
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:80$CSS")
  echo "[$(date -Is)] deploy: css $CSS -> $STATUS" | tee -a "$LOG"
  [ "$STATUS" = "200" ] || { echo "[$(date -Is)] deploy: CSS CHECK FAILED" | tee -a "$LOG"; exit 1; }
else
  echo "[$(date -Is)] deploy: WARNING no css link found on homepage" | tee -a "$LOG"
fi
echo "[$(date -Is)] deploy: success" | tee -a "$LOG"
