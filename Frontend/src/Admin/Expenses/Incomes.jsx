import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, FolderKanban,
  DollarSign, Briefcase, History, Printer, X
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const readOnlyFieldClass = 'w-full rounded-xl border border-white/5 bg-[#0a0c10] px-3 py-2.5 text-sm text-white/70 outline-none cursor-not-allowed';

const BLANK = {
  income_type: '',
  intern_id: '',
  income_reason: '',
  amount: '',
  payment_type: '',
  date_of_payment: new Date().toISOString().split('T')[0],
  paid_to: ''
};

export default function Incomes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ ...BLANK, paid_to: user?.username || user?.name || 'Admin' });
  const [interns, setInterns] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [internsLoading, setInternsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch interns on mount
  useEffect(() => {
    (async () => {
      setInternsLoading(true);
      try {
        const { data } = await api.get('/trainee-intern?limit=500&page=1');
        if (data.data && Array.isArray(data.data)) setInterns(data.data);
        else if (data.data?.rows) setInterns(data.data.rows);
        else if (Array.isArray(data)) setInterns(data);
      } catch (err) {
        console.warn('Failed to load interns:', err);
      } finally {
        setInternsLoading(false);
      }
    })();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/incomes');
      if (data.success) {
        setHistory(data.incomes);
      }
    } catch (err) {
      console.warn("Failed to fetch incomes history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset fields when type changes
      if (name === 'income_type') {
        newData.intern_id = '';
        newData.income_reason = '';
      }
      return newData;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.income_type) { setError('Please select an income type'); return; }
    if (formData.income_type === 'Internship Payment' && !formData.intern_id) { setError('Please select an intern'); return; }
    if (formData.income_type === 'Other' && !formData.income_reason) { setError('Please enter income reason'); return; }
    if (!formData.amount || formData.amount <= 0) { setError('Amount must be greater than 0'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        created_by: user?.user_id
      };

      const res = await api.post('/incomes', payload);
      if (!res.data.success) throw new Error(res.data.message || 'Payment failed');

      setSuccess('Income recorded successfully!');
      fetchHistory(); // refresh table
      
      setFormData({ ...BLANK, paid_to: user?.username || user?.name || 'Admin' });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to record income');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/admin/expenses')}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition shrink-0 mt-1">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
            <DollarSign size={11} /> Company Income
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Income</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Record other company incomes.
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm px-5 py-3.5 rounded-2xl">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Income Details */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><Briefcase size={15} className="text-blue-400" /></div>
            <h2 className="text-base font-bold text-white">Income Details</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Income Type *</span>
              <select className={fieldClass} name="income_type" value={formData.income_type} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="Internship Payment">Internship Payment</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {formData.income_type === 'Internship Payment' && (
              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Select Intern *</span>
                <select className={fieldClass} name="intern_id" value={formData.intern_id} onChange={handleChange} required>
                  <option value="">Select Intern</option>
                  {internsLoading ? <option disabled>Loading interns...</option> : interns.map(intern => (
                    <option key={intern.uuid || intern.id} value={intern.uuid || intern.id}>
                      {intern.full_name} ({intern.person_id})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {formData.income_type === 'Other' && (
              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Income Reason *</span>
                <input type="text" className={fieldClass} name="income_reason" value={formData.income_reason} onChange={handleChange} placeholder="e.g. Server Reimbursement" required />
              </label>
            )}

            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Amount Received *</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-white/40">₹</span>
                </div>
                <input type="number" step="0.01" min="1" className={`${fieldClass} pl-8`} name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" required />
              </div>
            </label>

            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Payment Mode *</span>
              <select className={fieldClass} name="payment_type" value={formData.payment_type} onChange={handleChange} required>
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Date of Payment *</span>
              <input type="date" className={fieldClass} name="date_of_payment" value={formData.date_of_payment} onChange={handleChange} required />
            </label>

            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Received By *</span>
              <input type="text" className={fieldClass} name="paid_to" value={formData.paid_to} onChange={handleChange} required />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3 pt-5 border-t border-white/10">
            <button type="button" onClick={() => setFormData({ ...BLANK, paid_to: user?.username || user?.name || 'Admin' })}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition">
              Reset
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Record Income
            </button>
          </div>
        </section>
      </form>

      {/* History Table */}
      <section className={sectionClass}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center"><History size={15} className="text-purple-400" /></div>
            <h2 className="text-base font-bold text-white">Income History</h2>
          </div>
          <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-lg">
            {history.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0e1118] text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-xl">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Details (Intern/Reason)</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium rounded-r-xl">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {historyLoading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
                    <Loader2 size={20} className="animate-spin text-white/40 mx-auto" />
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-white/40">No income history found</td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">{new Date(h.date_of_payment).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10">
                        {h.income_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={h.intern_name || h.income_reason}>
                      {h.income_type === 'Internship Payment' ? h.intern_name : h.income_reason}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">₹{parseFloat(h.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{h.payment_type}</td>
                    <td className="px-4 py-3">{h.paid_to}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
