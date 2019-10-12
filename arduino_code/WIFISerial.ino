
#include <FastLED.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoOTA.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <WebSocketsServer.h>

#define PIN      6
#define N_LEDS 384
#define BRIGHTNESS  150
#define LED_TYPE    WS2812  
#define COLOR_ORDER GRB

// Sources:
// https://gist.github.com/hsiboy/11545fd0241ab60b567d

ESP8266WiFiMulti wifiMulti;       // Create an instance of the ESP8266WiFiMulti class, called 'wifiMulti'

CRGB leds[N_LEDS];

WebSocketsServer webSocket(81);    // create a websocket server on port 81

/*__________________________________________________________SETUP__________________________________________________________*/

void setup() {
  Serial.begin(115200);        // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println("\r\n");

  startWiFi();                 // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection
    
  startWebSocket();            // Start a WebSocket server

  startFastLED();              // Setup FastLED
}

/*__________________________________________________________LOOP__________________________________________________________*/


void loop() {
  webSocket.loop();                           // constantly check for websocket events
}

/*__________________________________________________________SETUP_FUNCTIONS__________________________________________________________*/

void startWiFi() { // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection

  wifiMulti.addAP("Chaostreff-Flensburg", "Schnell33");   // add Wi-Fi networks you want to connect to
  
  Serial.println("Connecting");
  while (wifiMulti.run() != WL_CONNECTED && WiFi.softAPgetStationNum() < 1) {  // Wait for the Wi-Fi to connect
    delay(250);
    Serial.print('.');
  }
  Serial.println("\r\n");
  if(WiFi.softAPgetStationNum() == 0) {      // If the ESP is connected to an AP
    Serial.print("Connected to ");
    Serial.println(WiFi.SSID());             // Tell us what network we're connected to
    Serial.print("IP address:\t");
    Serial.print(WiFi.localIP());            // Send the IP address of the ESP8266 to the computer
  } else {                                   // If a station is connected to the ESP SoftAP
    Serial.print("Station connected to ESP8266 AP");
  }
  Serial.println("\r\n");
}

void startWebSocket() { // Start a WebSocket server
  webSocket.begin();                          // start the websocket server
  webSocket.onEvent(webSocketEvent);          // if there's an incomming websocket message, go to function 'webSocketEvent'
  Serial.println("WebSocket server started.");
}

void startFastLED() {
  FastLED.addLeds<WS2812, PIN, COLOR_ORDER>(leds, N_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  Serial.println("FastLED setup.");  
}

/*__________________________________________________________SERVER_HANDLERS__________________________________________________________*/

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) { // When a WebSocket message is received
  switch (type) {
    case WStype_DISCONNECTED:             // if the websocket is disconnected
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED: {              // if a new websocket connection is established
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
      }
      break;
    case WStype_BIN:                     // if new text data is received
        // Serial.readBytes( (char*)leds, N_LEDS * 3)
        int j = 0;
        for(int i = 0; i < lenght; i+=3) {
          leds[j].r = payload[i];
          leds[j].g = payload[i + 1];
          leds[j].b = payload[i + 2];
          j++;
        }
//        Serial.printf("%u", payload[0]);
        FastLED.show();
      break;
  }
}
