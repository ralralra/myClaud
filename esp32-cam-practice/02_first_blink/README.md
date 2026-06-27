# 2단계 — 첫 업로드 (Blink + Hello)

ESP32-CAM에는 보드 뒷면에 **빨간 LED(GPIO33, active-low)** 와 앞면 **흰색 플래시 LED(GPIO4)** 가 있습니다.

목표: 시리얼에 메시지 출력하면서 두 LED를 깜빡여 보는 것.

## 회로
- 추가 부품 없음. USB-UART만 연결.

## 코드
`blink.ino` 참고.

## 실행 방법
1. Arduino IDE에서 `blink.ino` 열기
2. 보드 설정 1단계대로 (AI Thinker ESP32-CAM, PSRAM Enabled, Huge APP)
3. GPIO0-GND 점프 → RESET → Upload
4. 업로드 끝나면 GPIO0 풀고 RESET
5. `Tools` → `Serial Monitor` → **115200 baud**
6. 빨간 LED 점멸 + 시리얼에 카운트 출력 확인

## 배우는 것
- `Serial.begin()` 으로 디버깅 출력
- `pinMode()` / `digitalWrite()` 기본
- ESP32-CAM의 GPIO33은 **반전 로직** (LOW = 켜짐)
- 부트 모드(GPIO0)와 일반 모드 차이 체득
