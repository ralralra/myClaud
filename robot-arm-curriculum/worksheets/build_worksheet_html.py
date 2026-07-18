# -*- coding: utf-8 -*-
import html

# ---------------- 콘텐츠 데이터 ----------------
sessions = [
 dict(no=1, title="로봇팔 깨우기", goal="로봇팔을 조립·배선 점검하고, 조이스틱으로 자유롭게 조작해 본다.",
   mission="전원을 켜고 조이스틱만으로 30초 안에 그리퍼로 '목표 지점'을 터치하라! (선생님이 정한 컵·스티커 등)",
   code="01_joystick_control.ino",
   tables=[("1. 로봇팔 관절 매핑표 (조작하며 채우기)",
            ["서보 번호","연결 핀","움직이는 부위","움직임 설명","확인"],
            [[f"{i}번 서보","","","","☐"] for i in range(1,7)]),
           ("2. 워밍업 게임 기록",
            ["시도","성공까지 걸린 시간","가장 어려웠던 점"],
            [["1차","",""],["2차","",""],["3차","",""]])],
   qs=["자동차 로봇과 로봇팔의 가장 큰 차이는 무엇인가?","로봇팔에서 서보모터가 중요한 이유는 무엇인가?","GND(접지) 연결이 중요한 이유는 무엇인가?"]),
 dict(no=2, title="코드 해부 — 코드 탐정", goal="샘플 코드의 구조(setup/loop)·핀·각도·조건문을 찾고, 값을 바꿔 동작 변화를 관찰한다.",
   mission="코드의 숫자를 일부러 바꿔 무슨 일이 일어나는지 알아내라! (예: delay 줄이기, MAX 줄이기, PIN 바꾸기)",
   code="01_joystick_control.ino",
   tables=[("1. 코드 해석표 (코드에서 값 찾기)",
            ["코드 요소","코드에서 찾은 값","의미(내 말로)"],
            [["서보모터 개수","",""],["서보 핀 번호","",""],["조이스틱 입력 핀","",""],["초기 각도값","",""],["최소/최대 각도","",""],["조이스틱 기준값(612/412)","",""]]),
           ("2. 코드 탐정 실험 — 바꾸고 관찰하기",
            ["바꾼 부분","원래 값 → 바꾼 값","로봇팔에 생긴 변화"],
            [["delay()","",""],["MAX 각도","",""],["PIN(핀 번호)","",""]])],
   qs=["핀 번호를 잘못 쓰면 어떤 문제가 생길까?","612와 412 사이를 '멈춤'으로 둔 이유는 무엇일까?","최소·최대 각도 제한이 필요한 이유는 무엇인가?"]),
 dict(no=3, title="조이스틱 마스터", goal="조이스틱 정밀 조작 능력을 기르고, 안정적으로 움직이는 방법을 찾는다.",
   mission="[택1] ① 블록 타워 가장 높이 쌓기  ② 컵 옮기기 타임어택 — 팀 최고기록에 도전!",
   code="01_joystick_control.ino",
   tables=[("1. 정밀 조작 도전 기록",
            ["시도","기록(높이/시간)","실패 원인","개선 아이디어"],
            [["1차","","",""],["2차","","",""],["3차","","",""]]),
           ("2. 움직임 관찰",
            ["관찰 항목","기록"],
            [["가장 조작하기 쉬운 관절",""],["가장 어려운 관절",""],["팔이 흔들렸던 상황",""],["안정적으로 움직이는 나만의 요령",""]])],
   qs=["로봇팔을 한 번에 크게 움직이면 어떤 문제가 생길까?","정밀 제어가 필요한 이유는 무엇인가?"]),
 dict(no=4, title="홈 포지션 & 안전", goal="안정적인 기본 자세(홈 포지션)를 찾아 초기 각도값을 수정한다.",
   mission="1mm 챌린지 — 펜 끝을 매번 '같은 점'에 닿게 하라. 5번 중 몇 번이나 같은 자리에 닿는가?",
   code="01 (INITANGLE 값 수정)",
   tables=[("1. 홈 포지션 각도표",
            ["서보 번호","기존 초기값","수정한 초기값","수정 이유"],
            [[f"{i}번 서보","","",""] for i in range(1,7)]),
           ("2. 안정성 점검",
            ["점검 항목","예/아니오","설명"],
            [["전원을 켰을 때 갑자기 크게 움직이지 않는다","☐ 예  ☐ 아니오",""],["그리퍼가 바닥에 닿지 않는다","☐ 예  ☐ 아니오",""],["팔이 너무 앞으로 기울지 않는다","☐ 예  ☐ 아니오",""],["다시 실행해도 같은 자세로 온다","☐ 예  ☐ 아니오",""]])],
   qs=["홈 포지션이 필요한 이유는 무엇인가?","내가 수정한 각도값 중 가장 중요한 값은 무엇인가?","안전한 로봇팔 제어를 위해 주의할 점은 무엇인가?"]),
 dict(no=5, title="그리퍼 장인", goal="그리퍼 각도를 조절해 다양한 물체를 안정적으로(부드럽게) 집는다.",
   mission="깨지기 쉬운 화물 운반 — 마시멜로/종이컵을 터뜨리지 않고 옮겨라! (그리퍼: 열림 0° / 닫힘 90°) 가장 적은 힘으로 집은 팀 승!",
   code="01_joystick_control.ino",
   tables=[("1. 물체별 집기 실험 기록표",
            ["물체","열린 각도","닫힌 각도","성공 여부","실패 원인"],
            [["스펀지 큐브","","","☐ 성공  ☐ 실패",""],["종이컵","","","☐ 성공  ☐ 실패",""],["마시멜로","","","☐ 성공  ☐ 실패",""],["둥근 물체","","","☐ 성공  ☐ 실패",""]]),
           ("2. 가장 쉬운/어려운 물체",
            ["항목","내용"],
            [["가장 잘 집힌 물체",""],["이유",""],["가장 어려운 물체",""],["이유",""]])],
   qs=["그리퍼 각도를 너무 작게/크게 하면 어떤 문제가 생기는가?","로봇팔이 물체를 집을 때 고려해야 할 점은 무엇인가?"]),
 dict(no=6, title="로봇과 대화하기 (Serial)", goal="코드에 Serial을 추가해 현재 각도를 화면으로 읽고, 멋진 자세를 각도값으로 캡처한다.",
   mission="자세 사진사 — 멋진 포즈를 잡고 시리얼 모니터에 'p'를 입력해 각도값을 캡처하라. 친구와 값을 교환해 똑같이 재현해 보기!",
   code="02_serial_record.ino",
   tables=[("1. 캡처한 자세 기록 ( p 입력으로 출력된 값 )",
            ["자세 이름","1번","2번","3번","4번","5번","6번(그리퍼)"],
            [["예) 인사 자세","","","","","",""],["","","","","","",""],["","","","","","",""]]),
           ("2. 친구 자세 재현 결과",
            ["받은 자세","재현 성공?","달랐던 점"],
            [["","☐ 성공  ☐ 실패",""]])],
   qs=["로봇의 움직임을 '숫자(각도)'로 기록한다는 것은 어떤 의미인가?","Serial(시리얼)이 없으면 왜 각도값을 기록하기 어려운가?"]),
 dict(no=7, title="Pick & Place 작전", goal="물체를 A→B로 옮기는 작업 순서를 설계하고 수동으로 수행한다.",
   mission="택배 분류 타임어택 — A구역 물체를 B구역으로! 작업 순서를 먼저 설계하고 가장 빠르고 정확하게.",
   code="02_serial_record.ino",
   tables=[("1. 작업 순서 설계표",
            ["순서","동작","주의할 점"],
            [[str(i),"",""] for i in range(1,7)]),
           ("2. 수행 기록",
            ["시도","걸린 시간","성공 여부","개선점"],
            [["1차","","☐ 성공  ☐ 실패",""],["2차","","☐ 성공  ☐ 실패",""]])],
   qs=["작업을 순서대로 나누는 것이 왜 중요한가?","사람이 하던 분류를 로봇이 하면 무엇이 좋아지는가?"]),
 dict(no=8, title="자세 레시피 북", goal="성공한 자세들을 각도값으로 기록·정리해, 자동화에 쓸 '포즈 카드'를 만든다.",
   mission="HOME·PICK·PLACE 포즈 카드를 완성하라. 이 값이 다음 시간 '자동화'의 재료가 된다!",
   code="02_serial_record.ino",
   tables=[("1. 포즈 카드 (자동화에 넣을 핵심 자세)",
            ["포즈 이름","1번","2번","3번","4번","5번","6번"],
            [["HOME (기본)","","","","","",""],["PICK_READY (집기 직전)","","","","","",""],["PICK (집는 위치)","","","","","",""],["PLACE_READY (놓기 직전)","","","","","",""],["PLACE (놓는 위치)","","","","","",""]]),
           ("2. 점검",
            ["점검 항목","예/아니오"],
            [["같은 값을 다시 입력하면 비슷한 자세가 재현된다","☐ 예  ☐ 아니오"],["불필요한(중복) 자세를 제외했다","☐ 예  ☐ 아니오"]])],
   qs=["각도값을 다시 입력했을 때 같은 동작이 나와야 하는 이유는?","기록한 자세 중 가장 중요한 자세는 무엇이고 왜인가?"]),
 dict(no=9, title="함수 만들기", goal="반복되는 로봇팔 동작을 함수로 만들고, 호출해서 실행한다.",
   mission="내 함수 만들기 — gripperOpen()/gripperClose()부터 만들고, goHome()과 나만의 동작 함수(예: wave())까지 완성하라!",
   code="03_functions_button.ino",
   tables=[("1. 함수 설계표",
            ["함수 이름","하는 일","사용한 명령/값"],
            [["gripperOpen()","그리퍼 열기",""],["gripperClose()","그리퍼 닫기",""],["goHome()","홈 자세로 이동",""],["내가 만든 함수 (          )","",""]]),
           ("2. 함수 전/후 비교",
            ["구분","코드가 어떻게 달라졌나"],
            [["함수 없이 직접 쓸 때(복붙)",""],["함수로 만든 뒤",""]])],
   qs=["함수를 쓰면 무엇이 편리해지는가?","매개변수(괄호 안 값)를 받는 함수의 장점은 무엇인가?"]),
 dict(no=10, title="자동 Pick & Place", goal="기록한 포즈와 함수를 활용해, 버튼(또는 명령) 한 번으로 자동 동작을 실행한다.",
   mission="원클릭 공장 — 버튼(조이스틱 SW, 디지털 7번)을 누르면 집기→옮기기→놓기가 자동으로! 10번 중 몇 번 성공하나?",
   code="03_functions_button.ino",
   tables=[("1. 자동화 동작 흐름도 (함수 호출 순서)",
            ["순서","호출한 함수","목표 포즈"],
            [[str(i),"",""] for i in range(1,8)]),
           ("2. 자동화 성공률 테스트",
            ["시도 묶음","성공/시도","주된 실패 원인","조정한 값"],
            [["1~10회","      / 10","",""],["11~20회","      / 10","",""]])],
   qs=["수동 조작과 자동 실행의 차이는 무엇인가?","자동 동작이 실패할 때, 코드에서 어떤 값을 조정해야 하나?"]),
 dict(no=11, title="최종 미션 설계 & 튜닝", goal="팀별 미니 챌린지를 직접 설계하고, 반복 테스트로 성공률을 높인다.",
   mission="우리 팀 미션을 설계하라! (예: 색깔 분류, 컵 피라미드, 도미노, 캘리그래피, 미니 농구…) 수동+자동을 섞어도 좋다.",
   code="03_functions_button.ino",
   tables=[("1. 최종 미션 설계표",
            ["항목","내용"],
            [["미션 이름",""],["목표(성공 기준)",""],["사용 물체/소품",""],["수동/자동 구성",""],["예상 어려움",""]]),
           ("2. 튜닝 기록",
            ["테스트","성공률","바꾼 값","결과"],
            [["1차","","",""],["2차","","",""],["3차","","",""]])],
   qs=["성공률을 높이기 위해 가장 효과적이었던 조정은 무엇인가?","우리 미션을 실제 산업현장과 연결하면 어떤 사례와 닮았는가?"]),
 dict(no=12, title="데모데이 & 진로", goal="최종 미션을 시연하고, 활동 경험을 로봇·자동화 진로와 연결해 발표한다.",
   mission="데모데이! 다른 팀 앞에서 미션을 시연하고, 우리 로봇팔의 '직업'을 상상해 발표하라.",
   code="03_functions_button.ino",
   tables=[("1. 최종 미션 결과 기록",
            ["항목","내용"],
            [["미션 이름",""],["최종 성공률",""],["가장 자랑스러운 점",""],["다음에 개선할 점",""]]),
           ("2. 진로 연결 발표 준비",
            ["질문","우리 팀 답변"],
            [["이 로봇팔과 닮은 직업/산업은?",""],["오늘 배운 것 중 진로에 쓸 수 있는 것은?",""],["더 만들어보고 싶은 자동화는?",""]])],
   qs=["로봇 자동화가 늘어나면 우리 생활은 어떻게 바뀔까?","이번 수업에서 새로 알게 된 가장 중요한 것은 무엇인가?"]),
]

