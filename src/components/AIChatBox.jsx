import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '@/utils/constant'

// Typing animation hook — reveals text character by character
function useTypingAnimation(text, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      setDone(true)
      return
    }
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

// Individual message bubble
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const { displayed } = useTypingAnimation(
    msg.role === 'assistant' && !msg.settled ? msg.content : null,
    14
  )

  const content = msg.role === 'assistant' && !msg.settled ? displayed : msg.content

  // Simple markdown-ish renderer: bold, links, line breaks
  const renderContent = (text) => {
    const lines = text.split('\n')
    return lines.map((line, li) => {
      // Replace **bold**
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pi}>{part.slice(2, -2)}</strong>
        }
        // Replace URLs with clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const subParts = part.split(urlRegex)
        return subParts.map((sub, si) =>
          urlRegex.test(sub) ? (
            <a
              key={`${pi}-${si}`}
              href={sub}
              target="_blank"
              rel="noopener noreferrer"
              className="ai-chat-link"
            >
              {sub}
            </a>
          ) : (
            <span key={`${pi}-${si}`}>{sub}</span>
          )
        )
      })
      return (
        <span key={li}>
          {parts}
          {li < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className={`ai-msg-row ${isUser ? 'ai-msg-user' : 'ai-msg-bot'}`}>
      {!isUser && (
        <div className="ai-avatar" aria-hidden="true">
          ✦
        </div>
      )}
      <div className={`ai-bubble ${isUser ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
        {renderContent(content)}
        {msg.role === 'assistant' && !msg.settled && !content && (
          <span className="ai-typing-dots">
            <span />
            <span />
            <span />
          </span>
        )}
      </div>
    </div>
  )
}

export default function AIChatBox() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your InsightCart Assistant 🧠 Ask me anything about your saved notes, links, or documents!",
      settled: true,
      id: 'welcome',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const pendingMsgId = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // After animation finishes, mark message as settled
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.settled) {
      const len = lastMsg.content.length
      const delay = len * 14 + 100
      const t = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === lastMsg.id ? { ...m, settled: true } : m))
        )
      }, delay)
      return () => clearTimeout(t)
    }
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text, settled: true, id: `u-${Date.now()}` }
    const botMsgId = `b-${Date.now()}`
    pendingMsgId.current = botMsgId

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    // Add a placeholder bot message (shows typing dots)
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', settled: false, id: botMsgId },
    ])

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        `${BASE_URL}/api/chat/ask`,
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      )

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: data.answer || 'No response received.', settled: false }
            : m
        )
      )
    } catch (err) {
      const errMsg =
        err?.response?.data?.error ||
        (err.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Something went wrong. The AI assistant may be unavailable.')

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: `⚠️ ${errMsg}`, settled: true }
            : m
        )
      )
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your BrainBox Assistant 🧠 Ask me anything about your saved notes, links, or documents!",
        settled: true,
        id: 'welcome',
      },
    ])
    setError(null)
  }

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        id="ai-chat-trigger"
        onClick={() => setOpen((o) => !o)}
        className="ai-chat-fab"
        aria-label="Open BrainBox AI Assistant"
        title="BrainBox AI Assistant"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M16.5 7.5h-9v9h9v-9z" />
            <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        )}
        {!open && <span className="ai-fab-pulse" />}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div id="ai-chat-panel" className="ai-chat-panel" role="dialog" aria-label="BrainBox AI Assistant">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-header-icon">✦</div>
              <div>
                <p className="ai-header-title">InsightCart AI</p>
                <p className="ai-header-sub">Powered by your notes</p>
              </div>
            </div>
            <div className="ai-header-actions">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="ai-icon-btn"
                aria-label="Clear chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ai-icon-btn"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages" id="ai-chat-messages">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input-area">
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your saved notes…"
              rows={1}
              className="ai-chat-textarea"
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              id="ai-chat-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="ai-send-btn"
              aria-label="Send message"
            >
              {loading ? (
                <span className="ai-spinner" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
          <p className="ai-chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}

      {/* ── Scoped Styles ── */}
      <style>{`
        /* FAB Button */
        .ai-chat-fab {
          position: fixed;
          bottom: 88px;
          right: 24px;
          z-index: 45;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(22, 163, 74, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ai-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(22, 163, 74, 0.55);
        }
        .ai-fab-pulse {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid rgba(22,163,74,0.5);
          animation: ai-pulse 2s ease-out infinite;
          pointer-events: none;
        }
        @keyframes ai-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.55); opacity: 0; }
        }

        /* Chat Panel */
        .ai-chat-panel {
          position: fixed;
          bottom: 152px;
          right: 24px;
          z-index: 46;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06);
          background: linear-gradient(160deg, #0f1923 0%, #111827 100%);
          backdrop-filter: blur(24px);
          animation: ai-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes ai-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 12px;
          background: linear-gradient(90deg, rgba(22,163,74,0.15) 0%, rgba(5,150,105,0.08) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ai-chat-header-left { display: flex; align-items: center; gap: 10px; }
        .ai-header-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #16a34a, #059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: white;
          box-shadow: 0 2px 8px rgba(22,163,74,0.4);
        }
        .ai-header-title { font-size: 14px; font-weight: 700; color: #f1f5f9; margin: 0; line-height: 1.2; }
        .ai-header-sub { font-size: 11px; color: #64748b; margin: 0; }
        .ai-header-actions { display: flex; gap: 4px; }
        .ai-icon-btn {
          padding: 6px;
          border: none; background: transparent;
          color: #64748b; cursor: pointer; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .ai-icon-btn:hover { background: rgba(255,255,255,0.08); color: #94a3b8; }

        /* Messages */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .ai-chat-messages::-webkit-scrollbar { width: 4px; }
        .ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        
        .ai-msg-row { display: flex; align-items: flex-start; gap: 8px; width: 100%; }
        .ai-msg-user { flex-direction: row-reverse; }
        .ai-msg-bot { flex-direction: row; }
        
        .ai-avatar {
          width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #16a34a, #059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: white; margin-top: 2px;
        }
        .ai-bubble {
          max-width: 82%;
          padding: 10px 13px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.55;
        }
        .ai-bubble-user {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .ai-bubble-bot {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom-left-radius: 4px;
        }
        .ai-chat-link {
          color: #4ade80;
          text-decoration: underline;
          word-break: break-all;
        }
        .ai-chat-link:hover { color: #86efac; }

        /* Typing dots */
        .ai-typing-dots {
          display: inline-flex; gap: 4px; align-items: center; padding: 2px 0;
        }
        .ai-typing-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: ai-dot-bounce 1.2s infinite ease-in-out;
        }
        .ai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Input */
        .ai-chat-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.2);
        }
        .ai-chat-textarea {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 13.5px;
          padding: 9px 13px;
          resize: none;
          outline: none;
          font-family: inherit;
          line-height: 1.5;
          transition: border-color 0.15s;
          max-height: 100px;
          overflow-y: auto;
        }
        .ai-chat-textarea:focus { border-color: rgba(22,163,74,0.5); }
        .ai-chat-textarea::placeholder { color: #475569; }
        .ai-chat-textarea:disabled { opacity: 0.5; }

        .ai-send-btn {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #16a34a, #059669);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, opacity 0.15s;
          box-shadow: 0 2px 10px rgba(22,163,74,0.35);
        }
        .ai-send-btn:hover:not(:disabled) { transform: scale(1.06); }
        .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .ai-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: ai-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes ai-spin { to { transform: rotate(360deg); } }

        .ai-chat-hint {
          text-align: center; font-size: 10px; color: #334155;
          padding: 4px 12px 8px; margin: 0;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .ai-chat-panel {
            bottom: 0; right: 0; left: 0;
            width: 100%; max-width: 100%;
            border-radius: 20px 20px 0 0;
            height: 70vh;
          }
          .ai-chat-fab { bottom: 80px; right: 16px; }
        }
      `}</style>
    </>
  )
}
