import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Type, Mic, MicOff, X } from 'lucide-react';

// --- 데이터 타입 정의 ---
interface ScriptSentence {
  id: number;
  originalText: string;
  normalizedText: string;
  keywords: string[];
}

export default function App() {
  // --- 상태 관리 ---
  const [rawText, setRawText] = useState<string>(localStorage.getItem('saved-script') || "");
  const [sentences, setSentences] = useState<ScriptSentence[]>([]);
  const [isEditing, setIsEditing] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSize, setFontSize] = useState(32);
  const [isPaused, setIsPaused] = useState(false);
  const [recentTranscript, setRecentTranscript] = useState("");
  const [micStatus, setMicStatus] = useState<"ready" | "listening" | "error" | "blocked">("ready");

  const recognitionRef = useRef<any>(null);
  const scrollRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // --- Stale closure 방지: 최신 값을 ref로 유지 ---
  const currentIndexRef = useRef(currentIndex);
  const sentencesRef = useRef(sentences);
  const isPausedRef = useRef(isPaused);
  const isEditingRef = useRef(isEditing);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { sentencesRef.current = sentences; }, [sentences]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  // --- [모바일 안정화] 인식 세션 제어용 ref ---
  // shouldListenRef: 의도적으로 듣고 있어야 하는 상태인지 (onend 자동재시작 판단 기준)
  // restartTimerRef: Android에서 즉시 재시작 시 'aborted' 루프가 발생하므로 지연 재시작
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // --- 유틸리티: 텍스트 정규화 ---
  const normalize = (text: string) => text.replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

  // --- 한국어 조사/어미 제거 → 어근만 키워드로 저장 ---
  const stemWord = (word: string): string => {
    const particles = [
      '으로부터', '에서부터', '이라고는', '이라는', '라는', '이라고', '라고',
      '에서의', '으로의', '에의', '로부터', '으로써', '로써',
      '습니다', '입니다', '니다', '겠다', '이다',
      '지만', '이고', '하고', '이며', '하며', '이나', '이라',
      '에서', '에게', '한테', '으로', '까지', '부터',
      '을', '를', '은', '는', '이', '가', '의', '에', '로', '와', '과', '도', '만'
    ];
    for (const p of particles) {
      if (word.endsWith(p) && word.length > p.length + 1) {
        return word.slice(0, -p.length);
      }
    }
    return word;
  };

  // --- 유틸리티: 문장 분리 및 키워드 추출 ---
  const splitSentences = (text: string): ScriptSentence[] => {
    const raw = text.split(/([.?!]|\n)/g).filter(s => s.trim().length > 0);
    const result: ScriptSentence[] = [];
    let temp = "";
    raw.forEach(part => {
      if (part === "." || part === "?" || part === "!" || part === "\n") {
        if (temp.trim()) {
          const original = temp.trim() + (part === "\n" ? "" : part);
          const normOriginal = normalize(original);
          result.push({
            id: result.length,
            originalText: original,
            normalizedText: normOriginal,
            keywords: original.split(' ')
              .map(w => stemWord(normalize(w)))
              .filter(w => w.length >= 2)
              .filter((w, i, arr) => arr.indexOf(w) === i) // 순서 유지하며 중복 제거
          });
        }
        temp = "";
      } else { temp += part; }
    });
    if (temp.trim()) {
      result.push({
        id: result.length,
        originalText: temp.trim(),
        normalizedText: normalize(temp),
        keywords: temp.trim().split(' ')
          .map(w => stemWord(normalize(w)))
          .filter(w => w.length >= 2)
          .filter((w, i, arr) => arr.indexOf(w) === i)
      });
    }
    return result;
  };

  // --- 누적 transcript ref: 현재 문장 시작 이후 들린 내용(final) 누적 ---
  const cumulativeRef = useRef<string>("");
  // 문장 진입 시각: 너무 빠른 연쇄 전환(이중 점프) 방지용
  const sentenceEnteredAtRef = useRef<number>(0);

  // --- 화면 꺼짐 방지 (Android/iOS 16.4+) ---
  const requestWakeLock = async () => {
    try {
      wakeLockRef.current = await (navigator as any).wakeLock?.request('screen');
    } catch (e) { /* 미지원 브라우저는 무시 */ }
  };
  const releaseWakeLock = () => {
    try { wakeLockRef.current?.release(); wakeLockRef.current = null; } catch (e) { }
  };

  // --- advance 공통 처리 ---
  const advanceTo = useCallback((nextIdx: number) => {
    cumulativeRef.current = "";              // 문장 전환시 누적 초기화
    sentenceEnteredAtRef.current = Date.now();
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    setRecentTranscript("");
  }, []);

  // --- [핵심 수정] 매칭 로직: "문장 끝을 실제로 읽었는지"를 반드시 확인 ---
  // 기존 문제: 키워드 65% 매칭 즉시 전환 → 키워드가 3~4개인 문장은
  //            중간까지만 읽어도 65%를 넘겨 문장이 끝나기 전에 넘어감.
  // 수정 원칙:
  //   1) 문장 "끝부분"(마지막 키워드 또는 정규화 문장의 끝 4글자)이 들렸을 때만 전환
  //   2) 끝부분 + 전체 키워드 55% 이상 → 전환 (정상 케이스)
  //   3) 끝부분이 인식되지 않아도 키워드 90% 이상이면 전환 (어미 오인식 대비)
  //   4) 키워드 2개 이하의 짧은 문장은 전부 매칭되어야 전환
  //   5) 문장 진입 후 800ms 이내에는 전환 금지 (이중 점프 방지)
  const checkAdvance = useCallback((volatileText: string) => {
    const curIdx = currentIndexRef.current;
    const curSentences = sentencesRef.current;
    if (curSentences.length === 0 || curIdx >= curSentences.length - 1) return;
    if (Date.now() - sentenceEnteredAtRef.current < 600) return;

    const cur = curSentences[curIdx];
    // final 누적 + 아직 확정되지 않은 interim까지 합쳐 판단 (모바일에서 final이 늦게 와도 반응)
    const heard = cumulativeRef.current + volatileText;
    if (heard.length < 2) return;

    // 문장 끝 감지: 마지막 키워드 또는 정규화된 문장의 마지막 4글자
    const lastKeyword = cur.keywords.length > 0 ? cur.keywords[cur.keywords.length - 1] : "";
    const suffix = cur.normalizedText.slice(-4);
    const endingHeard =
      (lastKeyword.length >= 2 && heard.includes(lastKeyword)) ||
      (suffix.length >= 4 && heard.includes(suffix));

    if (cur.keywords.length === 0) {
      // 키워드가 없는 아주 짧은 문장: 끝 4글자만으로 판단
      if (suffix.length >= 4 && heard.includes(suffix)) advanceTo(curIdx + 1);
      return;
    }

    const matched = cur.keywords.filter(kw => heard.includes(kw)).length;
    const ratio = matched / cur.keywords.length;

    let advance = false;
    if (cur.keywords.length <= 2) {
      // 짧은 문장: 키워드 전부 + 끝부분 확인
      advance = matched === cur.keywords.length && endingHeard;
    } else if (endingHeard && ratio >= 0.45) {
      advance = true;
    } else if (ratio >= 0.9) {
      // 어미가 오인식되어 끝 감지가 실패한 경우의 안전장치
      advance = true;
    }

    if (advance) advanceTo(curIdx + 1);
  }, [advanceTo]);

  // --- 음성 인식 설정: 최초 1회만 생성, 핸들러는 ref 기반 ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus("error");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;       // iOS는 무시될 수 있으나 onend 재시작으로 보완
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setMicStatus("listening");

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldListenRef.current = false;
          setMicStatus("blocked");
        }
        // 'no-speech' / 'aborted' / 'network'는 onend에서 자동 재시작되므로 무시
      };

      recognition.onresult = (event: any) => {
        if (isPausedRef.current) return;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const norm = normalize(transcript);
            if (norm.length >= 2) cumulativeRef.current += norm;
          } else {
            interim += transcript;
          }
        }
        setRecentTranscript(interim);
        // final + interim을 함께 사용해 판단 (Android에서 final 지연 보완)
        checkAdvance(normalize(interim));
      };

      recognition.onend = () => {
        // iOS Safari는 continuous여도 세션이 자주 끊기고,
        // Android는 즉시 start() 시 'aborted' 루프가 생기므로 250ms 지연 후 재시작
        if (shouldListenRef.current && !isEditingRef.current && !isPausedRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            try { recognition.start(); } catch (e) { }
          }, 250);
        } else {
          setMicStatus("ready");
        }
      };
      recognitionRef.current = recognition;
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [checkAdvance]);

  // --- 백그라운드 복귀 시 WakeLock/인식 재개 (모바일 화면 전환 대응) ---
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !isEditingRef.current) {
        requestWakeLock();
        if (shouldListenRef.current && !isPausedRef.current) {
          try { recognitionRef.current?.start(); } catch (e) { }
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // --- 핸들러 ---
  const startPresentation = () => {
    const parsed = splitSentences(rawText);
    if (!parsed.length) return;
    setSentences(parsed);
    sentencesRef.current = parsed;
    cumulativeRef.current = "";
    sentenceEnteredAtRef.current = Date.now();
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setIsEditing(false);
    isEditingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    localStorage.setItem('saved-script', rawText);

    // [iOS 필수] 사용자 터치 이벤트 안에서 동기적으로 start() 호출해야 마이크가 열림
    // (기존 setTimeout 300ms 방식은 iOS에서 제스처 컨텍스트가 끊겨 시작 실패)
    shouldListenRef.current = true;
    try { recognitionRef.current?.start(); } catch (e) { }
    requestWakeLock();
  };

  const exitPresentation = () => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch (e) { }
    releaseWakeLock();
    setIsEditing(true);
  };

  const togglePause = () => {
    if (isPaused) {
      isPausedRef.current = false;
      shouldListenRef.current = true;
      sentenceEnteredAtRef.current = Date.now();
      try { recognitionRef.current?.start(); } catch (e) { }
    } else {
      isPausedRef.current = true;
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch (e) { }
    }
    setIsPaused(!isPaused);
  };

  // 수동 이동도 advanceTo를 거쳐 누적 transcript를 초기화 (잔여 매칭으로 인한 연쇄 점프 방지)
  const goPrev = () => advanceTo(Math.max(0, currentIndexRef.current - 1));
  const goNext = () => advanceTo(Math.min(sentencesRef.current.length - 1, currentIndexRef.current + 1));

  useEffect(() => {
    if (!isEditing) {
      scrollRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isEditing]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans overflow-hidden">
      {isEditing ? (
        /* 1. 편집 화면: 컴팩트한 모바일 레이아웃 */
        <div className="h-screen flex flex-col p-4 space-y-4 max-w-2xl mx-auto w-full overflow-hidden">
          <header className="text-center shrink-0 pt-4">
            <h1 className="text-2xl font-bold tracking-tight">Script Reader Pro</h1>
            <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-bold">Intelligent Speech Tracking</p>
          </header>

          <div className="flex-1 bg-white rounded-[32px] shadow-2xl border border-white flex flex-col min-h-0 overflow-hidden shadow-black/5 transition-all">
            <textarea
              className="flex-1 w-full p-8 bg-transparent outline-none resize-none leading-tight transition-all"
              style={{ fontSize: `${fontSize}px` }}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="발표 원고를 입력하세요."
            />
            <div className="px-8 py-4 bg-[#f5f5f7]/50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <button onClick={() => setRawText("")} className="text-[#0071e3] text-sm font-bold whitespace-nowrap px-2 active:opacity-50">Clear</button>
              <div className="flex items-center gap-3">
                <Type size={14} className="text-gray-400" />
                <input
                  type="range" min="12" max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-24 md:w-32 accent-[#0071e3] cursor-pointer"
                />
                <span className="text-[10px] font-mono font-bold w-4">{fontSize}</span>
              </div>
            </div>
          </div>

          {micStatus === "error" && (
            <p className="text-center text-xs text-red-500 shrink-0">
              이 브라우저는 음성 인식을 지원하지 않습니다. Android는 Chrome, iPhone은 Safari로 열어 주세요.
            </p>
          )}

          <button onClick={startPresentation} className="w-full py-4 bg-[#ff3b30] text-white rounded-2xl text-lg font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform shrink-0">
            발표 시작하기
          </button>
        </div>
      ) : (
        /* 2. 발표 화면: 애플 프로 다크 모드 */
        <div className="h-screen bg-black text-white flex flex-col relative overflow-hidden">
          <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
            {/* 페이지 번호: 가로 한 줄 고정 */}
            <div className="text-[#86868b] font-mono text-sm font-bold whitespace-nowrap min-w-fit">
              {currentIndex + 1} / {sentences.length}
            </div>

            <div className="flex items-center gap-4 bg-white/10 px-4 py-1 rounded-full border border-white/10 shadow-xl">
              <button onClick={goPrev} className="p-1 opacity-50 active:opacity-100"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={togglePause} className="w-8 h-8 flex items-center justify-center">
                {isPaused ? <Play size={24} fill="currentColor" className="text-green-500" /> : <Pause size={24} fill="currentColor" />}
              </button>
              <button onClick={goNext} className="p-1 opacity-50 active:opacity-100"><SkipForward size={20} fill="currentColor" /></button>
            </div>
            <div className="w-12"></div>
          </nav>

          <main className="flex-1 overflow-y-auto px-10 md:px-[25%] pt-[40vh] pb-[50vh] hide-scrollbar scroll-smooth">
            {sentences.map((s, idx) => {
              let styleClass = "text-[#424245] opacity-10 scale-95 transition-all duration-700";
              if (idx === currentIndex) {
                styleClass = "text-white font-bold opacity-100 scale-110 origin-left z-20 duration-500";
              } else if (idx === currentIndex + 1) {
                styleClass = "text-white/40 font-medium scale-100 origin-left z-10 duration-700";
              }

              return (
                <div
                  key={idx}
                  ref={el => scrollRefs.current[idx] = el}
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.3 }}
                  className={`mb-24 ${styleClass}`}
                >
                  {s.originalText}
                </div>
              );
            })}
          </main>

          {/* 왼쪽 하단 닫기 버튼 */}
          <button
            onClick={exitPresentation}
            className="fixed bottom-8 left-6 z-[60] bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 text-[#f5f5f7] opacity-60 hover:opacity-100 transition-all"
          >
            <X size={20} />
          </button>

          {/* 하단 마이크 상태 캡슐 */}
          <div className="fixed bottom-8 w-full flex justify-center px-6 z-50 pointer-events-none">
            <div className="bg-[#1d1d1f]/90 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 max-w-md w-full pointer-events-auto shadow-2xl">
              <div className="relative flex items-center justify-center">
                {micStatus === "listening" && <div className="absolute w-6 h-6 bg-blue-500/30 rounded-full animate-ping" />}
                {isPaused ? <MicOff size={18} className="text-red-500" /> :
                  micStatus === "blocked" ? <MicOff size={18} className="text-amber-500" /> :
                    <Mic size={18} className={micStatus === "listening" ? "text-[#0071e3]" : "text-gray-500"} />}
              </div>
              <div className="text-sm font-medium text-[#f5f5f7]/80 truncate flex-1 italic">
                {isPaused ? "Recognition Paused" :
                  micStatus === "blocked" ? "Mic Blocked (Check Browser Settings)" :
                    micStatus === "error" ? "이 브라우저는 음성 인식을 지원하지 않습니다" :
                      (recentTranscript || "Waiting for your voice...")}
              </div>
            </div>
          </div>

          <div className="fixed top-0 left-0 w-full h-[35vh] bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
          <div className="fixed bottom-0 left-0 w-full h-[35vh] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
        </div>
      )}
    </div>
  );
}