E = html.escape

def render_table(headers, rows):
    th = "".join(f"<th>{E(h)}</th>" for h in headers)
    trs = ""
    for row in rows:
        tds = "".join(f"<td>{E(c)}</td>" for c in row)
        trs += f"<tr>{tds}</tr>"
    return f'<table class="grid"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'

def block(title, headers, rows, weight):
    return (f'<div class="block" style="flex-grow:{weight}">'
            f'<h3 class="sec">{E(title)}</h3>{render_table(headers, rows)}</div>')

def render_session(s):
    parts = [f'''
    <section class="page">
      <div class="hd">
        <div class="badge">{s["no"]}<span>차시</span></div>
        <div class="hdtxt"><h2>{E(s["title"])}</h2>
          <div class="goal"><b>학습목표</b> {E(s["goal"])}</div></div>
        <div class="codechip">💻 {E(s["code"])}</div>
      </div>
      <div class="mission"><span class="mtag">🏆 도전 미션</span> {E(s["mission"])}</div>
      <div class="content">''']
    # 표 블록 — 행 수에 비례해 세로 공간을 나눠 가져 페이지를 꽉 채우고 입력칸을 키운다
    for title, headers, rows in s["tables"]:
        w = max(2, len(rows))
        parts.append(block(title, headers, rows, w))
    qrows = [[q, ""] for q in s["qs"]]
    parts.append(block("✏️ 오늘의 정리", ["질문","나의 답변"], qrows, max(2, len(qrows))))
    parts.append('</div>')  # /content
    parts.append('<div class="foot">아두이노 6자유도 로봇팔 · 스마트 자동화 미션</div>')
    parts.append('</section>')
    return "".join(parts)

