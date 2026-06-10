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

  // --- ✅ Stale closure 방지: 최신 값을 ref로 유지 ---
  const currentIndexRef = useRef(currentIndex);
  const sentencesRef = useRef(sentences);
  const isPausedRef = useRef(isPaused);
  const isEditingRef = useRef(isEditing);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { sentencesRef.current = sentences; }, [sentences]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  // --- 유틸리티: 텍스트 정규화 ---
  const normalize = (text: string) => text.replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

  // --- [Fix 1] 한국어 조사/어미 제거 → 어근만 키워드로 저장 ---
  // 조사가 붙은 채로 키워드 저장 시 음성인식 결과(어근만 반환)와 불일치 발생
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
            // 어근 기반 키워드: 조사 제거 후 2글자 이상만
            keywords: [...new Set(
              original.split(' ')
                .map(w => stemWord(normalize(w)))
                .filter(w => w.length >= 2)
            )]
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
        keywords: [...new Set(
          temp.trim().split(' ')
            .map(w => stemWord(normalize(w)))
            .filter(w => w.length >= 2)
        )]
      });
    }
    return result;
  };

  // --- 쿨다운 ref: 연속 매칭 방지 ---
  const lastMatchTimeRef = useRef<number>(0);
  const MATCH_COOLDOWN_MS = 400;

  // --- advance 공통 처리 ---
  const advanceTo = useCallback((nextIdx: number) => {
    lastMatchTimeRef.current = Date.now();
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    setRecentTranscript("");
  }, []);

  // --- 매칭 로직 ---
  // isFinal: Web Speech API의 isFinal 값 그대로 전달
  const handleMatch = useCallback((spoken: string, isFinal: boolean) => {
    const now = Date.now();
    if (now - lastMatchTimeRef.current < MATCH_COOLDOWN_MS) return;

    const normSpoken = normalize(spoken);
    if (normSpoken.length < 2) return;

    const curIdx = currentIndexRef.current;
    const curSentences = sentencesRef.current;
    if (curSentences.length === 0) return;

    // ── 전략 A: 현재 문장 끝 감지 → advance ──────────────────────
    // suffix(끝 3글자)가 들리는 순간 넘어감.
    // interim에서도 동작해서 문장 끝 발화 직후 바로 반응.
    // A-2(키워드 비율) 제거: 문장 중반에 키워드가 몰리면 중간 점프 발생했던 원인.
    if (curIdx < curSentences.length - 1) {
      const cur = curSentences[curIdx];
      const suffix = cur.normalizedText.slice(-3);
      if (suffix.length >= 3 && normSpoken.includes(suffix)) {
        advanceTo(curIdx + 1);
        return;
      }
    }

    // ── 전략 B: 다음 문장 시작 감지 (interim·final 모두) ──────────
    // 다음 1~2문장의 첫 단어가 들리면 advance (기존 방식 유지)
    for (let offset = 1; offset <= 2; offset++) {
      const nextIdx = curIdx + offset;
      if (nextIdx >= curSentences.length) break;

      const target = curSentences[nextIdx];
      const isKeywordMatch = target.keywords.some(kw => kw.length >= 2 && normSpoken.includes(kw));
      // startMatch는 final에서만 (interim prefix는 오매칭 많음)
      const isStartMatch = isFinal
        && target.normalizedText.length > 4
        && normSpoken.includes(target.normalizedText.substring(0, 4));

      if (isKeywordMatch || isStartMatch) {
        advanceTo(nextIdx);
        return;
      }
    }
  }, [advanceTo]);

  // --- ✅ 음성 인식 설정: 최초 1회만 생성, 핸들러는 ref 기반으로 stale 없음 ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus("error");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setMicStatus("listening");
      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') setMicStatus("blocked");
      };

      recognition.onresult = (event: any) => {
        if (isPausedRef.current) return;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleMatch(transcript, true);
          } else {
            interim += transcript;
            // interim: 전략 B(다음 문장 시작 감지)만 적용 — 쿨다운이 빠른 연속 점프 차단
            handleMatch(interim, false);
          }
        }
        setRecentTranscript(interim);
      };

      recognition.onend = () => {
        // ✅ isEditingRef, isPausedRef: 항상 최신 값 참조
        if (!isEditingRef.current && !isPausedRef.current) {
          try { recognition.start(); } catch (e) { }
        } else {
          setMicStatus("ready");
        }
      };
      recognitionRef.current = recognition;
    }
  }, [handleMatch]);

  // --- 핸들러 ---
  const startPresentation = () => {
    const parsed = splitSentences(rawText);
    if (!parsed.length) return;
    setSentences(parsed);
    setCurrentIndex(0);
    setIsEditing(false);
    setIsPaused(false);
    localStorage.setItem('saved-script', rawText);
    setTimeout(() => { try { recognitionRef.current?.start(); } catch (e) { } }, 300);
  };

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
              <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-1 opacity-50 active:opacity-100"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={() => {
                if (isPaused) recognitionRef.current?.start();
                else recognitionRef.current?.stop();
                setIsPaused(!isPaused);
              }} className="w-8 h-8 flex items-center justify-center">
                {isPaused ? <Play size={24} fill="currentColor" className="text-green-500" /> : <Pause size={24} fill="currentColor" />}
              </button>
              <button onClick={() => setCurrentIndex(Math.min(sentences.length - 1, currentIndex + 1))} className="p-1 opacity-50 active:opacity-100"><SkipForward size={20} fill="currentColor" /></button>
            </div>
            <div className="w-12"></div>
          </nav>

          <main className="flex-1 overflow-y-auto px-10 md:px-[25%] pt-[40vh] pb-[50vh] hide-scrollbar scroll-smooth">
            {sentences.map((s, idx) => {
              let styleClass = "text-[#424245] opacity-10 scale-95 transition-all duration-700";
              if (idx === currentIndex) {
                styleClass = "text-white font-bold opacity-100 scale-110 origin-left z-20 duration-500";
              } else if (idx === currentIndex + 1) {
                styleClass = "text-white/40 font-medium scale-100 origin-left z-10 duration-700"; // 🔥 다음 문장 미리보기
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
            onClick={() => { recognitionRef.current?.stop(); setIsEditing(true); }}
            className="fixed bottom-8 left-6 z-[60] bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 text-[#f5f5f7] opacity-60 hover:opacity-100 transition-all"
          >
            <X size={20} />
          </button>

          {/* 하단 마이크 상태 캡슐 (크롬 인식 상태 표시) */}
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