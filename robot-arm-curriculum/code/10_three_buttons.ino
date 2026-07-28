// ============================================================================
//  [10] 버튼 3개로 서로 다른 동작 실행하기
// ----------------------------------------------------------------------------
//  [배선]  조이스틱 SW 3개 → 디지털 13 · 12 · 11번,  각 SW의 반대쪽은 GND
//          (INPUT_PULLUP 사용 → 누르면 LOW, 안 누르면 HIGH)
//
//  [동작]  버튼1(13번) → action1() : 홈 자세로 안전 복귀
//          버튼2(12번) → action2() : 자동 Pick & Place (집어서 옮기기)
//          버튼3(11번) → action3() : 인사 + 손 흔들기
//          시리얼 모니터에 1 / 2 / 3 을 입력해도 같은 동작이 실행된다.
//
//  [2번 모터(어깨) 보호]  ★ 이 코드의 핵심
//    · STEP_DELAY = 50 : 1도 움직일 때마다 50ms 쉰다 → 천천히·부드럽게
//    · softStart()     : 전원을 켤 때 급출발(슬램) 없이 서서히 초기 자세로
//    · MINA/MAXA       : 2번 서보는 40~140도로 제한해 무리한 자세를 막는다
//    · 그래도 전원 켜기 전에는 팔을 홈(≈90도) 근처로 접어 두고,
//      서보 전원은 외부 전원(5~6V·2A↑) + 아두이노와 공통 GND 를 쓴다.
//
//  ※ 13번 핀은 보드의 내장 LED와 연결되어 있어, 클론 보드에서는 INPUT_PULLUP
//    입력이 불안정할 수 있다. 버튼1이 눌리지 않거나 계속 눌린 것처럼 동작하면
//    BTN[0] 을 다른 핀(예: 10 또는 7)으로 바꾸거나 외부 풀업(10kΩ)을 단다.
// ============================================================================

#include <Servo.h>

const int SERVOS = 6;          // 서보(관절) 개수
const int GRIPPER = 5;         // 그리퍼 = 6번 서보(인덱스 5)
const int STEP_DELAY = 50;     // ★ 1도 움직일 때마다 쉬는 시간(ms). 크면 더 천천히

// ── 버튼 3개 (조이스틱 SW) ──
const int BTN[3] = { 13, 12, 11 };        // 버튼1, 버튼2, 버튼3의 핀 번호
boolean lastBtn[3] = { HIGH, HIGH, HIGH }; // 각 버튼의 직전 상태(눌린 '순간' 감지용)

// ── 서보 설정 ──                1번  2번  3번  4번  5번  6번(그리퍼)
int PIN[SERVOS]       = {   2,   3,   9,   8,   4,   5 };  // 연결 핀
int MINA[SERVOS]      = {   0,  40,   0,   0,   0,   0 };  // 최소 각도(2번은 40도까지만)
int MAXA[SERVOS]      = { 180, 140, 180, 180, 180,  90 };  // 최대 각도(2번은 140도까지만)
int INITANGLE[SERVOS] = {  90,  90,  90,  90,  90,  45 };  // 시작(홈) 각도
Servo myservo[SERVOS];

const int GRIP_OPEN  = 0;      // 그리퍼 열림 0도
const int GRIP_CLOSE = 90;     // 그리퍼 닫힘 90도

// ── 동작에 쓸 자세들 { 1번, 2번, 3번, 4번, 5번, (6번은 무시) } ──
//    활동지에 기록한 자기 로봇팔 각도값으로 바꿔 넣으면 된다.
int HOME[SERVOS]        = {  90,  90,  90,  90,  90, 0 };  // 기본 홈 자세
int PICK_READY[SERVOS]  = {  60, 100,  80,  90,  90, 0 };  // 집을 물체 위(상공)
int PICK[SERVOS]        = {  60, 120, 110,  90,  90, 0 };  // 집는 위치
int PLACE_READY[SERVOS] = { 120, 100,  80,  90,  90, 0 };  // 놓을 곳 위(상공)
int PLACE[SERVOS]       = { 120, 120, 110,  90,  90, 0 };  // 놓는 위치
int BOW[SERVOS]         = {  90, 115, 120,  90,  90, 0 };  // 인사(살짝 숙이기)
int WAVE_L[SERVOS]      = {  65,  85, 110,  90,  65, 0 };  // 손 흔들기 왼쪽
int WAVE_R[SERVOS]      = { 115,  85, 110,  90, 115, 0 };  // 손 흔들기 오른쪽

void setup() {
  Serial.begin(9600);

  for (int i = 0; i < 3; i++) pinMode(BTN[i], INPUT_PULLUP);  // 버튼 3개 입력 설정

  softStart();   // ★ 급출발 없이 부드럽게 시작

  Serial.println(F("준비 완료!  버튼1=홈,  버튼2=집어 옮기기,  버튼3=인사+손 흔들기"));
  Serial.println(F("(시리얼로 1 / 2 / 3 을 입력해도 됩니다)"));
}

