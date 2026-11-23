export async function registerSmartFoundationWeight(sensorData) {
  const weight = {
    id: `SF-${sensorData.sensor}-${Date.now()}`,
    type: "smart-foundation",
    sensor: sensorData.type,
    value: sensorData.value,
    sbc_code: sensorData.sbc || "SBC 303",
    hs_code: sensorData.hs || "HS 9031",
    body_twin: sensorData.body || "206 bones",
    pearl_metal: "15000MT compatible",
    hash: "sha256-" + Date.now(),
    shk_reward: 36233,
    seal: "ATOM_WATER_RASUL_JANNAH_SEALED",
    owner: "CR 2051263653 - Unified ID 7049031003"
  }
  return weight
}
export const SENSORS = ["ESP32", "HX711", "MPU6050", "Soil-Moisture", "Load-Cell-50kg"]