cover = '''
<section class="page cover">
  <div class="coverwrap">
    <div class="kicker">ARDUINO 6-DOF ROBOT ARM</div>
    <h1>아두이노 6자유도 로봇팔<br><span>학습활동지</span></h1>
    <div class="subtitle">6자유도 로봇팔로 배우는 스마트 자동화 미션 · 전 12차시</div>
    <table class="info">
      <tr><td class="k">이　　름</td><td></td><td class="k">팀　　명</td><td></td></tr>
      <tr><td class="k">학번 / 반</td><td></td><td class="k">로봇팔 번호</td><td></td></tr>
    </table>
    <div class="hwbox">
      <b>하드웨어 기준</b>
      <ul>
        <li>그리퍼(6번 서보) : 열림 <b>0°</b> / 닫힘 <b>90°</b></li>
        <li>1~5번 서보 : 중심 <b>90°</b> (가동 0~180°)</li>
        <li>조이스틱 SW핀 → 디지털 <b>7번 + GND</b> 버튼 추가 (자동 실행)</li>
      </ul>
    </div>
    <div class="legend">🤖 수동조작 &nbsp;·&nbsp; 💻 코드 &nbsp;·&nbsp; 🏆 도전·경쟁 미션</div>
  </div>
</section>
'''

report = '''
<section class="page">
  <div class="hd report">
    <div class="badge" style="background:linear-gradient(135deg,#e74c3c,#c0392b)">★<span>보고서</span></div>
    <div class="hdtxt"><h2>최종 미션 보고서 &amp; 자기평가</h2>
     <div class="goal"><b>제출</b> 11~12차시 마무리에 작성하여 제출</div></div>
  </div>
  <div class="content">
    <div class="block" style="flex-grow:5">
      <h3 class="sec">1. 미션 보고서</h3>
      <table class="grid"><tbody>
        <tr><td style="width:18%">팀명</td><td></td><td style="width:18%">작성일</td><td></td></tr>
        <tr><td>사용 부품</td><td colspan="3">로봇팔, 아두이노, 조이스틱, 서보모터(6), 그리퍼</td></tr>
        <tr><td>대표 미션</td><td colspan="3"></td></tr>
        <tr><td>동작 순서</td><td colspan="3"></td></tr>
        <tr><td>핵심 각도값</td><td colspan="3"></td></tr>
      </tbody></table>
    </div>
    <div class="block" style="flex-grow:6">
      <h3 class="sec">2. 자기평가표</h3>
      <table class="grid"><thead><tr><th style="width:68%">평가 항목</th><th>예 / 아니오</th></tr></thead><tbody>
       <tr><td>로봇팔의 관절 구조를 이해하였다</td><td>☐ 예　☐ 아니오</td></tr>
       <tr><td>로봇팔을 안정적으로 조작할 수 있다</td><td>☐ 예　☐ 아니오</td></tr>
       <tr><td>성공 자세를 각도값으로 기록할 수 있다</td><td>☐ 예　☐ 아니오</td></tr>
       <tr><td>반복 동작을 함수로 만들 수 있다</td><td>☐ 예　☐ 아니오</td></tr>
       <tr><td>버튼/명령으로 자동 동작을 실행할 수 있다</td><td>☐ 예　☐ 아니오</td></tr>
       <tr><td>활동을 진로와 연결해 설명할 수 있다</td><td>☐ 예　☐ 아니오</td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="foot">아두이노 6자유도 로봇팔 · 스마트 자동화 미션</div>
</section>
'''

