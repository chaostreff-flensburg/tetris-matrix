// For WMOS Devices ?
//#define FASTLED_ALLOW_INTERRUPTS 0
//#define FASTLED_INTERRUPT_RETRY_COUNT 1
#include <FastLED.h>
// Change if needed
#define PIN      6
#define N_LEDS 384
#define BRIGHTNESS  64
#define LED_TYPE    WS2812
#define COLOR_ORDER GRB
CRGB leds[N_LEDS];
#define UPDATES_PER_SECOND 24


void setup()
{
  delay(2000);
  FastLED.addLeds<WS2812, PIN, COLOR_ORDER>(leds, N_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  // Change if needed
  Serial.begin(1000000);
}


void loop()
{
  // Read all N_LEDS * 3 Bytes 
  while (!Serial.available() ) {
    Serial.readBytes( (char*)leds, N_LEDS * 3);
    // Show Matrix
    FastLED.show();
	// Needed?
    delay(10);
	// Send OK for Info
    Serial.println("OK");  
  }
  delay(100);
}
