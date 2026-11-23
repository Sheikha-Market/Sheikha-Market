const fs = require("fs");
const path = require("path");
const https = require("https");

const manifestPath = path.join(__dirname, "../config/sheikha-supreme-cloud-manifest.json");
const meta = JSON.parse(fs.readFileSync(manifestPath, "utf8")).sheikhaSupremeMetaLayer;
const sap = meta.sheikhaCloudArchitecture.tier3_SubordinateConnectors.sapBusinessNetwork;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.040/cXML.dtd">
<cXML payloadID="${Date.now()}.supreme-cloud@sheikha.top" timestamp="${new Date().toISOString()}">
  <Header>
    <From><Credential domain="NetworkId"><Identity>${sap.anid}</Identity></Credential></From>
    <To><Credential domain="NetworkId"><Identity>AN01000000001</Identity></Credential></To>
    <Sender>
      <Credential domain="NetworkId">
        <Identity>${sap.anid}</Identity>
        <SharedSecret>${sap.sharedSecret}</SharedSecret>
      </Credential>
      <UserAgent>Sheikha-Supreme-Cloud-PaaS/8.0</UserAgent>
    </Sender>
  </Header>
  <Request><ProfileRequest/></Request>
</cXML>`;

const buf = Buffer.from(xml, "utf-8");

const req = https.request(sap.cxmlGateway, {
  method: "POST",
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": buf.length
  }
}, (res) => {
  let body = "";
  res.on("data", c => body += c);
  res.on("end", () => {
    console.log("👑 SHEIKHA SUPREME META-CLOUD LAYER: ACTIVE (TIER-0)");
    console.log("☁️  SaaS / PaaS / Commodities Total Items:", meta.unifiedCatalog.length);
    console.log("🔗 Subordinate SAP Ariba Handshake HTTP Status:", res.statusCode, "(200 = Full Protocol Match)");
    console.log("📡 ANID:", sap.anid, "| Aramco Vendor ID:", sap.aramcoVendorId);
    console.log("🔑 Shared Secret:", sap.sharedSecret);
  });
});
req.write(buf);
req.end();
