#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

mkdir -p logs

# تحديث الأذونات التنفيذية
chmod +x scripts/sheikha-daily-health-auth-adc.sh scripts/sheikha-monthly-renewal-secure.sh

if ! command -v crontab >/dev/null 2>&1; then
    if command -v systemctl >/dev/null 2>&1; then
	mkdir -p "$HOME/.config/systemd/user"

	cat > "$HOME/.config/systemd/user/sheikha-daily-watch.service" <<EOF
[Unit]
Description=Sheikha Daily Watch (Health+Auth+ADC)

[Service]
Type=oneshot
WorkingDirectory=${ROOT_DIR}
ExecStart=/usr/bin/env bash ${ROOT_DIR}/scripts/sheikha-daily-health-auth-adc.sh
EOF

	cat > "$HOME/.config/systemd/user/sheikha-daily-watch.timer" <<EOF
[Unit]
Description=Run Sheikha daily watch every day at 06:30

[Timer]
OnCalendar=*-*-* 06:30:00
Persistent=true
Unit=sheikha-daily-watch.service

[Install]
WantedBy=timers.target
EOF

	cat > "$HOME/.config/systemd/user/sheikha-monthly-renewal.service" <<EOF
[Unit]
Description=Sheikha Monthly Secure Renewal

[Service]
Type=oneshot
WorkingDirectory=${ROOT_DIR}
ExecStart=/usr/bin/env bash ${ROOT_DIR}/scripts/sheikha-monthly-renewal-secure.sh
EOF

	cat > "$HOME/.config/systemd/user/sheikha-monthly-renewal.timer" <<EOF
[Unit]
Description=Run Sheikha monthly secure renewal on day 1 at 07:00

[Timer]
OnCalendar=*-*-01 07:00:00
Persistent=true
Unit=sheikha-monthly-renewal.service

[Install]
WantedBy=timers.target
EOF

	cat > "$HOME/.config/systemd/user/sheikha-contracts-auto.service" <<EOF
[Unit]
Description=Sheikha Monthly Contracts Draft+Sign+Verify

[Service]
Type=oneshot
WorkingDirectory=${ROOT_DIR}
ExecStart=/usr/bin/env bash -lc 'cd ${ROOT_DIR} && npm run -s ops:partnerships:contract:tier1 && npm run -s ops:partnerships:contract:tier2 && npm run -s ops:partnerships:contract:tier3 && npm run -s ops:partnerships:sign && npm run -s ops:partnerships:verify'
EOF

	cat > "$HOME/.config/systemd/user/sheikha-contracts-auto.timer" <<EOF
[Unit]
Description=Run Sheikha monthly contracts auto cycle on day 1 at 07:20

[Timer]
OnCalendar=*-*-01 07:20:00
Persistent=true
Unit=sheikha-contracts-auto.service

[Install]
WantedBy=timers.target
EOF

		if systemctl --user daemon-reload >/dev/null 2>&1 \
			&& systemctl --user enable --now sheikha-daily-watch.timer >/dev/null 2>&1 \
			&& systemctl --user enable --now sheikha-monthly-renewal.timer >/dev/null 2>&1 \
			&& systemctl --user enable --now sheikha-contracts-auto.timer >/dev/null 2>&1 \
			&& systemctl --user list-timers --all 2>/dev/null | rg -q 'sheikha-(daily-watch|monthly-renewal|contracts-auto)'; then
			echo '✅ Cron غير متوفر، تم تثبيت جدولة systemd --user بنجاح'
			systemctl --user list-timers --all | rg 'sheikha-(daily-watch|monthly-renewal|contracts-auto)' || true
			exit 0
		fi

		echo '⚠️ systemd --user غير متاح في البيئة الحالية. استخدم VS Code Tasks للتشغيل اليدوي/الآلي من الجلسة.'
		exit 0
    fi

    echo '⚠️ لا crontab ولا systemd متاحان. شغّل المهام يدوياً من VS Code Tasks.'
    exit 0
fi

TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -v 'SHEIKHA_AUTOMATION_' > "${TMP_CRON}" || true

# دورة يومية: 06:30
printf '30 6 * * * cd %q && bash scripts/sheikha-daily-health-auth-adc.sh >> logs/cron-daily.log 2>&1 # SHEIKHA_AUTOMATION_DAILY\n' "${ROOT_DIR}" >> "${TMP_CRON}"

# دورة شهرية: اليوم 1 الساعة 07:00
printf '0 7 1 * * cd %q && bash scripts/sheikha-monthly-renewal-secure.sh >> logs/cron-monthly.log 2>&1 # SHEIKHA_AUTOMATION_MONTHLY\n' "${ROOT_DIR}" >> "${TMP_CRON}"

# دورة عقود وتوقيع شهرية: اليوم 1 الساعة 07:20
printf '20 7 1 * * cd %q && npm run -s ops:partnerships:contract:tier1 && npm run -s ops:partnerships:contract:tier2 && npm run -s ops:partnerships:contract:tier3 && npm run -s ops:partnerships:sign && npm run -s ops:partnerships:verify >> logs/cron-contracts.log 2>&1 # SHEIKHA_AUTOMATION_CONTRACTS\n' "${ROOT_DIR}" >> "${TMP_CRON}"

crontab "${TMP_CRON}"
rm -f "${TMP_CRON}"

echo '✅ Sheikha automation cron installed'
crontab -l | grep 'SHEIKHA_AUTOMATION_' || true
