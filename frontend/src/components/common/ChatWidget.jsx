import React, { useState } from 'react'
import { Bot, ChevronDown, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I am your PrescientIQ assistant. Ask me about forecasts, risks, or resources.' },
  ])

  const sendMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || sending) return

    const nextMessages = [...messages, { role: 'user', content: trimmedMessage }]
    setMessages(nextMessages)
    setMessage('')
    setSending(true)

    try {
      const response = await api.post('/api/chat', {
        message: trimmedMessage,
        history: messages,
      })
      setMessages([...nextMessages, { role: 'assistant', content: response.data.reply }])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reach the chat assistant.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <section className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#263552] bg-[#0b1220] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-[#1b2941] bg-[#101a2d] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e599]/15 text-[#00e599]"><Bot size={17} /></div>
              <div>
                <p className="text-sm font-semibold text-white">PrescientIQ Assistant</p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#00e599]">Neural support online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-[#18243a] hover:text-white" title="Close chat">
              <X size={16} />
            </button>
          </div>

          <div className="flex h-72 flex-col gap-3 overflow-y-auto p-3">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${item.role === 'user' ? 'self-end bg-[#00e599] text-[#042416]' : 'self-start border border-[#1c2b45] bg-[#111b2e] text-slate-300'}`}>
                {item.content}
              </div>
            ))}
            {sending && <div className="self-start rounded-xl border border-[#1c2b45] bg-[#111b2e] px-3 py-2 text-xs text-slate-500">Thinking...</div>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-[#1b2941] p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask the assistant..."
              className="min-w-0 flex-1 rounded-lg px-3 py-2 text-xs"
              disabled={sending}
            />
            <button type="submit" disabled={!message.trim() || sending} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e599] text-[#042416] disabled:cursor-not-allowed disabled:opacity-40" title="Send message">
              <Send size={15} />
            </button>
          </form>
        </section>
      )}

      <button onClick={() => setOpen(!open)} className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00e599]/70 bg-[#0f1c2b] text-[#00e599] shadow-lg shadow-[#00e599]/20 transition hover:scale-105 hover:bg-[#13283a]" title={open ? 'Close chat' : 'Open chat'}>
        {open ? <ChevronDown size={22} /> : <Bot size={23} />}
      </button>
    </div>
  )
}

export default ChatWidget
