# -*- coding: utf-8 -*-
import html
E = html.escape

CSS = '''
* { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
@page { size:A4; margin:11mm 11mm; }
html,body { margin:0; }
body { font-family:"NanumSquare","NanumGothic",sans-serif; color:#222; font-size:12pt; line-height:1.4; }
.page { height:275mm; display:flex; flex-direction:column; overflow:hidden; page-break-after:always; }
.page:last-child { page-break-after:auto; }
.content { flex:1 1 auto; display:flex; flex-direction:column; min-height:0; }
.hd { display:flex; align-items:stretch; gap:11px; margin-bottom:10px; flex:0 0 auto; }
.badge { flex:0 0 auto; width:62px; background:linear-gradient(135deg,#7b2ff7,#5b14c5); color:#fff;
  border-radius:13px; display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-size:26pt; font-weight:800; line-height:1; }
.badge span { font-size:10pt; font-weight:600; margin-top:3px; }
.hdtxt { flex:1 1 auto; border-bottom:3px solid #7b2ff7; padding-bottom:6px; }
.hdtxt h2 { margin:0 0 4px; font-size:21pt; color:#4a148c; }
.goal { font-size:12pt; color:#333; } .goal b { color:#7b2ff7; margin-right:5px; }
.mission { background:#fff5ec; border:1.5px solid #f4a261; border-left:7px solid #e76f23;
  border-radius:9px; padding:10px 13px; font-size:12pt; margin-bottom:12px; flex:0 0 auto; }
.mtag { font-weight:800; color:#c45911; margin-right:7px; }
.block { display:flex; flex-direction:column; min-height:0; margin-bottom:9px; }
.block:last-child { margin-bottom:0; }
.sec { font-size:15pt; color:#4a148c; margin:0 0 6px; font-weight:800;
  border-left:6px solid #7b2ff7; padding-left:9px; flex:0 0 auto; }
table.grid { width:100%; height:100%; border-collapse:collapse; }
table.grid th, table.grid td { border:1px solid #c4b6dd; padding:6px 8px; font-size:12pt; vertical-align:top; }
table.grid th { background:#ece3fb; color:#4a148c; font-weight:700; text-align:center; vertical-align:middle; }
table.grid tbody td:first-child { background:#f7f3ff; font-weight:600; }
.note { background:#f7f3ff; border:1px solid #d9caf3; border-radius:9px; padding:9px 13px; font-size:12pt; flex:0 0 auto; }
.foot { text-align:center; color:#a99ec0; font-size:9pt; margin-top:8px; flex:0 0 auto; }
'''

def table(headers, rows, weight):
    th = "".join(f"<th>{E(h)}</th>" for h in headers)
    trs = "".join("<tr>" + "".join(f"<td>{E(c)}</td>" for c in r) + "</tr>" for r in rows)
    return (f'<div class="block" style="flex-grow:{weight}">'
            f'<table class="grid"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>')

def sec_table(title, headers, rows, weight):
    th = "".join(f"<th>{E(h)}</th>" for h in headers)
    trs = "".join("<tr>" + "".join(f"<td>{E(c)}</td>" for c in r) + "</tr>" for r in rows)
    return (f'<div class="block" style="flex-grow:{weight}"><h3 class="sec">{E(title)}</h3>'
            f'<table class="grid"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>')

# ---------- 1쪽: 동작 함수 설계 ----------
design_rows = [["예) A","waveHand()","손을 좌우로 흔들기","{60,90,110,90,60} ↔ {120,90,110,90,120}","2박"]]
design_rows += [["", "", "", "", ""] for _ in range(6)]

page1 = f'''
<section class="page">
  <div class="hd">
    <div class="badge">♪<span>군무</span></div>
    <div class="hdtxt"><h2>로봇팔 군무 미션 — 동작 설계</h2>
      <div class="goal"><b>학습목표</b> 함수를 나눠 맡아 각자 '동작'을 만들고, 합쳐서 안무를 완성한다.</div></div>
  </div>
  <div class="mission"><span class="mtag">🏆 도전 미션</span>
    팀원이 동작 함수를 하나씩 만들고(<b>moveTimed(포즈, BEAT)</b>), 모든 팀이 같은 박자로 맞춰 군무를 완성하라!</div>
  <div class="content">
    {sec_table("1. 동작 함수 설계표 (학생별로 하나씩 맡기)",
      ["담당","함수 이름","동작 설명","사용 포즈(각도 1~5번)","박자"], design_rows, 7)}
    <div class="block" style="flex-grow:2">
      <h3 class="sec">2. 동기화 설정</h3>
      <div class="note">
        · 한 박자 <b>BEAT = ______ ms</b> &nbsp;(모든 팀이 <b>똑같은 값</b>을 써야 군무가 맞습니다)<br>
        · 참여 로봇팔 수: <b>______ 대</b> &nbsp;&nbsp; · 전체 안무 길이: <b>______ 박자</b><br>
        · 시작 방법: &nbsp; ☐ 카운트다운 동시 시작(3·2·1!) &nbsp;&nbsp; ☐ 공통 버튼으로 일제 시작
      </div>
    </div>
  </div>
  <div class="foot">아두이노 6자유도 로봇팔 · 군무 미션</div>
</section>
'''

# ---------- 2쪽: 안무 타임라인 + 리허설 ----------
beats1 = [str(i) for i in range(1, 9)]
beats2 = [str(i) for i in range(9, 17)]
tl1 = [["동작"] + [""]*8, ["담당"] + [""]*8]
tl2 = [["동작"] + [""]*8, ["담당"] + [""]*8]
reh = [["1차","☐ 잘 맞음  ☐ 보통  ☐ 어긋남","",""],
       ["2차","☐ 잘 맞음  ☐ 보통  ☐ 어긋남","",""],
       ["3차","☐ 잘 맞음  ☐ 보통  ☐ 어긋남","",""]]
qs = [["박자가 어긋날 때 무엇을 바꾸면 맞출 수 있을까?",""],
      ["여러 대를 정확히 동시에 시작하려면 어떻게 해야 할까?",""]]

page2 = f'''
<section class="page">
  <div class="hd">
    <div class="badge">♪<span>군무</span></div>
    <div class="hdtxt"><h2>로봇팔 군무 미션 — 안무 타임라인</h2>
      <div class="goal"><b>학습목표</b> 동작 함수를 박자에 맞춰 배열하고, 리허설로 군무를 맞춘다.</div></div>
  </div>
  <div class="content">
    {sec_table("1. 안무 타임라인 (박자 1~8)", ["박자"]+beats1, tl1, 3)}
    {sec_table("　　　　　　　　　 (박자 9~16)", ["박자"]+beats2, tl2, 3)}
    {sec_table("2. 리허설 기록", ["회차","박자 정확도","어긋난 부분","개선 방법"], reh, 4)}
    {sec_table("✏️ 오늘의 정리", ["질문","나의 답변"], qs, 3)}
  </div>
  <div class="foot">아두이노 6자유도 로봇팔 · 군무 미션</div>
</section>
'''

doc = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<title>로봇팔 군무 미션 활동지</title><style>{CSS}</style></head>
<body>{page1}{page2}</body></html>'''

out = "/home/user/myClaud/robot-arm-curriculum/worksheets/군무미션_활동지.html"
open(out, "w", encoding="utf-8").write(doc)
print("saved", out, len(doc))
