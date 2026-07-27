import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../api';
import { StatusPill } from './AllClients'; // Wait, StatusPill is exported from AllClients? Actually, let's just define styles locally or import from constants if they exist.

const CLIENT_STATUSES = ["Lead", "Prospect", "Active", "Inactive", "Converted", "Closed"];

const statusColors = {
  Lead: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Prospect: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Inactive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Converted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function StatusUpdateModal({ isOpen, onClose, client, onSuccess }) {
  const [newStatus, setNewStatus] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && client) {
      setNewStatus(client.client_status || 'Lead');
      setDiscussion('');
      setNextDate('');
      setNextTime('');
      setError('');
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discussion.trim() && newStatus === client.client_status) {
      setError('Please provide a discussion summary or change the status.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        new_status: newStatus,
        discussion_summary: discussion,
      };
      if (nextDate) payload.next_follow_up_date = nextDate;
      if (nextTime) payload.next_follow_up_time = nextTime;

      const { data } = await api.post(`/clients/${client.uuid}/history`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to log history');

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition";
  
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-md bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Update Status & Log Follow-up
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
              <ShieldCheck size={12} /> New Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLIENT_STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewStatus(s)}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${
                    newStatus === s 
                      ? statusColors[s] 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
              <MessageSquare size={12} /> Discussion Summary / Notes
            </label>
            <textarea 
              rows={3} 
              className={inp + ' resize-none'} 
              placeholder="What was discussed?" 
              value={discussion} 
              onChange={e => setDiscussion(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                <Calendar size={12} /> Next Follow-up Date
              </label>
              <input type="date" className={inp} value={nextDate} onChange={e => setNextDate(e.target.value)} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                <Clock size={12} /> Next Time
              </label>
              <input type="time" className={inp} value={nextTime} onChange={e => setNextTime(e.target.value)} />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
