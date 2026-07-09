import React, { useState } from 'react';
import { Users2, MessageSquare, Send, Paperclip, Video, Phone, Circle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const rooms = [
  { id: 'rm-001', name: 'Crisis Command Room', active: true, members: 6, unread: 3, lastMsg: 'SPR authorization confirmed', time: '2 min ago', type: 'EMERGENCY' },
  { id: 'rm-002', name: 'Procurement Task Force', active: true, members: 4, unread: 0, lastMsg: 'West Africa deal signed', time: '1 hour ago', type: 'OPERATIONS' },
  { id: 'rm-003', name: 'Risk Intelligence Sync', active: false, members: 3, unread: 0, lastMsg: 'Weekly briefing scheduled', time: '2 days ago', type: 'INTELLIGENCE' },
];

const members = [
  { name: 'Arjun Mehta', role: 'Commander', avatar: 'AM', online: true },
  { name: 'Priya Sharma', role: 'MoP Secretary', avatar: 'PS', online: true },
  { name: 'Rajiv Kumar', role: 'IOC Chairman', avatar: 'RK', online: true },
  { name: 'Anita Bose', role: 'Finance', avatar: 'AB', online: false },
  { name: 'Suresh Nair', role: 'HPCL', avatar: 'SN', online: true },
  { name: 'UrjaNetra AI', role: 'AI Copilot', avatar: 'AI', online: true, isAI: true },
];

const messages = [
  { from: 'Priya Sharma', avatar: 'PS', text: 'Hormuz risk at 74%. I recommend we trigger the SPR authorization immediately.', time: '09:05' },
  { from: 'Rajiv Kumar', avatar: 'RK', text: 'IOC can absorb rerouting to West Africa if we get approval in the next 6 hours.', time: '09:07' },
  { from: 'UrjaNetra AI', avatar: 'AI', text: 'Analysis: Activating SPR will reduce 30-day price impact by ~$4.2B. West Africa reroute adds 4-day lead time. Recommend parallel execution.', time: '09:08', isAI: true },
  { from: 'Arjun Mehta', avatar: 'AM', text: 'Moving to vote on MOT-2024-031. All board members please confirm availability.', time: '09:10', isSelf: true },
];

export default function CollaborationRoom() {
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState(messages);

  const send = () => {
    if (!input.trim()) return;
    setChat(prev => [...prev, { from: 'Arjun Mehta', avatar: 'AM', text: input, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), isSelf: true }]);
    setInput('');
  };

  const typeColor = { EMERGENCY: '#ef4444', OPERATIONS: '#f59e0b', INTELLIGENCE: '#1d8cff' };

  return (
    <DashboardLayout>
      <PageHeader title="Collaboration Room" subtitle="Secure real-time communication for energy crisis response teams"
        badge={{ label: 'ENCRYPTED', color: '#22c55e' }}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Video size={13} />Video Call</button>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><Phone size={13} />Voice</button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 200px', gap: 14, height: 'calc(100vh - 180px)' }}>
        {/* Room List */}
        <GlassCard className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rooms</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {rooms.map(room => (
              <div key={room.id} onClick={() => setActiveRoom(room)}
                style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: activeRoom?.id === room.id ? 'rgba(29,140,255,0.08)' : 'transparent', borderLeft: activeRoom?.id === room.id ? '3px solid #1d8cff' : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{room.name}</span>
                  {room.unread > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{room.unread}</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>{room.lastMsg}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}>
                  <span style={{ color: typeColor[room.type], fontWeight: 600 }}>{room.type}</span>
                  <span style={{ color: 'var(--text-dim)' }}>· {room.members} members</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 'auto' }}>{room.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Chat Area */}
        <GlassCard className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{activeRoom?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{activeRoom?.members} members · End-to-end encrypted</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${typeColor[activeRoom?.type]}18`, color: typeColor[activeRoom?.type], border: `1px solid ${typeColor[activeRoom?.type]}30` }}>{activeRoom?.type}</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chat.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.isSelf ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: msg.isAI ? 'linear-gradient(135deg, #1d8cff, #8b5cf6)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: msg.isAI ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }}>{msg.avatar}</div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, textAlign: msg.isSelf ? 'right' : 'left' }}>{msg.from} · {msg.time}</div>
                  <div style={{ background: msg.isSelf ? 'rgba(29,140,255,0.15)' : msg.isAI ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${msg.isSelf ? 'rgba(29,140,255,0.2)' : msg.isAI ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: msg.isSelf ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8 }}>
            <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--text-dim)' }}><Paperclip size={14} /></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a secure message..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }} />
            <button className="btn btn-primary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 5 }} onClick={send}>
              <Send size={13} />Send
            </button>
          </div>
        </GlassCard>

        {/* Members */}
        <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Members ({members.length})</div>
          <div style={{ overflowY: 'auto' }}>
            {members.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.isAI ? 'linear-gradient(135deg, #1d8cff, #8b5cf6)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: m.isAI ? '#fff' : 'var(--text-secondary)' }}>{m.avatar}</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: m.online ? '#22c55e' : 'var(--text-dim)', border: '1.5px solid var(--bg-panel)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
