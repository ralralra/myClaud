# 보드 설정 & 업로드 방법 (ESP32 DevKit)

## 회로 — 없음!

이 프로젝트는 **ESP32 DevKit 보드 1개와 USB 케이블** 만 있으면 됩니다.
센서도, 카드 리더도, 점퍼선도 필요 없어요. 보드를 USB로 PC에 꽂기만 하면 끝.

## ESP32-CAM 과 다른 점 (훨씬 쉬움)

| | ESP32-CAM | ESP32 DevKit (이 프로젝트) |
|---|---|---|
| USB 포트 | 없음 (별도 어댑터 필요) | **있음** (바로 연결) |
| 업로드 | IO0 누르고 RESET... 복잡 | **그냥 Upload 클릭** (자동 부팅) |
| 카메라 | 있음 | 없음 |

→ DevKit은 업로드가 자동이라 입문에 훨씬 편합니다.

## Arduino IDE 설정

1. esp32 보드 패키지 설치 (코어 **2.0.17** 권장)
   - 자세한 설치는 `esp32-cam-practice/01_arduino_ide_setup/README.md` 참고
2. `Tools` → `Board` → `ESP32 Arduino` → **ESP32 Dev Module** (또는 DOIT ESP32 DEVKIT V1)
3. `Tools` → `Port` → 보드가 잡힌 COM/tty 선택
4. `Tools` → `Upload Speed` → **115200** (안정적)

> SPIFFS(보드 내부 저장)를 쓰는 6·7단계에서는 파티션에 SPIFFS 공간이 있어야 합니다.
> `Tools` → `Partition Scheme` → **Default 4MB with spiffs** (기본값이면 보통 OK)

## 업로드 방법

1. 코드 열기 → 상단 **Upload (→)** 버튼 클릭
2. "Connecting..." 없이 바로 `Writing...` 진행되면 정상 (DevKit은 자동 부팅)
3. 만약 `Connecting....._____` 가 길게 나오면 보드의 **BOOT 버튼**을 잠깐 누르고 있기
4. `Hash of data verified` → `Hard resetting` 나오면 성공

## 시리얼 모니터

- `Tools` → `Serial Monitor` → 우측 하단 **115200 baud**
- 코드가 `Serial.begin(115200)` 이라 일치시켜야 글자가 안 깨짐

## AP 모드란? (이 프로젝트의 핵심)

ESP32가 **스스로 와이파이를 만들어** 학생 폰이 거기 접속합니다.
공유기/인터넷이 필요 없어요.

```
ESP32  ──(와이파이 'ESP32-Attend' 송출)──  학생 폰이 이 와이파이에 접속
        접속 후 브라우저로 http://192.168.4.1
```

- 학생 폰은 이 와이파이에 붙는 동안 **인터넷이 안 됨** (정상)
- 폰이 "인터넷 없음, 계속 연결할까요?" 물으면 **"계속 연결"** 선택
