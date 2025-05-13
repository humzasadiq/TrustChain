#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>

#define RST_PIN 4
#define SS_PIN 5
#define ENTRY_SENSOR 26
#define EXIT_SENSOR 27

// Replace with your WiFi credentials
const char* ssid = "Sadiq House";
const char* password = "percytomhai9702";

MFRC522 mfrc522(SS_PIN, RST_PIN);
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String uid = "";
String lastUID = "";  // Store last scanned UID

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>ESP32 RFID WebSocket</title>
  <script>
    var gateway = ws://${window.location.hostname}/ws;
    var websocket;

    window.addEventListener('load', () => {
      websocket = new WebSocket(gateway);
      websocket.onmessage = (event) => {
        document.getElementById('output').innerText = event.data;
      };

      setInterval(() => {
        fetch(/rfid)
          .then(response => response.text())
          .then(data => {
            document.getElementById('rfid-status').innerText = data;
          })
          .catch(error => console.error('Fetch error:', error));
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

void scanRFID(String label);

void notifyClients(String message) {
  ws.textAll(message);
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, 
             AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("WebSocket client connected");
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  pinMode(ENTRY_SENSOR, INPUT);
  pinMode(EXIT_SENSOR, INPUT);

  // WiFi Station mode setup
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());


  // WebSocket and HTTP routes
  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  server.on("/rfid", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", lastUID == "" ? "No UID scanned yet." : lastUID);
  });

  server.begin();
  Serial.println("Server started");
}

void loop() {
  if (digitalRead(ENTRY_SENSOR) == LOW) {
    delay(1000);
    scanRFID("Entry");
  }

  if (digitalRead(EXIT_SENSOR) == LOW) {
    delay(1000);
    scanRFID("Exit");
  }
}

void scanRFID(String label) {
  mfrc522.PCD_Reset();
  mfrc522.PCD_Init();
  delay(50);

  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
      uid += String(mfrc522.uid.uidByte[i], HEX);
    }

    lastUID = "[" + label + "] UID: " + uid;
    Serial.println(lastUID);
    notifyClients(lastUID);

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  } else {
    String msg = "[" + label + "] No card detected.";
    lastUID = msg;
    notifyClients(msg);
  }
}