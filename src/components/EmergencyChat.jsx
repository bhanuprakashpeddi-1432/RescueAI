import { useEffect, useRef, useState } from "react";
import { apiBaseUrl } from "../config/api.js";

const suggestedPrompts = [
  "Flood evacuation priorities?",
  "Triage protocol for shelter overflow?",
  "Downed power lines near floodwater?",
];

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "RescueAI Intelligence Co-Pilot online. Input emergency reports or request tactical guidelines. Always crosscheck critical field commands with sector dispatch.",
  },
];

function BotIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5V2m-7 9a7 7 0 0 1 14 0v7H5v-7Zm-2 4h2m14 0h2M9 12h.1M15 12h.1M9 18v2m6-2v2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m22 2-8 20-3.5-8.5L2 10l20-8Z" strokeLinejoin="round" />
      <path d="M22 2 10.5 13.5" strokeLinecap="round" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-enter flex items-end gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-400 ring-1 ring-brand-300 tech-corners">
        <BotIcon />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-white/8 bg-surface-700/60 px-4 py-3 backdrop-blur-sm shadow-panel">
        <div className="flex gap-1.5 items-center">
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-brand-400" />
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-brand-400" />
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-brand-400" />
        </div>
      </div>
    </div>
  );
}

export default function EmergencyChat() {
  const [messages, setMessages]   = useState(initialMessages);
  const [draft, setDraft]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const endRef                    = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(message) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const history = messages.slice(-6).map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/chat-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: { recentConversation: history, mode: "emergency-guidance" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Guidance could not be generated.");

      setMessages((prev) => [...prev, {
        id: data.responseId ?? `a-${Date.now()}`,
        role: "assistant",
        text: data.message,
      }]);
    } catch (e) {
      setError(e.message === "Failed to fetch"
        ? "Assistant link offline. Verify API server stack is active."
        : e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass overflow-hidden rounded-2xl tech-corners shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-400 ring-1 ring-brand-300 tech-corners">
            <BotIcon className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-800 bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>
          <div>
            <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">RESCUEAI INTEL CO-PILOT</h2>
            <p className="text-[11px] text-slate-500 font-medium">Secured military intelligence terminal</p>
          </div>
        </div>
        <div className="status-pill status-pill--live">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Secure Link
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="border-b border-white/5 px-4 py-3 bg-white/[0.01]">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 font-display">TACTICAL DIRECT QUERY</p>
        <div className="flex gap-2 overflow-x-auto pb-1 chat-scroll">
          {suggestedPrompts.map((p) => (
            <button key={p} type="button" disabled={loading} onClick={() => sendMessage(p)}
              className="shrink-0 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:border-brand-300/40 hover:bg-brand-50/10 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-scroll h-[360px] space-y-4 overflow-y-auto p-4 bg-surface-900/5">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-enter flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-400 ring-1 ring-brand-300 tech-corners">
                <BotIcon />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-6 font-medium shadow-card ${
              msg.role === "user"
                ? "rounded-br-md bg-gradient-to-br from-cyan-500 to-brand-600 text-slate-950 font-bold"
                : "rounded-bl-md border border-white/5 bg-surface-700/50 text-slate-200 backdrop-blur-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(draft); }} className="border-t border-white/5 p-4 bg-surface-900/10">
        {error && (
          <p className="mb-3 rounded-xl border border-red-400/15 bg-red-500/8 px-3.5 py-2.5 text-[11px] leading-5 text-red-300 font-mono">
            ⚠️ ERROR: {error}
          </p>
        )}
        <div className="flex items-end gap-2.5 rounded-xl border border-white/8 bg-surface-700/50 p-2 focus-within:border-brand-300/60 focus-within:bg-surface-700/70 focus-within:shadow-glow transition-all">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Query operational guidance parameters..."
            rows={1}
            className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-[13px] leading-5 text-slate-100 outline-none placeholder:text-slate-600 font-medium"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(draft); }
            }}
          />
          <button type="submit" aria-label="Send message" disabled={loading || !draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-slate-950 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-surface-600 disabled:text-slate-500 shadow-glow">
            <SendIcon />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2.5 px-1.5">
          <p className="text-[9px] text-slate-600 font-mono tracking-wider uppercase">
            AI CORE: LLAMA-3.3-70B · QUANTIZED
          </p>
          <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">ENCRYPTED PORT TYPE-III</span>
        </div>
      </form>
    </section>
  );
}
