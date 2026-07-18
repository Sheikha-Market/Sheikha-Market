# دليل التنفيذ الأصلي لمثبتات شيخة وجمع الأدلة — الإصدار 1

## الحالة

أصبحت مصفوفة الأهداف الـ26 وعقد الأدلة مدمجين في `main`. هذه الحزمة تضيف أدوات التنفيذ الأصلية، ولا تدعي أن الحزم بُنيت أو اختُبرت.

## المبدأ

كل منصة تبني حزمها على مشغل أصلي أو بيئة توافق معتمدة، مع ربط البناء بـ commit واحد. لا يثبت اكتمال Windows أو macOS من جهاز Linux وحده.

## مجموعات المشغلات

### Windows

- `windows-x64`
- `windows-arm64`

يغطيان:

- User Installer.
- System Installer.
- ZIP.
- CLI.

### Linux

- `linux-x64`
- `linux-arm32`
- `linux-arm64`
- `linux-native` لحزمة Snap ودليل المتجر.

يغطي:

- DEB.
- RPM.
- tar.gz.
- CLI.
- Snap.

### macOS

- `macos-intel`
- `macos-apple-silicon`
- `macos-universal`

يغطي:

- DMG Intel.
- DMG Apple silicon.
- DMG Universal.
- CLI Intel.
- CLI Apple silicon.

## أوامر الخطة والقوالب

```bash
node tools/distribution/sheikha-native-build-matrix-orchestrator-v1.js \
  plan \
  --root "$PWD" \
  --output reports/native-build-plan.json

node tools/distribution/sheikha-native-build-matrix-orchestrator-v1.js \
  prepare-evidence \
  --root "$PWD" \
  --output-dir evidence/installers
```

## تنفيذ Linux

```bash
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh x64
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh arm32
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh arm64
scripts/distribution/linux/build-sheikha-linux-installers-v1.sh snap
```

لا يثبت السكربت أي حزم. يجب أن يوجد أمر بناء صريح داخل `package.json`.

## تنفيذ Windows

```powershell
.\scripts\distribution\windows\build-sheikha-windows-installers-v1.ps1 `
  -Product user-installer `
  -Architecture x64
```

تكرر العملية لكل منتج ومعمارية.

## تنفيذ macOS

```bash
scripts/distribution/macos/build-sheikha-macos-installers-v1.sh dmg x64
scripts/distribution/macos/build-sheikha-macos-installers-v1.sh dmg arm64
scripts/distribution/macos/build-sheikha-macos-installers-v1.sh dmg universal
scripts/distribution/macos/build-sheikha-macos-installers-v1.sh cli x64
scripts/distribution/macos/build-sheikha-macos-installers-v1.sh cli arm64
```

## جمع الأدلة

بعد بناء الحزمة واختبارها، يستخدم جامع الأدلة مع ملفات حقيقية:

```bash
node tools/distribution/sheikha-installer-evidence-collector-v1.js \
  --root "$PWD" \
  --target-id LINUX_DEB_X64 \
  --artifact /path/to/sheikha-linux-x64.deb \
  --build-log /path/to/build.log \
  --sbom /path/to/sbom.json \
  --provenance /path/to/provenance.json \
  --install-test-log /path/to/install-test.log \
  --smoke-test-log /path/to/smoke-test.log \
  --uninstall-test-log /path/to/uninstall-test.log \
  --signing-status /path/to/signing-status.json \
  --install-test-passed true \
  --smoke-test-passed true \
  --uninstall-test-passed true \
  --human-release-approval false \
  --output evidence/installers/LINUX_DEB_X64.json
```

الاعتماد البشري يبقى `false` حتى مراجعة جميع الأدلة.

## تحسينات التكامل

- مصدر واحد للمصفوفة.
- عقد أدلة واحد.
- أسماء أهداف ثابتة.
- مشغلات منفصلة لكل نظام.
- عدم تثبيت أدوات أو حزم تلقائيًا.
- منع ادعاء الاكتمال عند غياب الأدلة.
- فصل مفاتيح التوقيع عن المستودع.
- إنشاء SHA-256 وSBOM وسجل مصدر لكل حزمة.
- اختبار تثبيت وتشغيل وإزالة.
- قابلية الرجوع وحفظ السجلات.
- عدم اعتماد تشغيل المنتج على GitHub.
