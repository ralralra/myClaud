// ============================================================
//  [99] 조이스틱 직접 제어 (구버전 — 핀 배치가 04번과 다름, 참고용)
// ------------------------------------------------------------
//  이 코드는 "조이스틱을 움직이면 그만큼 서보가 돈다"가 전부다.
//  1~5차시(수동 조작) 수업의 출발점이며, 구조만 이해하면 된다.
//  ※ 함수/버튼/자동화는 2,3단계 코드(02_, 03_)에서 추가한다.
// ============================================================

#include <Servo.h>          // 서보모터를 쉽게 다루는 라이브러리(도구상자)

const int SERVOS = 6;       // 서보(관절) 개수 = 6개
// 아래 배열들은 6개 서보의 정보를 한 줄에 묶어서 관리한다(변수를 6벌 만들 필요 X)
int PIN[SERVOS];            // 각 서보가 꽂힌 디지털 핀 번호
int value[SERVOS];          // 조이스틱에서 읽은 값(0~1023)을 저장
int idle[SERVOS];           // 조이스틱이 중립(멈춤)인 상태가 이어진 횟수(확장용)
int currentAngle[SERVOS];   // 각 서보의 현재 각도
int MIN[SERVOS];            // 각 서보가 갈 수 있는 최소 각도(안전 하한)
int MAX[SERVOS];            // 각 서보가 갈 수 있는 최대 각도(안전 상한)
int INITANGLE[SERVOS];      // 전원을 켤 때의 시작 각도
int previousAngle[SERVOS];  // 직전 각도 저장(확장용)
int ANA[SERVOS];            // 각 서보를 조종하는 조이스틱(아날로그) 채널 번호
Servo myservo[SERVOS];      // 실제 서보모터 6개

void setup() {              // 전원을 켜면 딱 한 번 실행되는 설정 구역
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
  //  #6 서보 (그리퍼: 열림 0도 / 닫힘 90도, 가동범위 0~90)
  PIN[5] = 5;   MIN[5] = 0; MAX[5] = 90;  INITANGLE[5] = 45; ANA[5] = 5;

  for (int i = 0; i < SERVOS; i++) {  // 서보 6개를 하나씩 준비
    myservo[i].attach(PIN[i]);        // i번 서보를 자기 핀에 연결
    myservo[i].write(INITANGLE[i]);   // 전원을 켜면 초기 자세로 이동
    value[i] = 0;                     // 조이스틱 값 초기화
    idle[i] = 0;                      // 멈춤 카운터 초기화
    previousAngle[i] = INITANGLE[i];  // 직전 각도를 초기각으로 맞춰 둠
  }
}

void loop() {               // 전원이 켜져 있는 동안 계속 반복되는 동작 구역
  delay(50);  // 로봇팔 속도 조정용 딜레이 (작을수록 빠름)

  for (int i = 0; i < SERVOS; i++) {      // 서보 6개를 매번 하나씩 확인
    value[i] = analogRead(ANA[i]);        // 조이스틱 입력값(0~1023) 읽기
    currentAngle[i] = myservo[i].read();  // 현재 서보 각도 읽기

    if (value[i] > 612) {                 // 조이스틱을 한쪽으로 밀면 +방향
      idle[i] = 0;                        // 움직였으니 멈춤 카운터 리셋
      if (currentAngle[i] < MAX[i]) ++currentAngle[i];       // 최대각 전까지 +1도
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]); // 끊겨 있으면 다시 연결
      myservo[i].write(currentAngle[i]);  // 바뀐 각도로 서보 이동
    } else if (value[i] < 412) {          // 반대로 밀면 -방향
      idle[i] = 0;                        // 멈춤 카운터 리셋
      if (currentAngle[i] > MIN[i]) --currentAngle[i];       // 최소각 전까지 -1도
      if (!myservo[i].attached()) myservo[i].attach(PIN[i]); // 끊겨 있으면 다시 연결
      myservo[i].write(currentAngle[i]);  // 바뀐 각도로 서보 이동
    } else {                              // 412~612 사이(가운데)면 멈춤(데드존)
      ++idle[i];                          // 멈춤 상태가 이어진 횟수 +1
    }
  }
}
