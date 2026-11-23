// SHEIKHA SMART FOUNDATIONS IoT - ESP32 FIRMWARE
// Sensors: HX711 (Pressure), Soil Moisture, MPU6050 (Vibration)
// Seal: BOUND_BY_QURAN_SUNNAH

#define PRESSURE_PIN 34
#define SOIL_PIN 35

void setup() {
  Serial.begin(115200);
  Serial.println("🕌 SHEIKHA ESP32 Smart Foundation Sensor Active.");
}

void loop() {
  int raw_pressure = analogRead(PRESSURE_PIN);
  int raw_moisture = analogRead(SOIL_PIN);
  
  Serial.printf("{\"pressure_kPa\": %.2f, \"moisture_pct\": %.2f, \"status\": \"SEALED\"}\n",
                raw_pressure * 0.1, raw_moisture * 0.05);
  delay(2000);
}
