#!/usr/bin/env bash

# ─────────────────────────────────────────────
# Sheikha Server Access Script
# ─────────────────────────────────────────────

SERVER_IP="31.97.190.74"
SERVER_USER="root"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "        SHEIKHA SERVER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Connecting to: ${SERVER_USER}@${SERVER_IP}"
echo

ssh ${SERVER_USER}@${SERVER_IP}