void loop() {
  // ── 버튼 3개를 하나씩 확인 ──
  for (int i = 0; i < 3; i++) {
    boolean now = digitalRead(BTN[i]);              // 지금 상태 읽기

    if (lastBtn[i] == HIGH && now == LOW) {         // HIGH→LOW = 방금 눌림
      delay(20);                                    // 떨림(채터링) 방지
      if (digitalRead(BTN[i]) == LOW) {             // 진짜 눌린 게 맞으면
        if (i == 0)      action1();                 // 버튼1 → 동작1
        else if (i == 1) action2();                 // 버튼2 → 동작2
        else             action3();                 // 버튼3 → 동작3
      }
    }
    lastBtn[i] = now;                               // 상태 저장(다음 비교용)
  }

  // ── 시리얼로도 실행 가능 (버튼 배선 확인·디버깅용) ──
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '1')      action1();
    else if (cmd == '2') action2();
    else if (cmd == '3') action3();
  }

  delay(10);
}

// ============================================================================
//   ★ 버튼별 동작 함수 — 여기를 바꾸면 버튼이 하는 일이 바뀐다
// ============================================================================

// [동작1] 홈 자세로 안전 복귀 — 작업 전후에 쓰는 기본 동작
void action1() {
  Serial.println(F(">> 동작1 : 홈 자세로"));
  gripperOpen();       // 손을 펴고
  moveTo(HOME);        // 홈 자세로 천천히 이동
  Serial.println(F("   완료"));
}

// [동작2] 자동 Pick & Place — 함수들을 '순서대로' 불러 자동화
void action2() {
  Serial.println(F(">> 동작2 : 집어서 옮기기"));
  gripperOpen();          // 손 펴고
  moveTo(PICK_READY);     // 물체 위로
  moveTo(PICK);           // 내려가서
  gripperClose();         // 집고
  moveTo(PICK_READY);     // 들어올리고
  moveTo(PLACE_READY);    // 놓을 곳 위로
  moveTo(PLACE);          // 내려놓을 위치로
  gripperOpen();          // 놓고
  moveTo(PLACE_READY);    // 다시 올라와서
  moveTo(HOME);           // 홈으로
  Serial.println(F("   완료"));
}

// [동작3] 인사 + 손 흔들기 — 데모데이 시연용
void action3() {
  Serial.println(F(">> 동작3 : 인사 + 손 흔들기"));
  moveTo(BOW);            // 살짝 숙여 인사
  moveTo(HOME);           // 다시 세우고
  moveTo(WAVE_L);         // 손 흔들기 (왼쪽)
  moveTo(WAVE_R);         // (오른쪽)
  moveTo(WAVE_L);         // (왼쪽)
  moveTo(HOME);           // 홈으로
  Serial.println(F("   완료"));
}

// ============================================================================
//   공통 함수들
// ============================================================================

// [함수] 팔(1~5번)을 목표 자세로 1도씩 천천히 이동시킨다.
//   · STEP_DELAY(50ms) 만큼 쉬어 가며 움직여 2번 모터에 무리가 덜 간다.
//   · 그리퍼(6번)는 건드리지 않는다 → 옮기는 도중 물체를 놓치지 않게.
void moveTo(int target[]) {
  boolean moving = true;
  while (moving) {
    moving = false;
    for (int i = 0; i < GRIPPER; i++) {          // 0~4번(팔)만
      int goal = constrain(target[i], MINA[i], MAXA[i]);  // 안전 범위 안으로
      int cur  = myservo[i].read();
      if (cur < goal)      { myservo[i].write(cur + 1); moving = true; }  // +1도
      else if (cur > goal) { myservo[i].write(cur - 1); moving = true; }  // -1도
    }
    delay(STEP_DELAY);   // ★ 천천히 — 이 숫자를 키우면 더 부드럽다
  }
}

// [함수] 그리퍼 열기 / 닫기 — 손만 제어
void gripperOpen()  { myservo[GRIPPER].write(GRIP_OPEN);  delay(400); }
void gripperClose() { myservo[GRIPPER].write(GRIP_CLOSE); delay(400); }

// [함수] 안전 시작 — 서보를 한 개씩 연결하고 초기 자세로 서서히 이동
//   전원/업로드 순간 팔이 튀면서 2번 모터 기어가 상하는 것을 막는다.
void softStart() {
  const int FROM = 90;                     // 서보 기본 펄스 ≈ 90도로 가정

  for (int i = 0; i < SERVOS; i++) {       // ① 한 개씩 순차 연결(전류 몰림 방지)
    myservo[i].attach(PIN[i]);
    myservo[i].write(FROM);
    delay(150);
  }
  delay(300);

  for (int step = 0; step <= 100; step++) { // ② 초기 자세까지 100단계로 서서히
    for (int i = 0; i < SERVOS; i++) {
      myservo[i].write(FROM + (INITANGLE[i] - FROM) * step / 100);
    }
    delay(15);
  }
}
