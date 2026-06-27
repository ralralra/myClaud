# ESP32-CAM 학습 공간

ESP32-CAM (OV2640, 4MB PSRAM) 보드를 단계별로 익히고 작은 프로젝트까지 만들어 보는 연습 저장소입니다.

## 보드 정보

- **MCU**: ESP32-S (Tensilica Xtensa LX6, 듀얼코어 240MHz)
- **카메라**: OV2640 (최대 1600x1200, JPEG/RGB565/YUV422)
- **PSRAM**: 4MB (고해상도 캡처 시 필수)
- **Flash**: 4MB
- **무선**: Wi-Fi 802.11 b/g/n + Bluetooth Classic/BLE
- **GPIO**: 10개 (다수는 카메라/SD에 점유) — 자유 핀이 적음
- **주의**: USB 포트가 **없음**. 업로드는 외장 USB-UART(예: FTDI, CP2102) 또는 ESP32-CAM-MB 어댑터 필요

## 학습 단계

| 단계 | 폴더 | 목표 |
|---|---|---|
| 1 | `01_arduino_ide_setup` | Arduino IDE 설치, ESP32 보드 매니저 추가, 드라이버 |
| 2 | `02_first_blink` | 보드 인식 확인, 첫 업로드, 부트모드(GPIO0) 익히기 |
| 3 | `03_wifi_connect` | Wi-Fi 연결, NTP 시각 가져오기, Serial 디버깅 |
| 4 | `04_camera_basic` | 카메라 초기화, JPEG 한 장 캡처 → Serial 출력 |
| 5 | `05_camera_web_server` | 브라우저로 실시간 스트리밍 (공식 CameraWebServer) |
| 6 | `06_motion_detection` | 프레임 차분으로 움직임 감지 → 사진 저장/알림 |
| ★ | `projects` | 완성형 미니 프로젝트 (예: 도어카메라, 타임랩스, 텔레그램 봇) |

## 폴더 안내

- `docs/` — 핀맵, 자주 쓰는 카메라 설정값, 트러블슈팅
- `libraries_notes/` — 사용한 라이브러리와 버전 정리

## 진행 방식

각 단계 폴더 안의 `README.md`를 먼저 읽고 → 회로 연결 → 코드 업로드 → 시리얼 모니터로 확인 → 막히는 부분 기록.

시작은 `01_arduino_ide_setup/README.md` 부터.
