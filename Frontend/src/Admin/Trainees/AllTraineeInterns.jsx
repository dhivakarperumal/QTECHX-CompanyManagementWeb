import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Search, RefreshCw, Eye, Edit2, Trash2, Loader2, AlertCircle, CheckCircle, LayoutGrid, List } from 'lucide-react';
import api from '../../api';

const STATUS_OPTIONS = ['Active', 'Completed', 'On Leave', 'Inactive'];
const TYPE_OPTIONS = ['Trainee', 'Intern'];

const STATUS_STYLES = {
  Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Completed: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  'On Leave': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  Inactive: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
};

function StatusPill({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-white/10 text-white/50 border border-white/15';
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${cls}`}>{status || 'Unknown'}</span>;
}

export default function AllTraineeInterns() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/trainee-intern?${params}`);
      if (!data.success) throw new Error(data.message || 'Failed');
      setMembers(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1, page, limit: 20 });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [page, search, typeFilter, statusFilter]);
  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/trainee-intern/${deleteTarget.uuid}`);
      showToast('Member deleted');
      setDeleteTarget(null);
      loadMembers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const pages = useMemo(() => Array.from({ length: Math.max(1, pagination.pages) }, (_, i) => i + 1), [pagination.pages]);

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      {toast && <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl"><CheckCircle size={16} /> {toast}</div>}
      {deleteTarget && <div className="fixed inset-0 z-100 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} /><div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center"><Trash2 size={18} className="text-rose-400" /></div><div><h3 className="text-white font-bold text-base">Delete Member</h3><p className="text-white/40 text-xs mt-0.5">This cannot be undone</p></div></div><p className="text-white/60 text-sm mb-6 leading-relaxed">Delete <span className="text-white font-semibold">{deleteTarget.full_name}</span>?</p><div className="flex gap-3"><button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition">Cancel</button><button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2">{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {deleting ? 'Deleting…' : 'Delete'}</button></div></div></div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center"><GraduationCap size={22} className="text-orange-500" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trainees & Interns</h1>
            <p className="text-white/40 text-xs mt-0.5">{loading ? 'Loading…' : `${pagination.total} member${pagination.total !== 1 ? 's' : ''} total`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            <button onClick={() => setViewMode('table')} className={`rounded-lg p-2 transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Table view"><List size={15} /></button>
            <button onClick={() => setViewMode('card')} className={`rounded-lg p-2 transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Card view"><LayoutGrid size={15} /></button>
          </div>
          <button onClick={loadMembers} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"><RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} /></button>
          <button onClick={() => navigate('/admin/trainees/add')} className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}><Plus size={15} /> Add Member</button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or person ID" className="w-full rounded-xl border border-white/10 bg-white/4 pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black text-white px-3 py-2.5 text-sm outline-none focus:border-orange-500/50"
          >
            <option value="" className="bg-black text-white">
              All Types
            </option>

            {TYPE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
                className="bg-black text-white"
              >
                {option}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black text-white px-3 py-2.5 text-sm outline-none focus:border-orange-500/50"
          >
            <option value="" className="bg-black text-white">
              All Status
            </option>

            {STATUS_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
                className="bg-black text-white"
              >
                {option}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-2xl"><AlertCircle size={16} /> {error}</div>}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/4 text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left">Person ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="px-4 py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></td></tr> : members.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-white/40">No members found</td></tr> : members.map((member) => (
                  <tr key={member.uuid} className="border-t border-white/10 hover:bg-white/2">
                    <td className="px-4 py-3 text-white/80">{member.person_id}</td>
                    <td className="px-4 py-3"><div className="font-semibold text-white">{member.full_name}</div><div className="text-white/40 text-xs">{member.designation || '—'}</div></td>
                    <td className="px-4 py-3 text-white/70">{member.type}</td>
                    <td className="px-4 py-3 text-white/70">{member.department || '—'}</td>
                    <td className="px-4 py-3"><StatusPill status={member.status} /></td>
                    <td className="px-4 py-3 text-white/70"><div>{member.email_address || '—'}</div><div className="text-white/40 text-xs">{member.mobile_number || '—'}</div></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/trainees/view/${member.uuid}`)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10"><Eye size={14} /></button>
                        <button onClick={() => navigate(`/admin/trainees/edit/${member.uuid}`)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(member)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></div>
            ) : members.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">No members found</div>
            ) : members.map((member) => (
              <div key={member.uuid} className="rounded-2xl border border-white/10 bg-[#111318] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">{member.person_id}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{member.full_name}</h3>
                    <p className="text-sm text-white/60">{member.type}</p>
                  </div>
                  <StatusPill status={member.status} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <p>{member.department || '—'}</p>
                  <p>{member.email_address || '—'}</p>
                  <p>{member.mobile_number || '—'}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => navigate(`/admin/trainees/view/${member.uuid}`)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10">View</button>
                  <button onClick={() => navigate(`/admin/trainees/edit/${member.uuid}`)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10">Edit</button>
                  <button onClick={() => setDeleteTarget(member)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">Page {pagination.page} of {pagination.pages}</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 disabled:opacity-50">Prev</button>
            {pages.map((p) => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-2 text-sm ${page === p ? 'bg-orange-500 text-white' : 'border border-white/10 bg-white/5 text-white/60'}`}>{p}</button>)}
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
