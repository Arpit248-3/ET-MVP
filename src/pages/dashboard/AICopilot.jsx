import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const suggestions = [
  'What is India\'s current crude oil stock level?',
  'Analyze the risk of Hormuz disruption on supply',
  'Generate SPR drawdown recommendation for 15-day crisis',
  'Compare crude prices: Brent vs Ural vs Arab Medium',
  'Which refineries can process Venezuelan heavy crude?',
  'Show me the top 5 geopolitical risks this week',
];

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hello, Commander. I am **UrjaNetra AI Copilot** — your real-time energy intelligence assistant. I have access to live supply chain data, market feeds, geopolitical signals, and all 14 data sources.\n\nHow can I assist you today?',
    time: '06:00',
  }
];

const mockResponses = {
  default: 'Based on the latest data feeds, I\'m analyzing your query across all connected data sources...\n\n**Key findings:**\n- Current crude inventory stands at 47.2 MT (26 days of cover)\n- Geopolitical risk index elevated at 72/100 following Hormuz naval exercises\n- AI recommends activating diversification protocol to West African suppliers\n\nWould you like me to generate a detailed action brief or run a scenario simulation?',
  stock: 'India\'s current crude oil position:\n\n**Strategic Petroleum Reserve (SPR):** 5.33 MT across Visakhapatnam, Mangalore, and Padur\n**Commercial Stocks:** 41.87 MT across refineries and pipeline\n**Total Cover:** ~26 days at current consumption of 5.4 MBPD\n\n⚠️ IEA mandate requires 90-day cover. Current shortfall: 64 days.',
};

export default function AICopilot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    const response = userText.toLowerCase().includes('stock') ? mockResponses.stock : mockResponses.default;
    setMessages(prev => [...prev, { role: 'assistant', content: response, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(false);
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: i > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 12, color: 'var(--text-secondary)', marginTop: 3 }}>• {line.slice(2)}</div>;
      if (line.startsWith('⚠️')) return <div key={i} style={{ color: '#f59e0b', marginTop: 6 }}>{line}</div>;
      if (line === '') return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ color: 'var(--text-secondary)' }}>{line}</div>;
    });
  };

  return (
    <DashboardLayout>
      <PageHeader title="AI Chat Copilot" subtitle="Conversational intelligence interface powered by UrjaNetra AI"
        badge={{ label: 'ONLINE', color: '#22c55e' }}
        actions={
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} onClick={() => setMessages(initialMessages)}>
            <RefreshCw size={13} />New Session
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, height: 'calc(100vh - 180px)' }}>
        {/* Suggestions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GlassCard className="card" style={{ padding: '14px 16px', flex: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Quick Prompts</div>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29,140,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(29,140,255,0.3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {s}
              </button>
            ))}
          </GlassCard>

          <GlassCard className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Data Sources Active</div>
            {['Reuters/Bloomberg', 'IEA Live Feed', 'PPAC Database', 'AIS Ship Tracker', 'SCADA System', 'PESO Reports'].map(src => (
              <div key={src} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{src}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Chat Area */}
        <GlassCard className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: msg.role === 'assistant' ? 'linear-gradient(135deg, #1d8cff, #8b5cf6)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.role === 'assistant' ? <Bot size={16} color="#fff" /> : <User size={16} color="var(--text-secondary)" />}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ background: msg.role === 'assistant' ? 'rgba(29,140,255,0.08)' : 'rgba(255,255,255,0.06)', border: `1px solid ${msg.role === 'assistant' ? 'rgba(29,140,255,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: msg.role === 'assistant' ? '4px 12px 12px 12px' : '12px 4px 12px 12px', padding: '12px 16px', fontSize: 12, lineHeight: 1.7 }}>
                    {renderContent(msg.content)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left', display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
                    {msg.time}
                    {msg.role === 'assistant' && (
                      <>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }} title="Copy"><Copy size={11} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }} title="Helpful"><ThumbsUp size={11} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }} title="Not helpful"><ThumbsDown size={11} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1d8cff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#fff" />
                </div>
                <div style={{ background: 'rgba(29,140,255,0.08)', border: '1px solid rgba(29,140,255,0.2)', borderRadius: '4px 12px 12px 12px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#1d8cff', animation: `pulse-glow 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about supply chains, risks, forecasts, regulations..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
                <Sparkles size={14} color="#8b5cf6" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              </div>
              <button className="btn btn-primary" style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                <Send size={14} />Send
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
