# 트러블슈팅

## 업로드 단계

| 증상 | 원인 / 해결 |
|---|---|
| `Failed to connect to ESP32: Timed out waiting for packet header` | GPIO0-GND 점프 안 됨, 또는 RESET 타이밍. 점프 → RESET → Upload 누른 직후 `Connecting...` 동안 대기 |
| `A fatal error occurred: MD5 of file does not match data in flash` | Upload Speed 너무 높음 → 115200으로 낮추기 |
| `Brownout detector was triggered` | 5V 전원 부족. USB 허브 X, 케이블 짧게, 외부 5V/2A 어댑터 |
| 포트(`/dev/ttyUSB0`, `COMx`)가 안 보임 | USB-UART 드라이버 미설치 (CH340/CP210x/FTDI) |
| 업로드 끝났는데 동작 안 함 | GPIO0-GND 떼고 RESET 다시 |

## 카메라 단계

| 증상 | 원인 / 해결 |
|---|---|
| `Camera init failed: 0x20004` | PSRAM Disabled. 보드설정에서 Enabled |
| `Camera init failed: 0x105` (ESP_ERR_NOT_FOUND) | OV2640 인식 실패. 모듈 연결 점검, 전원 부족 의심 |
| 흰 화면/단색 화면 | XCLK 노이즈, 케이블 길이, 더 짧은 점퍼선 |
| 흐림/노출 이상 | `sensor_t::set_brightness/contrast/whitebal` 조정 |
| 초록 줄무늬 | 전원 노이즈. 디커플링 캡(100nF + 10uF) |

## Wi-Fi / 네트워크

| 증상 | 원인 / 해결 |
|---|---|
| 연결 안 됨 | 5GHz 전용 SSID 아닌지 확인 (ESP32는 2.4GHz만) |
| 자주 끊김 | RSSI -75dBm 이하. 안테나 방향, 거리 |
| 외부 안테나 모델인데 신호 약함 | 보드의 0Ω 점퍼(또는 회로 패턴)가 PCB 안테나로 가 있을 수 있음 — 외부 안테나 쪽으로 옮겨야 함 |

## 전력

- 카메라 켜진 ESP32-CAM 피크 전류는 ~600mA. PC USB(500mA)로 빠듯함.
- 가능하면 외부 5V/2A 또는 ESP32-CAM-MB 어댑터 + 좋은 케이블.

## 디버깅 팁

- 시리얼 모니터 baud 115200 고정 (코드와 일치)
- `ESP.getFreeHeap()` / `ESP.getPsramSize()` 출력으로 메모리 상태 늘 확인
- 카메라 init 실패 시 보드 보호회로가 발열로 자동차단된 적이 있는지 — 잠시 빼서 식히고 재시도
