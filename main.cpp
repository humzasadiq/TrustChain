#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>

// stages configuration
#define STAGES 3
const char* stageNames[STAGES] = {
  "Stage 1 (Store)",
  "Stage 2 (Sub-Assembly)",
  "Stage 3 (Design)"
};
const int entryPins[STAGES] = { 26, 14, 25 };
const int exitPins [STAGES] = { 27, 12, 33 };
const int csPins   [STAGES] = {  5, 15, 13 };
const int rstPin = 4;

// RFID readers
MFRC522 readers[STAGES] = {
  MFRC522(csPins[0], rstPin),
  MFRC522(csPins[1], rstPin),
  MFRC522(csPins[2], rstPin)
};

// Wi‑Fi & server
const char* ssid     = "Sadiq House";
const char* password = "percytomhai9702";
AsyncWebServer server(80);
AsyncWebSocket  ws("/ws");

// last UID string for HTTP “/rfid” fetch
String lastUID = "";

// HTML page (served at “/”)
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>ESP32 RFID WebSocket</title>
  <script>
    const gateway = `ws://${window.location.hostname}/ws`;
    let websocket;
    window.addEventListener('load', () => {
      websocket = new WebSocket(gateway);
      websocket.onmessage = (event) => {
        document.getElementById('output').innerText = event.data;
      };
      // also poll the lastUID every 3s
      setInterval(() => {
        fetch('/rfid')
          .then(res => res.text())
          .then(data => {
            document.getElementById('rfid-status').innerText = data;
          });
      }, 3000);
    });
  </script>
</head>
<body>
  <h2>RFID Status (WebSocket)</h2>
  <pre id="output">Waiting...</pre>
  <h3>Last Scanned UID (Fetch)</h3>
  <pre id="rfid-status">Loading...</pre>
</body>
</html>
)rawliteral";

// helper to broadcast to all WebSocket clients
void notifyClients(const String &msg) {
  ws.textAll(msg);
}

// WebSocket connect handler (optional)
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
             AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.printf("WS client #%u connected\n", client->id());
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin();

  // init all RFID readers
  for (int i = 0; i < STAGES; i++) {
    readers[i].PCD_Init();
  }

  // IR sensor pins
  for (int i = 0; i < STAGES; i++) {
    pinMode(entryPins[i], INPUT);
    pinMode(exitPins[i],  INPUT);
  }

  // connect Wi‑Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi‑Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println("\nWi‑Fi connected! IP: " + WiFi.localIP().toString());

  // WebSocket + HTTP
  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req){
    req->send_P(200, "text/html", index_html);
  });
  server.on("/rfid", HTTP_GET, [](AsyncWebServerRequest *req){
    req->send(200, "text/plain",
              lastUID.length() ? lastUID : "No UID scanned yet.");
  });

  server.begin();
  Serial.println("HTTP & WebSocket server started");
}

void loop() {
  ws.cleanupClients();  // keep WS alive

  // scan each stage
  for (int i = 0; i < STAGES; i++) {
    if (digitalRead(entryPins[i]) == LOW) {
      Serial.printf("%s ‑ Entry triggered\n", stageNames[i]);
      delay(1000);
      scanStage(i, "Entry");
    }
    if (digitalRead(exitPins[i]) == LOW) {
      Serial.printf("%s ‑ Exit triggered\n", stageNames[i]);
      delay(2000);
      scanStage(i, "Exit");
    }
  }
}

// scans RFID at stage `idx`, label = "Entry" or "Exit"
void scanStage(int idx, const char *label) {
  MFRC522 &reader = readers[idx];
  reader.PCD_Reset();
  reader.PCD_Init();
  delay(50);

  String uidStr;
  bool success = false;
  unsigned long start = millis();

  while (millis() - start < 2000) {
    if (reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial()) {
      success = true;
    } else if (reader.PICC_ReadCardSerial()) {
      success = true;
    }
    if (success) {
      uidStr = "";
      for (byte b = 0; b < reader.uid.size; b++) {
        byte v = reader.uid.uidByte[b];
        if (v < 0x10) uidStr += '0';
        uidStr += String(v, HEX);
        if (b < reader.uid.size - 1) uidStr += " ";
      }
      reader.PICC_HaltA();
      reader.PCD_StopCrypto1();
      break;
    }
  }

  String msg;
  if (success) {
    msg = String(stageNames[idx]) + " [" + label + "] UID: " + uidStr;
  } else {
    msg = String(stageNames[idx]) + " [" + label + "] No card detected.";
  }

  lastUID = msg;
  Serial.println(msg);
  notifyClients(msg);
}
