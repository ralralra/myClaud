// ============================================================
//  [2단계] 조이스틱 제어 + 시리얼로 "각도값 기록"
//  싸이피아 6자유도 로봇팔 - www.scipia.co.kr
// ------------------------------------------------------------
//  1단계 코드에 Serial(시리얼 통신)을 추가했다.
//  기본 코드만으로는 "지금 서보가 몇 도인지" 볼 방법이 없어서
//  8차시(각도값 기록)를 진행할 수 없다. 이 코드가 그 문제를 푼다.
//
//  사용법:
//   1) 로봇팔을 조이스틱으로 원하는 자세로 맞춘다.
//   2) 시리얼 모니터(9600 baud)에서 p 를 입력하고 Enter.
//   3) 현재 6축 각도가 { } 형태로 출력된다 → 활동지/코드에 그대로 복사.
// ============================================================

#include <Servo.h>

const int SERVOS = 6;
int PIN[SERVOS], value[SERVOS], idle[SERVOS], currentAngle[SERVOS], MIN[SERVOS];
int MAX[SERVOS], INITANGLE[SERVOS], previousAngle[SERVOS], ANA[SERVOS];
Servo myservo[SERVOS];

void setup() {
  Serial.begin(9600);                       // ★ 추가: 컴퓨터와 통신 시작

  PIN[0] = 3;   MIN[0] = 0; MAX[0] = 180; INITANGLE[0] = 90; ANA[0] = 0;
  PIN[1] = 2;   MIN[1] = 0; MAX[1] = 180; INITANGLE[1] = 90; ANA[1] = 1;
  PIN[2] = 9;   MIN[2] = 0; MAX[2] = 180; INITANGLE[2] = 90; ANA[2] = 2;
  PIN[3] = 8;   MIN[3] = 0; MAX[3] = 180; INITANGLE[3] = 90; ANA[3] = 3;
  PIN[4] = 4;   MIN[4] = 0; MAX[4] = 180; INITANGLE[4] = 90; ANA[4] = 4;
  PIN[5] = 5;   MIN[5] = 0; MAX[5] = 90;  INITANGLE[5] = 45; ANA[5] = 5;

  for (int i = 0; i < SERVOS; i++) {
    myservo[i].attach(PIN[i]);
    myservo[i].write(INITANGLE[i]);
    value[i] = 0;
    idle[i] = 0;
    previousAngle[i] = INITANGLE[i];
  }

  Serial.println(F("로봇팔 준비 완료. 자세를 맞춘 뒤 p 를 입력하면 각도값이 기록됩니다."));
}

void loop() {
  delay(50);

  // ── 조이스틱 직접 제어 (1단계와 동일) ──
  for (int i = 0; i < SERVOS; i++) {
    value[i] = analogRead(ANA[i]);
    currentAngle[i] = myservo[i].read();

    if (value[i] > 612) {
      if (currentAngle[i] < MAX[i]) ++currentAngle[i];
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]);
      myservo[i].write(currentAngle[i]);
    } else if (value[i] < 412) {
      if (currentAngle[i] > MIN[i]) --currentAngle[i];
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]);
      myservo[i].write(currentAngle[i]);
    }
  }

  // ── ★ 추가: 시리얼 명령으로 현재 각도 기록 ──
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'p' || cmd == 'P') {
      printAngles();
    }
  }
}

// 현재 6축 각도를 한 줄로 출력한다.
// 출력 예:  현재 각도 -> { 90, 120, 60, 90, 90, 20 }
void printAngles() {
  Serial.print(F("현재 각도 -> { "));
  for (int i = 0; i < SERVOS; i++) {
    Serial.print(myservo[i].read());
    if (i < SERVOS - 1) Serial.print(F(", "));
  }
  Serial.println(F(" }"));
}
