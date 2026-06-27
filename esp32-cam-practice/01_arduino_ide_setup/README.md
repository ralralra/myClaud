# 1단계 — Arduino IDE 설정

ESP32-CAM은 USB가 없어서 **USB-UART 변환기**가 필수입니다. 가장 흔한 두 방법:

- **ESP32-CAM-MB 어댑터** — 보드 밑에 끼우면 USB-C/Micro USB로 바로 연결 (가장 편함)
- **FTDI / CP2102 모듈** — 점퍼선으로 직접 연결 (저렴, 회로 이해에 좋음)

## 1. Arduino IDE 설치

- https://www.arduino.cc/en/software 에서 IDE 2.x 버전 다운로드 (Windows / macOS / Linux)
- 설치 후 실행

## 2. ESP32 보드 매니저 추가

1. `File` → `Preferences`
2. **Additional Boards Manager URLs** 에 아래 추가:
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. `Tools` → `Board` → `Boards Manager` → "esp32" 검색 → **esp32 by Espressif Systems** 설치 (3.x 권장)

## 3. 보드 선택

- `Tools` → `Board` → `ESP32 Arduino` → **AI Thinker ESP32-CAM**
- `Tools` → `Partition Scheme` → **Huge APP (3MB No OTA/1MB SPIFFS)** (카메라 라이브러리 용량 때문)
- `Tools` → `PSRAM` → **Enabled** ← 중요! 4MB PSRAM 활용
- `Tools` → `Upload Speed` → 처음엔 **115200** (안 되면 낮춰서 재시도)
- `Tools` → `Port` → USB-UART가 잡힌 COM/tty 선택

## 4. USB-UART 드라이버

| 칩 | 드라이버 |
|---|---|
| CH340 | wch.cn 또는 sparkfun 가이드 |
| CP2102 / CP2104 | Silicon Labs CP210x VCP Drivers |
| FTDI FT232 | FTDI VCP Drivers |

macOS는 보안설정에서 커널 확장 허용이 필요할 수 있음. Linux는 보통 별도 설치 불필요 (`/dev/ttyUSB0`).

## 5. 업로드 회로 (어댑터 없이 FTDI 사용 시)

```
FTDI          ESP32-CAM
─────         ──────────
5V    ────►   5V
GND   ────►   GND
TX    ────►   U0R (GPIO3)
RX    ────►   U0T (GPIO1)
              GPIO0 ─── GND  (업로드 모드 진입용 점프)
```

**업로드 절차**:
1. `GPIO0`와 `GND`를 연결
2. RESET 버튼 누르기 (또는 전원 재인가)
3. Arduino IDE에서 **Upload** 클릭
4. "Connecting..." 점 찍히는 동안 대기
5. 업로드 끝나면 `GPIO0` ↔ `GND` 분리하고 RESET → 일반 동작 모드

## 6. 동작 확인 체크리스트

- [ ] Arduino IDE 설치 완료
- [ ] esp32 보드 패키지 설치 완료
- [ ] 보드/포트/PSRAM/파티션 설정 완료
- [ ] USB-UART 드라이버 인식 (장치 관리자 / `ls /dev/tty*`)
- [ ] FTDI 사용 시 GPIO0-GND 점퍼 준비

여기까지 되면 → `02_first_blink` 로 이동.

## 자주 막히는 곳

- **"A fatal error occurred: Failed to connect to ESP32"** → GPIO0 점프 안 됐거나, RESET 타이밍, 또는 5V 전원 부족 (USB 허브 X, 직결)
- **"Brownout detector was triggered"** → 5V 전원이 약함. PC USB 직결 or 외부 5V/2A
- **포트가 안 보임** → USB-UART 드라이버 미설치
