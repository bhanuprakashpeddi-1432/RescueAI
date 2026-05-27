import { useEffect, useRef, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const suggestedPrompts = [
  "What are immediate flood evacuation priorities?",
  "How should we triage shelter shortages?",
  "Guide response to downed power lines near floodwater.",
];

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text:
      "I am RescueAI Guidance. Describe an emergency condition or ask for response priorities. " +
      "Always confirm operational decisions with local command and emergency services.",
  },
];

function BotIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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

function TypingMessage() {
  return (
    <div className="chat-enter flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
        <BotIcon className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="chat-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
        </div>
      </div>
    </div>
  );
}

function EmergencyChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(message) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
    };
    const previousMessages = messages.slice(-6).map(({ role, text }) => ({ role, text }));

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/chat-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          context: {
            recentConversation: previousMessages,
            mode: "emergency-guidance",
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Guidance could not be generated.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: data.responseId ?? `assistant-${Date.now()}`,
          role: "assistant",
          text: data.message,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "Assistant service unavailable. Confirm the API server is running."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20">
            <BotIcon />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0c1525] bg-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">RescueAI Assistant</h2>
            <p className="mt-1 text-xs text-slate-400">Emergency guidance support</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-emerald-300">Online</span>
      </div>

      <div className="border-b border-slate-800/70 px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Suggested Prompts
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-full border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-scroll h-[390px] space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-enter flex items-end gap-2 ${message.role === "user" ? "justify-end" : ""}`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                <BotIcon className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-cyan-500 text-slate-950"
                  : "rounded-bl-md border border-slate-800 bg-slate-900/80 text-slate-200"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {loading && <TypingMessage />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-800/70 p-4">
        {error && (
          <p className="mb-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs leading-5 text-rose-200">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-slate-700/80 bg-slate-950/45 p-2 focus-within:border-cyan-400/60">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask for emergency guidance..."
            rows="1"
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-slate-100 outline-none placeholder:text-slate-600"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(draft);
              }
            }}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
          >
            <SendIcon />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          AI guidance supports decision-making; verify dispatch actions with command.
        </p>
      </form>
    </section>
  );
}

export default EmergencyChat;
