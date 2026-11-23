const fs = require("fs");
const path = require("path");
const https = require("https");

const manifestPath = path.join(__dirname, "../config/sap-ariba-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")).sheikhaMasterEcosystem;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.040/cXML.dtd">
<cXML payloadID="${Date.now()}.sheikha@sheikha.top" timestamp="${new Date().toISOString()}">
  <Header>
    <From><Credential domain="NetworkId"><Identity>${manifest.sapAribaConnection.anid}</Identity></Credential></From>
    <To><Credential domain="NetworkId"><Identity>AN01000000001</Identity></Credential></To>
    <Sender>
      <Credential domain="NetworkId">
        <Identity>${manifest.sapAribaConnection.anid}</Identity>
        <SharedSecret>${manifest.sapAribaConnection.sharedSecret}</SharedSecret>
      </Credential>
      <UserAgent>Sheikha-SGSC-OS/7.0</UserAgent>
    </Sender>
  </Header>
  <Request><ProfileRequest/></Request>
</cXML>`;

const payloadBuffer = Buffer.from(xml, "utf-8");

const req = https.request("https://service.ariba.com/service/transaction/cxml.asp", {
  method: "POST",
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": payloadBuffer.length
  }
}, (res) => {
  let body = "";
  res.on("data", c => body += c);
  res.on("end", () => {
    console.log("✅ SAP ARIBA GATEWAY HTTP STATUS:", res.statusCode, "(200 = Connected)");
    console.log("📡 ANID:", manifest.sapAribaConnection.anid, "| ARAMCO ID:", manifest.sapAribaConnection.aramcoVendorId);
    console.log("🔑 ACTIVE SHARED SECRET:", manifest.sapAribaConnection.sharedSecret);
    console.log("📄 ARIBA cXML RESPONSE:", body.slice(0, 220).replace(/\s+/g, " "));
  });
});
req.write(payloadBuffer);
req.end();
