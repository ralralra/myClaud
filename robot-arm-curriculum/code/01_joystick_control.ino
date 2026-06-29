// ============================================================
//  [1단계] 조이스틱 직접 제어 (기본 코드)
//  싸이피아 아두이노 6자유도 로봇팔 - www.scipia.co.kr
// ------------------------------------------------------------
//  이 코드는 "조이스틱을 움직이면 그만큼 서보가 돈다"가 전부다.
//  1~5차시(수동 조작) 수업의 출발점이며, 구조만 이해하면 된다.
//  ※ 함수/버튼/자동화는 2,3단계 코드(02_, 03_)에서 추가한다.
// ============================================================

#include <Servo.h>

const int SERVOS = 6;
int PIN[SERVOS], value[SERVOS], idle[SERVOS], currentAngle[SERVOS], MIN[SERVOS];
int MAX[SERVOS], INITANGLE[SERVOS], previousAngle[SERVOS], ANA[SERVOS];
Servo myservo[SERVOS];

void setup() {
  //  서보별 설정: 핀 / 최소각 / 최대각 / 초기각 / 조이스틱 아날로그 채널
  //  #1 서보 (보통 베이스 회전)
  PIN[0] = 3;   MIN[0] = 0; MAX[0] = 180; INITANGLE[0] = 90; ANA[0] = 0;
  //  #2 서보
  PIN[1] = 2;   MIN[1] = 0; MAX[1] = 180; INITANGLE[1] = 90; ANA[1] = 1;
  //  #3 서보
  PIN[2] = 9;   MIN[2] = 0; MAX[2] = 180; INITANGLE[2] = 90; ANA[2] = 2;
  //  #4 서보
  PIN[3] = 8;   MIN[3] = 0; MAX[3] = 180; INITANGLE[3] = 90; ANA[3] = 3;
  //  #5 서보
  PIN[4] = 4;   MIN[4] = 0; MAX[4] = 180; INITANGLE[4] = 90; ANA[4] = 4;
  //  #6 서보 (그리퍼: 가동범위가 좁다)
  PIN[5] = 5;   MIN[5] = 0; MAX[5] = 90;  INITANGLE[5] = 45; ANA[5] = 5;

  for (int i = 0; i < SERVOS; i++) {
    myservo[i].attach(PIN[i]);
    myservo[i].write(INITANGLE[i]);   // 전원을 켜면 초기 자세로
    value[i] = 0;
    idle[i] = 0;
    previousAngle[i] = INITANGLE[i];
  }
}

void loop() {
  delay(50);  // 로봇팔 속도 조정용 딜레이 (작을수록 빠름)

  for (int i = 0; i < SERVOS; i++) {
    value[i] = analogRead(ANA[i]);        // 조이스틱 입력값(0~1023)
    currentAngle[i] = myservo[i].read();  // 현재 서보 각도

    if (value[i] > 612) {                 // 조이스틱을 한쪽으로 밀면 +방향
      idle[i] = 0;
      if (currentAngle[i] < MAX[i]) ++currentAngle[i];
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]);
      myservo[i].write(currentAngle[i]);
    } else if (value[i] < 412) {          // 반대로 밀면 -방향
      idle[i] = 0;
      if (currentAngle[i] > MIN[i]) --currentAngle[i];
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]);
      myservo[i].write(currentAngle[i]);
    } else {                              // 가운데(중립)면 멈춤
      ++idle[i];
    }
  }
}
