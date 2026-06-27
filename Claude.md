# myClaud — 프로젝트 안내

## 이 저장소는 무엇인가
연구·저술·교육 콘텐츠 작업을 모아둔 워크스페이스다. 대부분 한국어 학술 글쓰기와
교재 집필이며, 웹앱 한 개(`speech-reader-pro`)가 포함되어 있다.
일반적인 소프트웨어 저장소가 아니라 "글·자료 중심 저장소"로 다룰 것.

## 폴더 구조
- `Thesis/` — 논문·저술. AI 의인화 등재논문, 「과학문명과 인간의 철학적 이해」
  (탈로스·골렘·판도라 → 피노키오 → 프랑켄슈타인 → 나이팅게일 구조).
  `안A/`·`안B/`는 같은 글의 서로 다른 구성안이다.
- `doctoral_dissertation/` — 박사논문(생성형 AI와 비판적 사고, 인지적 외주화, 메타인지).
  - `Cited datem/` : 인용 PDF 원본 (읽기용 소스)
  - `dissertation.md` : 학위논문 본문
  - `journal_article.md` : 학술지 투고용
  - `build_presentation.py` : 발표자료(pptx) 생성 스크립트
- `bigdata_visual/` — 빅데이터 시각화 참고자료(PDF·txt). 읽기 전용 소스.
- `bigdata_visual_book/` — 교재 「인공지능과 함께하는 데이터 리터러시와 시각화 실습」.
  본문 `.md` + `images/`.
- `speech-reader-pro/` — React + Vite + TypeScript 웹앱(유일한 코드 프로젝트).

## 작업 환경
- 원격(웹) 세션에서는 SessionStart 훅이 자동으로 poppler-utils를 설치한다.
  → `pdftotext`, `pdftoppm`으로 PDF 텍스트·이미지를 추출할 수 있다.
  인용 PDF 자료를 읽거나 인용할 때 이 도구를 활용할 것.
- `speech-reader-pro` 빌드:
  - 설치: `cd speech-reader-pro && npm install`
  - 개발 서버: `npm run dev`
  - 빌드: `npm run build`
- `build_presentation.py` 실행 시 필요한 패키지는 실행 전 확인할 것
  (python-pptx 등이 필요할 수 있음).

## 글쓰기 규칙 (가장 중요)
- 기본은 한국어 문어체("~하였다")로 작성한다.
- 논문 작성 시:
  - 사실 확인되지 않은 내용은 포함하지 않는다. 추정 수치·과장 표현 금지.
  - 표와 인용을 반드시 포함한다.
  - 도식(Figure)은 Figure 3 이후, 표(Table)는 Table 4 이후부터 순차 적용한다.
- 사업계획서·제안서 작성 시:
  - 문장 종결을 "~했음.", "~필요.", "~요구." 형태로 작성한다.
  - 사실 기반으로만 작성하고, 허구적 사례·근거 없는 일반화는 넣지 않는다.
  - 가능하면 출처 링크를 함께 제공한다.
- "기여한다" 같은 상투적·반복적 표현을 피하고 자연스러운 표현을 사용한다.
- 무조건적 긍정 평가를 지양하고, 더 나은 대안이 있으면 먼저 제시한다.

## 주의사항
- `bigdata_visual/`와 `Cited datem/`의 원본 PDF·자료는 수정하지 말 것(참고 소스).
- `main` 브랜치에 직접 푸시하기보다 새 브랜치를 만들어 작업할 것.
- 이미지 파일(`images/`)은 본문에서 참조만 하고, 임의로 삭제·이동하지 말 것.
