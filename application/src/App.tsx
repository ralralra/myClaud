import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, SkipBack, SkipForward, Trash2, Type, Mic, MicOff, X } from 'lucide-react';

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

  // --- 유틸리티: 텍스트 정규화 ---
  const normalize = (text: string) => text.replace(/[^가-힣a-zA-Z0-9]/g, "").toLowerCase();

  // --- 유틸리티: 문장 분리 및 키워드 추출 ---
  const splitSentences = (text: string): ScriptSentence[] => {
    const raw = text.split(/([.?!]|\n)/g).filter(s => s.trim().length > 0);
    const result: ScriptSentence[] = [];
    let temp = "";
    raw.forEach(part => {
      if (part === "." || part === "?" || part === "!" || part === "\n") {
        if (temp.trim()) {
          const original = temp.trim() + (part === "\n" ? "" : part);
          result.push({
            id: result.length,
            originalText: original,
            normalizedText: normalize(original),
            keywords: original.split(' ').filter(w => w.length >= 2).map(w => normalize(w))
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
        keywords: temp.trim().split(' ').filter(w => w.length >= 2).map(w => normalize(w))
      });
    }
    return result;
  };

  // --- 🔥 초고속 매칭 로직: 다음 문장 키워드 감지 즉시 점프 ---
  const handleMatch = (spoken: string) => {
    const normSpoken = normalize(spoken);
    if (normSpoken.length < 1) return;

    // 현재 문장 이후 2문장 내에서 키워드가 들리는지 집중 확인
    const nextIndices = [currentIndex + 1, currentIndex + 2];

    for (const nextIdx of nextIndices) {
      if (nextIdx >= sentences.length) continue;

      const target = sentences[nextIdx];
      const isKeywordMatch = target.keywords.some(kw => normSpoken.includes(kw));
      const isStartMatch = target.normalizedText.length > 3 && normSpoken.includes(target.normalizedText.substring(0, 3));

      if (isKeywordMatch || isStartMatch) {
        setCurrentIndex(nextIdx);
        setRecentTranscript(""); 
        // 문장이 넘어가면 강제로 인식을 재시작하여 버퍼를 비움 (인식 정확도 향상)
        if (recognitionRef.current) {
          recognitionRef.current.stop(); 
        }
        return;
      }
    }
  };

  // --- 음성 인식 설정 (크롬/사파리 호환) ---
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
        if (isPaused) return;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleMatch(transcript);
          } else {
            interim += transcript;
            handleMatch(interim); 
          }
        }
        setRecentTranscript(interim);
      };

      recognition.onend = () => {
        if (!isEditing && !isPaused) {
          try { recognition.start(); } catch(e) {}
        } else {
          setMicStatus("ready");
        }
      };
      recognitionRef.current = recognition;
    }
  }, [isEditing, isPaused, sentences, currentIndex]);

  // --- 핸들러 ---
  const startPresentation = () => {
    const parsed = splitSentences(rawText);
    if (!parsed.length) return;
    setSentences(parsed);
    setCurrentIndex(0);
    setIsEditing(false);
    setIsPaused(false);
    localStorage.setItem('saved-script', rawText);
    setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 300);
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
              <button onClick={() => setCurrentIndex(Math.max(0, currentIndex-1))} className="p-1 opacity-50 active:opacity-100"><SkipBack size={20} fill="currentColor"/></button>
              <button onClick={() => {
                if(isPaused) recognitionRef.current?.start();
                else recognitionRef.current?.stop();
                setIsPaused(!isPaused);
              }} className="w-8 h-8 flex items-center justify-center">
                {isPaused ? <Play size={24} fill="currentColor" className="text-green-500"/> : <Pause size={24} fill="currentColor"/>}
              </button>
              <button onClick={() => setCurrentIndex(Math.min(sentences.length-1, currentIndex+1))} className="p-1 opacity-50 active:opacity-100"><SkipForward size={20} fill="currentColor"/></button>
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