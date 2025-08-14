"use client";
import React, { useState } from 'react';

interface TutorSidebarProps {
  context: string;
}

export function QuantumTutorSidebar({ context }: TutorSidebarProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; }[]>([
    { role: 'assistant', content: 'Hi, I\'m the Quantum Tutor. Ask about the current simulation!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet'>('gpt-4o');

  async function send() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-8), context, model })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'No response' }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error contacting AI.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="w-80 bg-[#181818] border-l border-gray-800 flex flex-col">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-accent2">Quantum Tutor</span>
        <select value={model} onChange={e => setModel(e.target.value as any)} className="bg-[#121212] text-xs rounded px-2 py-1 focus:outline-none">
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'assistant' ? 'text-accent2' : 'text-accent'}>{m.content}</div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-800 space-y-2">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} className="w-full text-sm bg-[#101010] rounded p-2 focus:outline-none" placeholder="Ask a question..." />
        <button disabled={loading} onClick={send} className="w-full py-1.5 text-sm rounded bg-accent/20 hover:bg-accent/30 text-accent disabled:opacity-50">{loading ? '...' : 'Send'}</button>
      </div>
    </aside>
  );
}
