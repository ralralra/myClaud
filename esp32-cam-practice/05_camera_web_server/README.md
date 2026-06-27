# 5단계 — 브라우저 실시간 스트리밍

같은 와이파이에 있는 PC/스마트폰에서 브라우저로 ESP32-CAM 영상을 보는 단계.

> 📖 **함께 보면 좋은 외부 가이드**: [Random Nerd Tutorials — ESP32-CAM Video Streaming and Face Recognition](https://randomnerdtutorials.com/esp32-cam-video-streaming-face-recognition-arduino-ide/)
> 스크린샷이 풍부해서 처음 따라가기에 좋음. 7단계 얼굴 인식까지 이 가이드를 그대로 이어갈 수 있음 (단, **esp32 보드 2.x 코어 한정** — 자세한 건 `07_face_recognition/README.md` 참고).

## 두 가지 길

### A. 공식 예제 사용 (추천, 처음엔 이걸로 — RNT 튜토리얼과 동일)
Arduino IDE → `File` → `Examples` → `ESP32` → `Camera` → **CameraWebServer**

해야 할 일:
1. 예제 열어서 상단의 `CAMERA_MODEL_AI_THINKER` 만 **주석 해제**, 나머지 모델은 주석.
2. `ssid` / `password` 입력
3. `Tools` → `Partition Scheme` → **Huge APP (3MB No OTA/1MB SPIFFS)** 재확인 (얼굴 인식 코드가 커서 기본 파티션이면 빌드 실패)
4. `Tools` → `PSRAM` → **Enabled** 재확인
5. 업로드 후 시리얼에 나오는 `http://192.168.x.x` 에 브라우저로 접속
6. **Start Stream** 클릭 → MJPEG 스트림
7. 좌측 패널에서 해상도/노출/화이트밸런스/특수효과 등을 토글하며 동작 차이 관찰

이 예제는 해상도/노출/화이트밸런스 등을 웹UI에서 조정할 수 있어서 카메라 튜닝 연습용으로 훌륭함.
이 상태로 7단계(얼굴 인식)까지 그대로 이어집니다.

### B. 직접 만들기 (이 폴더의 `simple_stream.ino`)
HTTP 서버 한 줄, `/stream` 엔드포인트에서 multipart/x-mixed-replace 로 MJPEG 전송. 코드가 짧아서 흐름을 이해하기 좋음.

## 파일
- `simple_stream.ino` — 최소한의 MJPEG 스트리밍 서버

## 사용 전 수정
```cpp
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

## 접속
업로드 후 시리얼에 IP가 찍히면 브라우저로:
```
http://<IP>/        ← 페이지 (img 태그)
http://<IP>/stream  ← MJPEG 스트림 직접
```

## 성능 팁
- 해상도를 너무 키우면 FPS 떨어짐. VGA(640x480) ~ SVGA(800x600)가 무난
- `jpeg_quality` 숫자가 클수록 압축률↑/화질↓/대역↓
- Wi-Fi RSSI 가 -75dBm 이하면 끊김 잦음
