import React, { useState } from 'react';
import { Users, Search, Plus, Shield, Edit, Trash2, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GlassCard from '../../components/ui/GlassCard.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const users = [
  { id: 'USR-001', name: 'Arjun Mehta', email: 'arjun.mehta@nemc.gov.in', role: 'Commander', dept: 'NEMC', clearance: 'TOP SECRET', status: 'ACTIVE', lastLogin: '2 min ago', avatar: 'AM' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya.sharma@mop.gov.in', role: 'MoP Secretary', dept: 'Ministry of Petroleum', clearance: 'SECRET', status: 'ACTIVE', lastLogin: '1 hour ago', avatar: 'PS' },
  { id: 'USR-003', name: 'Rajiv Kumar', email: 'rajiv.kumar@ioc.in', role: 'IOC Chairman', dept: 'Indian Oil', clearance: 'SECRET', status: 'ACTIVE', lastLogin: '2 hours ago', avatar: 'RK' },
  { id: 'USR-004', name: 'Anita Bose', email: 'anita.bose@finmin.gov.in', role: 'Finance Ministry', dept: 'Ministry of Finance', clearance: 'CONFIDENTIAL', status: 'ACTIVE', lastLogin: 'Yesterday', avatar: 'AB' },
  { id: 'USR-005', name: 'Suresh Nair', email: 'suresh.nair@hpcl.in', role: 'HPCL Director', dept: 'HPCL', clearance: 'SECRET', status: 'ACTIVE', lastLogin: '3 hours ago', avatar: 'SN' },
  { id: 'USR-006', name: 'Vikram Singh', email: 'vikram.singh@mea.gov.in', role: 'MEA Representative', dept: 'Ministry of External Affairs', clearance: 'CONFIDENTIAL', status: 'INACTIVE', lastLogin: '5 days ago', avatar: 'VS' },
  { id: 'USR-007', name: 'Deepa Rao', email: 'deepa.rao@bpcl.in', role: 'BPCL Analyst', dept: 'BPCL', clearance: 'RESTRICTED', status: 'ACTIVE', lastLogin: '4 hours ago', avatar: 'DR' },
];

const clearanceColors = { 'TOP SECRET': '#ef4444', 'SECRET': '#f59e0b', 'CONFIDENTIAL': '#1d8cff', 'RESTRICTED': '#22c55e' };

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.dept.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader title="User Management" subtitle="Access control, clearance levels, and role assignment for all platform users"
        badge={{ label: `${users.length} USERS`, color: '#1d8cff' }}
        actions={
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Plus size={13} />Add User
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Users', value: users.length, color: '#1d8cff' },
          { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length, color: '#22c55e' },
          { label: 'Top Secret', value: users.filter(u => u.clearance === 'TOP SECRET').length, color: '#ef4444' },
          { label: 'Departments', value: new Set(users.map(u => u.dept)).size, color: '#8b5cf6' },
        ].map(stat => (
          <GlassCard key={stat.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name, email, or department..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '9px 12px 9px 32px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Users Table */}
      <GlassCard className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['User', 'Role / Department', 'Clearance', 'Last Login', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(29,140,255,0.3), rgba(139,92,246,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1d8cff', flexShrink: 0 }}>{user.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{user.role}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{user.dept}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${clearanceColors[user.clearance]}18`, color: clearanceColors[user.clearance], border: `1px solid ${clearanceColors[user.clearance]}30` }}>
                    <Shield size={9} style={{ marginRight: 4, verticalAlign: 'middle' }} />{user.clearance}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-secondary)' }}>{user.lastLogin}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={user.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'rgba(29,140,255,0.1)', border: '1px solid rgba(29,140,255,0.2)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#1d8cff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><Edit size={11} />Edit</button>
                    <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </DashboardLayout>
  );
}
