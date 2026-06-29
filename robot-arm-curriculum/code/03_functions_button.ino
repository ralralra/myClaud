// ============================================================
//  [3단계] 함수 만들기 + 자동 Pick & Place
//  싸이피아 6자유도 로봇팔 - www.scipia.co.kr
// ------------------------------------------------------------
//  9~12차시의 핵심 코드. 두 가지를 새로 배운다.
//   (1) 반복되는 동작을 "함수"로 묶기  → moveTo(), goHome(), grip...()
//   (2) 명령 한 번으로 동작을 "자동" 실행하기 → autoPickAndPlace()
//
//  실행 방법 (시리얼 모니터 9600 baud):
//    h : 홈 자세로
//    p : 현재 각도 출력(기록용)
//    1 : 자동 Pick & Place 한 사이클 실행
//  평소에는 조이스틱으로 수동 조작도 그대로 된다.
//
//  ※ 활동지의 "조이스틱 버튼"으로 실행하고 싶다면, 맨 아래
//    [버튼으로 실행하기] 주석을 참고. 단, 기본 배선에는 버튼이
//    연결돼 있지 않으므로 버튼 핀을 먼저 확인/연결해야 한다.
// ============================================================

#include <Servo.h>

const int SERVOS = 6;
const int GRIPPER = 5;          // 그리퍼는 6번 서보(인덱스 5)
int PIN[SERVOS], MIN[SERVOS], MAX[SERVOS], INITANGLE[SERVOS], ANA[SERVOS];
Servo myservo[SERVOS];

// ── 그리퍼 열림/닫힘 각도 (물체에 맞춰 학생이 조정) ──
const int GRIP_OPEN  = 10;
const int GRIP_CLOSE = 70;

// ── 기록해 둔 자세들 (8차시에서 구한 각도값으로 바꿔 넣는다) ──
//    { 1번, 2번, 3번, 4번, 5번, 6번(그리퍼) }
int HOME[SERVOS]        = { 90,  90,  90,  90,  90, 45 };
int PICK_READY[SERVOS]  = { 60, 100,  80,  90,  90, GRIP_OPEN };  // 집기 직전(상공)
int PICK[SERVOS]        = { 60, 130, 110,  90,  90, GRIP_OPEN };  // 집는 위치
int PLACE_READY[SERVOS] = {120, 100,  80,  90,  90, GRIP_CLOSE }; // 놓기 직전(상공)
int PLACE[SERVOS]       = {120, 130, 110,  90,  90, GRIP_CLOSE }; // 놓는 위치

void setup() {
  Serial.begin(9600);

  PIN[0] = 3;   MIN[0] = 0; MAX[0] = 180; INITANGLE[0] = 90; ANA[0] = 0;
  PIN[1] = 2;   MIN[1] = 0; MAX[1] = 180; INITANGLE[1] = 90; ANA[1] = 1;
  PIN[2] = 9;   MIN[2] = 0; MAX[2] = 180; INITANGLE[2] = 90; ANA[2] = 2;
  PIN[3] = 8;   MIN[3] = 0; MAX[3] = 180; INITANGLE[3] = 90; ANA[3] = 3;
  PIN[4] = 4;   MIN[4] = 0; MAX[4] = 180; INITANGLE[4] = 90; ANA[4] = 4;
  PIN[5] = 5;   MIN[5] = 0; MAX[5] = 90;  INITANGLE[5] = 45; ANA[5] = 5;

  for (int i = 0; i < SERVOS; i++) {
    myservo[i].attach(PIN[i]);
    myservo[i].write(INITANGLE[i]);
  }
  Serial.println(F("준비 완료. h=홈, p=각도출력, 1=자동 Pick&Place"));
}

void loop() {
  // 1) 시리얼 명령 확인
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '1') autoPickAndPlace();
    else if (cmd == 'h' || cmd == 'H') goHome();
    else if (cmd == 'p' || cmd == 'P') printAngles();
  }

  // 2) 명령이 없으면 평소처럼 조이스틱 수동 조작
  joystickControl();
  delay(20);
}

// ============================================================
//   여기서부터가 "함수 만들기"의 핵심 — 반복 동작을 묶는다
// ============================================================

// [함수1] 목표 자세(target)로 모든 서보를 1도씩 부드럽게 이동
//   stepDelay 가 클수록 천천히 움직인다.
void moveTo(int target[], int stepDelay) {
  boolean moving = true;
  while (moving) {
    moving = false;
    for (int i = 0; i < SERVOS; i++) {
      int cur = myservo[i].read();
      if (cur < target[i])      { myservo[i].write(cur + 1); moving = true; }
      else if (cur > target[i]) { myservo[i].write(cur - 1); moving = true; }
    }
    delay(stepDelay);
  }
}

// [함수2] 그리퍼 열기 / 닫기 — moveTo 없이 그리퍼만 제어
void gripperOpen()  { myservo[GRIPPER].write(GRIP_OPEN);  delay(400); }
void gripperClose() { myservo[GRIPPER].write(GRIP_CLOSE); delay(400); }

// [함수3] 홈 자세로
void goHome() { moveTo(HOME, 15); }

// [함수4] 자동 Pick & Place — 위 함수들을 "순서대로" 부르면 끝!
void autoPickAndPlace() {
  Serial.println(F(">> 자동 Pick & Place 시작"));
  goHome();
  moveTo(PICK_READY, 15);   // 집을 물체 위로
  gripperOpen();
  moveTo(PICK, 15);         // 내려가서
  gripperClose();           // 집고
  moveTo(PICK_READY, 15);   // 들어올리고
  moveTo(PLACE_READY, 15);  // 놓을 곳 위로
  moveTo(PLACE, 15);        // 내려놓을 위치로
  gripperOpen();            // 놓고
  moveTo(PLACE_READY, 15);  // 다시 올라와서
  goHome();
  Serial.println(F(">> 완료"));
}

// ============================================================
//   보조 함수들
// ============================================================

// 조이스틱 수동 조작 (1단계 loop 내용을 함수로 분리한 것)
void joystickControl() {
  for (int i = 0; i < SERVOS; i++) {
    int v = analogRead(ANA[i]);
    int cur = myservo[i].read();
    if (v > 612 && cur < MAX[i])      myservo[i].write(cur + 1);
    else if (v < 412 && cur > MIN[i]) myservo[i].write(cur - 1);
  }
}

void printAngles() {
  Serial.print(F("현재 각도 -> { "));
  for (int i = 0; i < SERVOS; i++) {
    Serial.print(myservo[i].read());
    if (i < SERVOS - 1) Serial.print(F(", "));
  }
  Serial.println(F(" }"));
}

// ------------------------------------------------------------
//  [버튼으로 실행하기] — 조이스틱 버튼이나 별도 푸시버튼을 쓸 때
//  기본 배선에는 버튼이 없다. 버튼 한쪽을 디지털 핀, 다른 쪽을 GND에
//  연결한 뒤(내부 풀업 사용) 아래처럼 바꾼다. (BUTTON_PIN은 실제 핀으로)
//
//    const int BUTTON_PIN = 7;
//    setup() 안:  pinMode(BUTTON_PIN, INPUT_PULLUP);
//    loop() 안:   if (digitalRead(BUTTON_PIN) == LOW) autoPickAndPlace();
// ------------------------------------------------------------
