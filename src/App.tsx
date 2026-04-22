import { useState, useRef, useEffect, FormEvent } from "react";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "¡Hola explorador! Sabías que un día en Venus es más largo que un año en Venus... ¡Por los anillos de Saturno, qué locura! 🪐 \n¿Qué vamos a 'merendar' hoy? ¿Sumas, restas, fracciones?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Format history, ignoring the newly added message when sending history
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        throw new Error("API response not ok");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "¡Hip! Siento una interferencia cósmica severa. Mis antenas no logran conectar con la Galaxia Aritmética. ¿Puedes intentar enviar ese mensaje de nuevo?",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#050510] text-white min-h-screen flex flex-col items-center justify-center overflow-hidden relative font-sans p-4">
      {/* Decorative Outer Space Elements */}
      <div className="hidden md:flex absolute top-6 right-6 gap-4 z-20">
        <div className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-sm">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
          <span className="text-xs font-mono text-gray-300 uppercase tracking-tighter">Nivel: Explorador Lunar</span>
        </div>
      </div>

      {/* Starry Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-40 left-80 w-2 h-2 bg-purple-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-blue-300 rounded-full opacity-50"></div>
        <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-blue-900/20 rounded-full blur-[140px]"></div>
      </div>

      {/* Main UI Container */}
      <main className="z-10 w-full max-w-5xl h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl flex overflow-hidden">
        
        {/* Sidebar / Math Elements */}
        <div className="hidden md:flex w-64 bg-black/30 border-r border-white/10 p-8 flex-col items-center shrink-0">
          <div className="mb-12 text-center">
            <div className="w-32 h-32 bg-black rounded-full border-2 border-purple-500/50 shadow-[0_0_30px_rgba(138,43,226,0.4)] flex items-center justify-center mb-4 relative cero-avatar">
              <div className="w-20 h-20 bg-purple-900/40 rounded-full blur-md pulse-core"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black rounded-full border border-purple-400"></div>
              </div>
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-b from-purple-300 to-blue-400 bg-clip-text text-transparent">CERO</h2>
            <p className="text-xs text-purple-200/50 uppercase tracking-widest mt-1">Tu Amigo Cósmico</p>
          </div>

          <div className="space-y-4 w-full">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-purple-300 font-bold uppercase mb-2">Misión de hoy</p>
              <p className="text-sm text-gray-300">¡Ayúdame a merendar sumas de 2 cifras!</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 opacity-60">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Logros</p>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center text-[10px] text-yellow-500">⭐</div>
                <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-[10px] text-blue-500">🚀</div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto text-[50px] font-black text-white/5 leading-none select-none">+ - × ÷</div>
        </div>

        {/* Chat Viewport */}
        <div className="flex-1 flex flex-col bg-black/20 overflow-hidden">
          {/* Header */}
          <header className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/10 shrink-0">
            {/* Mobile Header */}
            <div className="flex md:hidden items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full border-2 border-purple-500/50 shadow-[0_0_15px_rgba(138,43,226,0.4)] flex items-center justify-center relative cero-avatar shrink-0">
                <div className="w-6 h-6 bg-purple-900/40 rounded-full blur-sm pulse-core"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-black rounded-full border border-purple-400"></div>
                </div>
              </div>
              <h2 className="text-lg font-black bg-gradient-to-b from-purple-300 to-blue-400 bg-clip-text text-transparent">CERO</h2>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]"></div>
              <span className="text-sm font-medium text-gray-300">Señal de la Galaxia Aritmética: Estable</span>
            </div>
            <div className="flex gap-3">
              {/* Tool actions could go here */}
            </div>
          </header>

          {/* Message Area */}
          <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto scroll-smooth">
            {messages.map((msg, index) => (
              <div key={index}>
                {msg.role === "model" ? (
                  <div className="flex gap-4 items-start message-enter">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(147,51,234,0.4)]">🕳️</div>
                    <div className="bg-gradient-to-br from-purple-800/80 to-blue-900/80 border border-purple-500/30 p-4 md:p-5 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-[80%] shadow-lg">
                      <p className="text-purple-200 text-xs font-bold uppercase mb-1 tracking-wider">Cero dice:</p>
                      <p className="text-sm md:text-base leading-relaxed text-gray-100">
                        {msg.text.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-start justify-end message-enter text-right">
                    <div className="bg-white/10 border border-white/10 p-4 md:p-5 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[80%] shadow-sm text-right">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">Tú</p>
                      <p className="text-sm md:text-base leading-relaxed text-gray-100">
                        {msg.text.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500 flex-shrink-0 flex items-center justify-center text-xl rounded-full border-2 border-white/10 shadow-md">👦</div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 items-start message-enter">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(147,51,234,0.4)]">🕳️</div>
                <div className="bg-gradient-to-br from-purple-800/80 to-blue-900/80 border border-purple-500/30 p-4 md:p-5 rounded-2xl rounded-tl-none shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 bg-black/40 border-t border-white/10 shrink-0">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                autoComplete="off"
                placeholder="Escribe tu respuesta aquí..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 md:px-8 pr-16 focus:outline-none focus:border-purple-500 transition-all text-gray-200 placeholder-gray-500 backdrop-blur-md disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="absolute right-2 w-10 md:w-12 h-10 md:h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:active:scale-100 disabled:opacity-50 shrink-0"
              >
                <Send className="w-5 h-5 -ml-1 text-white" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
