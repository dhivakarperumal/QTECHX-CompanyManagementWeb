import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../api';

const FOLLOW_UP_STATUSES = ['Pending', 'Follow Up', 'Completed', 'Rescheduled', 'Cancelled'];

const followUpColors = {
  Pending:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Follow Up': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Completed:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rescheduled: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Cancelled:   'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

export default function FollowUpUpdateModal({ isOpen, onClose, client, onSuccess }) {
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && client) {
      setNewStatus(client.follow_up_status || 'Pending');
      setError('');
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === client.follow_up_status) {
      setError('Please select a different status to update.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = { follow_up_status: newStatus };
      const { data } = await api.put(`/clients/${client.uuid}`, payload);
      if (!data.success) throw new Error(data.message || 'Failed to update status');

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update follow-up status');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div 
        className="relative w-full max-w-sm bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Update Follow-up Status
          </h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">
                <ShieldCheck size={12} /> New Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FOLLOW_UP_STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewStatus(s)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${
                      newStatus === s 
                        ? followUpColors[s] || 'bg-white/10 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
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