body = cover + "".join(render_session(s) for s in sessions) + report

CSS = '''
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@page { size: A4; margin: 11mm 11mm; }
html, body { margin:0; }
body { font-family: "NanumSquare","NanumGothic",sans-serif; color:#222; font-size:12pt; line-height:1.4; }

/* 한 페이지를 인쇄영역 높이에 맞춰 꽉 채운다 (A4 297mm - 상하 여백 22mm) */
.page { height:275mm; display:flex; flex-direction:column; overflow:hidden; page-break-after:always; }
.page:last-child { page-break-after:auto; }
.content { flex:1 1 auto; display:flex; flex-direction:column; min-height:0; }

/* 헤더 */
.hd { display:flex; align-items:stretch; gap:11px; margin-bottom:10px; flex:0 0 auto; }
.badge { flex:0 0 auto; width:62px; background:linear-gradient(135deg,#1f6feb,#0b3d91); color:#fff;
  border-radius:13px; display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-size:32pt; font-weight:800; line-height:1; }
.badge span { font-size:11pt; font-weight:600; margin-top:3px; }
.hdtxt { flex:1 1 auto; border-bottom:3px solid #1f6feb; padding-bottom:6px; }
.hdtxt h2 { margin:0 0 4px; font-size:21pt; color:#0b3d91; }
.goal { font-size:12pt; color:#333; }
.goal b { color:#1f6feb; margin-right:5px; }
.codechip { flex:0 0 auto; align-self:flex-start; background:#eef4ff; color:#1f4e9b;
  border:1px solid #c7dbff; border-radius:20px; padding:4px 12px; font-size:10.5pt; font-weight:700; }
.hd.report .hdtxt { border-color:#c0392b; }
.hd.report h2 { color:#c0392b; }

/* 미션 박스 */
.mission { background:#fff5ec; border:1.5px solid #f4a261; border-left:7px solid #e76f23;
  border-radius:9px; padding:10px 13px; font-size:12pt; margin-bottom:12px; flex:0 0 auto; }
.mtag { font-weight:800; color:#c45911; margin-right:7px; white-space:nowrap; }

/* 표 블록 — flex-grow(행 수 비례)로 세로 공간을 나눠 입력칸을 크게 */
.block { display:flex; flex-direction:column; min-height:0; margin-bottom:9px; }
.block:last-child { margin-bottom:0; }

/* 섹션 제목 */
.sec { font-size:15pt; color:#1f4e9b; margin:0 0 6px; font-weight:800;
  border-left:6px solid #1f6feb; padding-left:9px; flex:0 0 auto; }

/* 표 — 블록 높이를 꽉 채워 행이 늘어나도록 */
table.grid { width:100%; height:100%; border-collapse:collapse; }
table.grid th, table.grid td { border:1px solid #b9c4d4; padding:6px 8px; font-size:12pt; vertical-align:top; }
table.grid th { background:#dde8fb; color:#163a78; font-weight:700; text-align:center; vertical-align:middle; }
table.grid tbody td:first-child { background:#f5f8ff; font-weight:600; }

.foot { text-align:center; color:#9aa6b6; font-size:9pt; margin-top:8px; letter-spacing:.3px; flex:0 0 auto; }

/* 표지 */
.cover { display:flex; align-items:center; justify-content:center; }
.coverwrap { text-align:center; width:100%; }
.kicker { letter-spacing:5px; color:#1f6feb; font-weight:800; font-size:12px; margin-bottom:14px; }
.cover h1 { font-size:46px; color:#0b3d91; margin:0 0 14px; line-height:1.18; }
.cover h1 span { color:#e76f23; }
.subtitle { font-size:14px; color:#555; margin-bottom:30px; }
table.info { margin:0 auto 26px; border-collapse:collapse; width:80%; }
table.info td { border:1px solid #b9c4d4; height:34px; font-size:12px; padding:4px 10px; }
table.info td.k { background:#dde8fb; color:#163a78; font-weight:700; text-align:center; width:18%; }
.hwbox { width:80%; margin:0 auto 22px; text-align:left; background:#f3f8ff; border:1px solid #c7dbff;
  border-radius:10px; padding:12px 18px; font-size:12px; }
.hwbox b { color:#1f4e9b; }
.hwbox ul { margin:6px 0 0; padding-left:18px; }
.hwbox li { margin:2px 0; }
.legend { color:#666; font-size:11.5px; }
'''

doc = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<title>로봇팔 학습활동지</title><style>{CSS}</style></head>
<body>{body}</body></html>'''

out = "/home/user/myClaud/robot-arm-curriculum/worksheets/로봇팔_학습활동지_디자인.html"
open(out, "w", encoding="utf-8").write(doc)
print("HTML saved:", out, len(doc), "bytes")
