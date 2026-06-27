# speech-reader-pro — 프로젝트 안내

## 이 앱은 무엇인가
발표자의 음성을 인식해 대본을 자동으로 따라가며 스크롤·강조해 주는
텔레프롬프터(원고 읽기 보조) 웹앱이다. 설치형 PWA로 배포된다.
- 배포 주소: speechreaderpro.netlify.app (Netlify)
- 핵심 동작: 마이크 입력(Web Speech API)을 대본 문장과 매칭 →
  현재 읽는 위치를 추적해 해당 문장을 강조하고 스크롤한다.

## 기술 스택
- React 18 + TypeScript
- Vite 4 (빌드·개발 서버)
- Tailwind CSS 3 (스타일)
- lucide-react (아이콘)
- vite-plugin-pwa (오프라인·설치형 PWA)
- 상태 저장: 브라우저 `localStorage` (작성한 대본 보관)

## 개발 명령어
- 설치: `npm install`
- 개발 서버: `npm run dev`
- 빌드: `npm run build`  (= `tsc && vite build`, 타입 검사 후 빌드)
- 빌드 결과 미리보기: `npm run preview`
- 빌드 산출물은 `dist/`에 생성된다.

## 작업 시 반드시 주의할 점
- **음성 인식 로직을 함부로 바꾸지 말 것.** `App.tsx`에는 모바일(특히 안드로이드)에서
  음성 세션이 'aborted' 루프에 빠지는 문제를 막기 위한 지연 재시작 로직과,
  stale closure를 방지하기 위해 최신 상태를 `ref`로 유지하는 패턴이 의도적으로 들어 있다.
  이 구조를 단순화하면 모바일에서 동작이 깨지므로, 수정 전 해당 주석을 먼저 읽을 것.
- **한국어 어근 추출(stemWord) 로직 유지.** 조사·어미 목록으로 키워드를 어근화해
  음성-대본 매칭 정확도를 높인다. 목록을 바꾸면 매칭 결과가 달라지니 신중히 수정할 것.
- Web Speech API는 브라우저·기기마다 동작이 다르다. 변경 시 데스크톱 크롬뿐 아니라
  모바일(안드로이드 크롬, iOS 사파리)에서의 영향을 함께 고려할 것.
- `localStorage` 키(`saved-script` 등)를 바꾸면 기존 사용자의 저장 대본이 사라진다.

## 코딩 규칙
- 함수형 컴포넌트 + Hooks 사용. 클래스 컴포넌트 도입하지 말 것.
- 스타일은 Tailwind 유틸리티 클래스 우선.
- 타입을 명시한다(any 사용 최소화). 단, Web Speech API처럼 표준 타입이 없는
  브라우저 객체는 예외로 둔다.
- UI 텍스트·주석은 한국어로 작성한다.

## 알려진 정리 후보 (선택)
- `package.json`의 dependencies에 `npm`이 포함되어 있는데, 이는 일반적으로 불필요하다.
  빌드·배포에 문제가 없는지 확인 후 제거를 검토할 수 있다.
- `eslint.config.js`는 있으나 lint용 npm 스크립트는 없다. 필요 시
  `"lint": "eslint ."` 스크립트 추가를 검토할 수 있다.
