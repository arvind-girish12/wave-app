
"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * ChatWithLLM - Slide-in overlay chat UI for LLM
 * Props:
 *   open: boolean - controlled visibility
 *   onClose: function - called to close overlay
 *   character: { name: string, ... }
 */
export default function ChatWithLLM({ open, onClose, character }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: character?.name
        ? `You are now chatting with ${character.name}.`
        : "You are now chatting with the AI.",
      meta: { system: true },
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Reset messages when changing character or closing chat
  useEffect(() => {
    if (open) {
      setMessages([
        {
          role: "assistant",
          content: character?.name
            ? `You are now chatting with ${character.name}.`
            : "You are now chatting with the AI.",
          meta: { system: true },
        }
      ]);
      setError("");
      setInput("");
    }
  }, [character?.name, open]);

  // For escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  const prefersDark = typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/llm-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.filter(m => m.role !== "system"),
          character,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unknown error");
      setMessages([...nextMessages, { role: "assistant", content: data.result }]);
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Transition settings
  const overlayBase = "fixed inset-0 z-50 flex items-stretch";
  const overlayBg = "bg-black/40 backdrop-blur-sm transition duration-300";
  const drawerBase = "ml-auto w-full sm:w-[420px] max-w-full h-full bg-gradient-to-b from-sky-100 via-white to-sky-50 dark:bg-[#181e2a] shadow-2xl rounded-l-2xl flex flex-col";
  const translateIn = open ? "translate-x-0" : "translate-x-full";
  const pointerEvents = open ? "pointer-events-auto" : "pointer-events-none";
  const drawerTransition =
    "transition-transform duration-300 ease-in-out will-change-transform";

  return (
    <div
      className={`${overlayBase} ${overlayBg} ${pointerEvents} ${open ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!open}
      style={{ transitionProperty: "opacity, backdrop-filter" }}
      onClick={onClose}
    >
      {/* Stop click from closing if inside drawer */}
      <div
        className={`${drawerBase} ${drawerTransition} ${translateIn} relative`}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-[#292a39]">
          <div className="font-bold text-base md:text-lg text-black">
            {character?.name ? <>Chat with {character.name}</> : <>Chat</>}
          </div>
          <button
            className="text-gray-500 hover:text-indigo-500 transition-colors text-2xl p-1"
            aria-label="Close chat"
            onClick={onClose}
            tabIndex={0}
          >
            &times;
          </button>
        </div>
        {/* Chat area */}
        <div className="flex-1 flex flex-col px-4 py-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 144px)" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={
                  "px-3 py-2 rounded-2xl shadow text-sm max-w-[85%] " +
                  (msg.role === "assistant"
                    ? prefersDark
                      ? "bg-[#263352] text-gray-100"
                      : "bg-gray-100 text-gray-700"
                    : "bg-[#6B4EFF] text-white")
                }
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>
        <form
          className="flex gap-2 border-t px-4 py-3 dark:border-[#292a39]"
          onSubmit={handleSend}
          autoComplete="off"
          style={{ background: prefersDark ? "#181e2a" : "#fff" }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Say something to ${character?.name || "AI"}...`}
            className={
              "flex-1 bg-transparent outline-none px-2 py-1 text-sm border-0 " +
              (prefersDark ? "text-gray-100" : "text-gray-900")
            }
            disabled={loading}
            autoFocus={open}
          />
          <button
            type="submit"
            className={
              "rounded-xl px-4 py-2 font-bold text-white " +
              (loading
                ? "bg-[#6B4EFF]/80 cursor-not-allowed"
                : "bg-[#6B4EFF] hover:bg-[#5740dd] active:bg-[#4B35C7]")
            }
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
        {error && (
          <div className="text-xs text-red-500 px-4 pb-2">{error}</div>
        )}
      </div>
    </div>
  );
}
