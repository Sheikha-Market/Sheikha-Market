#!/usr/bin/env bash
set -euo pipefail

MODE="apply"
if [[ "${1:-}" == "--plan" ]]; then
  MODE="plan"
fi

ADMIN_USER="${SHEIKHA_ADMIN_USER:-sheikhaops}"
ADMIN_PUBKEY="${SHEIKHA_ADMIN_PUBKEY:-}"
SSH_ALLOWED_CIDRS="${SHEIKHA_SSH_ALLOWED_CIDRS:-}"
SSH_PORT="${SHEIKHA_SSH_PORT:-22}"

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "❌ يجب تشغيل السكربت بصلاحية root"
    exit 1
  fi
}

run_or_print() {
  if [[ "$MODE" == "plan" ]]; then
    echo "PLAN: $*"
  else
    eval "$@"
  fi
}

write_file() {
  local target="$1"
  local content="$2"
  if [[ "$MODE" == "plan" ]]; then
    echo "PLAN: write $target"
    return
  fi
  mkdir -p "$(dirname "$target")"
  printf '%s\n' "$content" > "$target"
}

require_root

echo "== SHEIKHA VPS HARDENING =="
echo "mode=$MODE"
echo "admin_user=$ADMIN_USER"
echo "ssh_port=$SSH_PORT"

if [[ -z "$ADMIN_PUBKEY" ]]; then
  echo "⚠️ SHEIKHA_ADMIN_PUBKEY غير مضبوط — لن يتم تثبيت مفتاح SSH جديد"
fi

run_or_print "apt-get update"
run_or_print "DEBIAN_FRONTEND=noninteractive apt-get install -y ufw fail2ban unattended-upgrades auditd rsyslog curl ca-certificates"

if ! id "$ADMIN_USER" >/dev/null 2>&1; then
  run_or_print "adduser --disabled-password --gecos '' '$ADMIN_USER'"
fi
run_or_print "usermod -aG sudo '$ADMIN_USER'"

if [[ -n "$ADMIN_PUBKEY" ]]; then
  run_or_print "install -d -m 700 -o '$ADMIN_USER' -g '$ADMIN_USER' /home/$ADMIN_USER/.ssh"
  if [[ "$MODE" == "plan" ]]; then
    echo "PLAN: install authorized_keys for $ADMIN_USER"
  else
    printf '%s\n' "$ADMIN_PUBKEY" > "/home/$ADMIN_USER/.ssh/authorized_keys"
    chown "$ADMIN_USER:$ADMIN_USER" "/home/$ADMIN_USER/.ssh/authorized_keys"
    chmod 600 "/home/$ADMIN_USER/.ssh/authorized_keys"
  fi
fi

write_file "/etc/ssh/sshd_config.d/99-sheikha-hardening.conf" "Port ${SSH_PORT}
Protocol 2
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
UsePAM yes
PermitRootLogin no
PubkeyAuthentication yes
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 30
MaxAuthTries 3
AllowUsers ${ADMIN_USER}"

write_file "/etc/fail2ban/jail.d/sheikha-sshd.local" "[sshd]
enabled = true
backend = systemd
port = ${SSH_PORT}
maxretry = 5
findtime = 10m
bantime = 1h"

write_file "/etc/apt/apt.conf.d/20auto-upgrades" "APT::Periodic::Update-Package-Lists \"1\";
APT::Periodic::Unattended-Upgrade \"1\";"

write_file "/etc/systemd/timesyncd.conf.d/sheikha.conf" "[Time]
NTP=time.cloudflare.com time.google.com ntp.ubuntu.com
FallbackNTP=pool.ntp.org"

run_or_print "systemctl enable --now systemd-timesyncd"
run_or_print "timedatectl set-timezone UTC"

run_or_print "ufw default deny incoming"
run_or_print "ufw default allow outgoing"
if [[ -n "$SSH_ALLOWED_CIDRS" ]]; then
  IFS=',' read -ra CIDRS <<< "$SSH_ALLOWED_CIDRS"
  for cidr in "${CIDRS[@]}"; do
    run_or_print "ufw allow from ${cidr} to any port ${SSH_PORT} proto tcp"
  done
else
  run_or_print "ufw allow ${SSH_PORT}/tcp"
fi
run_or_print "ufw allow 80/tcp"
run_or_print "ufw allow 443/tcp"
run_or_print "ufw --force enable"

run_or_print "systemctl enable --now rsyslog"
run_or_print "systemctl enable --now auditd"
run_or_print "systemctl enable --now fail2ban"
run_or_print "systemctl restart ssh"
run_or_print "systemctl restart fail2ban"

echo "✅ اكتملت تقسية VPS"
echo "ℹ️ غيّر كلمة مرور root يدوياً فوراً إذا لم تكن غُيّرت بعد"
