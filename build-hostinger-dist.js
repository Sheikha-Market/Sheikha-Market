const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const wellKnownMcp = path.join(distDir, '.well-known', 'mcp');
fs.mkdirSync(wellKnownMcp, { recursive: true });

// نسخ الصفحة الرئيسية المجهزة للوكلاء (18/18) إلى index.html في الجذر وفي dist/
const masterHtmlPath = path.join(__dirname, 'governed_ui_views', 'master_index_13_docs.html');
if (fs.existsSync(masterHtmlPath)) {
  const html = fs.readFileSync(masterHtmlPath, 'utf8');
  fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
}

// نسخ جميع واجهات البوابات الـ 22 إلى dist/ وإلى مجلدات نظيفة بدون .html لكي تعمل الروابط /about و /contact و /terms
const uiDir = path.join(__dirname, 'governed_ui_views');
if (fs.existsSync(uiDir)) {
  const dstUi = path.join(distDir, 'governed_ui_views');
  fs.mkdirSync(dstUi, { recursive: true });
  for (const file of fs.readdirSync(uiDir)) {
    if (file.endsWith('.html')) {
      fs.copyFileSync(path.join(uiDir, file), path.join(dstUi, file));
    }
  }
}

const routeMappings = {
  'about': 'company_profile_print.html',
  'contact': 'procurement_outreach_hub.html',
  'terms': 'methodologies_dms_bylaws.html',
  'master-index': 'master_index_13_docs.html',
  'company-profile': 'company_profile_print.html',
  'datasheet': 'technical_datasheet_print.html',
  'grn-report': 'grn_qc_report_print.html',
  'quotation': 'official_quotation_print.html',
  'purchase-order': 'official_po_contract_print.html',
  'daily-prices': 'daily_price_bulletin.html',
  'methodologies-dms': 'methodologies_dms_bylaws.html',
  'treasury-ledger': 'treasury_bank_ledger.html',
  'gate-pass': 'gate_pass_waybill.html',
  'tax-invoice': 'official_zatca_tax_invoice.html',
  'sla-contract': 'annual_sla_contract.html',
  'tender-bid': 'tender_bid_decision_form.html',
  'crm-pipeline': 'crm_pipeline_tracker.html',
  'deal-room': 'deal_closing_room.html',
  'target-directory': 'target_directory_playbook.html',
  'exchange-platform': 'exchange_platform_domains.html',
  'system-manifest': 'system_manifest_status.html',
  'sheikha-os': 'sheikha_os_workstation.html',
  'kernel-baremetal': 'rapid_kernel_baremetal_spec.html',
  'full-architecture': 'full_12_domains_architecture.html',
  'sap-native-cloud': 'sap_native_cloud_hub.html'
};

for (const [route, viewFile] of Object.entries(routeMappings)) {
  const srcView = path.join(uiDir, viewFile);
  const fallbackView = path.join(uiDir, 'master_index_13_docs.html');
  const content = fs.existsSync(srcView) ? fs.readFileSync(srcView, 'utf8') : fs.readFileSync(fallbackView, 'utf8');
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), content, 'utf8');
}

// نسخ ملفات الوكلاء القياسية (robots.txt, sitemap.xml, llms.txt, index.md, MCP server-card.json)
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'index.md']) {
  const src = path.join(__dirname, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, f));
  }
}

const mcpSrc = path.join(__dirname, '.well-known', 'mcp', 'server-card.json');
if (fs.existsSync(mcpSrc)) {
  fs.copyFileSync(mcpSrc, path.join(wellKnownMcp, 'server-card.json'));
}

// إنشاء صفحة 404.html حقيقية
const html404 = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>404 - الصفحة غير موجودة | شيخة</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 — الصفحة المطلوبة غير موجودة</h1><p><a href="/">العودة إلى الصفحة الرئيسية لمنظومة شيخة (sheikha.top)</a></p></body></html>';
fs.writeFileSync(path.join(distDir, '404.html'), html404, 'utf8');

// إنشاء ملف .htaccess و _headers لدعم ترويسات الوكلاء (Link RFC 8288 + Markdown negotiation + Real 404 + MIME Types) على خوادم Hostinger
const htaccess = `ErrorDocument 404 /404.html
AddType text/plain .txt
AddType text/markdown .md
AddType application/xml .xml
AddType application/json .json

<IfModule mod_headers.c>
  Header always set Link "</llms.txt>; rel=\"llms-txt\", </index.md>; rel=\"alternate\"; type=\"text/markdown\", </.well-known/mcp/server-card.json>; rel=\"mcp-server-card\""
  Header always set Access-Control-Allow-Origin "*"
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_ACCEPT} text/markdown [NC]
  RewriteRule ^$ /index.md [L]
</IfModule>
`;
fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess, 'utf8');
fs.writeFileSync(path.join(__dirname, '.htaccess'), htaccess, 'utf8');

console.log('✅ [Sheikha Build] تم بناء مجلد dist/ المتكامل بنجاح لجميع النطاقات الـ 12 ومعايير الوكلاء الـ 18!');
