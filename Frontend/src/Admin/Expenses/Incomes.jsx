import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, FolderKanban,
  DollarSign, Briefcase, History, Printer, X, Edit, Trash2, Search, LayoutGrid, List
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';
import { useReactToPrint } from "react-to-print";

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';

const BLANK = {
  income_type: '',
  intern_id: '',
  intern_name: '',
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

  const [editId, setEditId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [incomeViewMode, setIncomeViewMode] = useState('table');
  const receiptRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: selectedReceipt
      ? `Receipt_${selectedReceipt.income_type}_${selectedReceipt.date_of_payment}`
      : "Receipt",
  });

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
        newData.intern_name = '';
        newData.income_reason = '';
      }
      
      // Auto-populate intern_name
      if (name === 'intern_id') {
        const intern = interns.find(i => (i.uuid || i.id) === value || String(i.id) === value);
        if (intern) newData.intern_name = intern.full_name;
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
        updated_by: user?.user_id,
        created_by: user?.user_id
      };

      let res;
      if (editId) {
        res = await api.put(`/incomes/${editId}`, payload);
      } else {
        res = await api.post('/incomes', payload);
      }

      if (!res.data.success) throw new Error(res.data.message || 'Payment failed');

      setSuccess(`Income ${editId ? 'updated' : 'recorded'} successfully!`);
      fetchHistory();
      
      resetForm();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to record income');
    } finally { setLoading(false); }
  };

  const handleEdit = (record) => {
    setEditId(record.income_id);
    setFormData({
      income_type: record.income_type || '',
      intern_id: record.intern_id || '',
      intern_name: record.intern_name || '',
      income_reason: record.income_reason || '',
      amount: record.amount || '',
      payment_type: record.payment_type || '',
      date_of_payment: record.date_of_payment ? new Date(record.date_of_payment).toISOString().split('T')[0] : '',
      paid_to: record.paid_to || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Are you sure you want to delete this income record? This will adjust the company funds accordingly.")) return;
    try {
      const res = await api.delete(`/incomes/${record.income_id}`, { data: { updated_by: user?.user_id } });
      if (res.data.success) {
        setSuccess("Income record deleted.");
        fetchHistory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.data.message || "Failed to delete");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ ...BLANK, paid_to: user?.username || user?.name || 'Admin' });
    setError('');
  };

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return history.filter((record) => {
      const detailText = `${record.income_type || ''} ${record.intern_name || ''} ${record.income_reason || ''} ${record.paid_to || ''}`.toLowerCase();
      const matchesSearch = !term || detailText.includes(term);
      const matchesType = typeFilter === 'All' || record.income_type === typeFilter;
      const matchesMode = modeFilter === 'All' || record.payment_type === modeFilter;

      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date();
        const recordDate = record.date_of_payment ? new Date(record.date_of_payment) : null;
        matchesDate = Boolean(recordDate && recordDate.toDateString() === today.toDateString());
      } else if (dateFilter === 'this_month') {
        const today = new Date();
        const recordDate = record.date_of_payment ? new Date(record.date_of_payment) : null;
        matchesDate = Boolean(recordDate && recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear());
      }

      return matchesSearch && matchesType && matchesMode && matchesDate;
    });
  }, [history, searchTerm, typeFilter, modeFilter, dateFilter]);

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
            Record and manage company incomes.
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
            <h2 className="text-base font-bold text-white">{editId ? 'Edit Income Details' : 'Income Details'}</h2>
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
                    <option key={intern.uuid || intern.id} value={intern.uuid || String(intern.id)}>
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
            <button type="button" onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition">
              {editId ? 'Cancel' : 'Reset'}
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {editId ? 'Update Income' : 'Record Income'}
            </button>
          </div>
        </section>
      </form>

      {/* History Table */}
      <section className={sectionClass}>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center"><History size={15} className="text-purple-400" /></div>
            <div>
              <h2 className="text-base font-bold text-white">Income History</h2>
              <p className="text-sm text-white/40">Search and filter income entries quickly.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search income" className="w-44 rounded-xl border border-white/10 bg-[#0e1118] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/70" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/70">
              <option value="All">All types</option>
              <option value="Internship Payment">Internship Payment</option>
              <option value="Other">Other</option>
            </select>
            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/70">
              <option value="All">All modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/70">
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="this_month">This month</option>
            </select>
            <div className="flex items-center rounded-xl border border-white/10 bg-[#0e1118] p-1">
              <button onClick={() => setIncomeViewMode('table')} className={`rounded-lg p-2 transition ${incomeViewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Table view"><List size={15} /></button>
              <button onClick={() => setIncomeViewMode('card')} className={`rounded-lg p-2 transition ${incomeViewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Card view"><LayoutGrid size={15} /></button>
            </div>
          </div>
        </div>

        {incomeViewMode === 'card' ? (
          <div className="grid gap-3 md:grid-cols-2">
            {historyLoading ? (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/40">Loading history...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/40">No income records found.</div>
            ) : filteredHistory.map((record) => (
              <div key={record.income_id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{record.income_type}</p>
                    <p className="text-xs text-white/40">{record.intern_name || record.income_reason || '—'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">₹{parseFloat(record.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-white/50">Date</span>
                  <span className="text-white/70">{new Date(record.date_of_payment).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/50">Mode</span>
                  <span className="text-white/70">{record.payment_type || '—'}</span>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={() => handleEdit(record)} className="rounded-lg bg-blue-500/10 p-2 text-blue-400"> <Edit size={14} /> </button>
                  <button onClick={() => handleDelete(record)} className="rounded-lg bg-red-500/10 p-2 text-red-400"> <Trash2 size={14} /> </button>
                  <button onClick={() => setSelectedReceipt(record)} className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400"> <Printer size={13} /> Receipt </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0e1118] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-l-xl">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Details (Intern/Reason)</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Received By</th>
                <th className="px-4 py-3 font-medium rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {historyLoading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center">
                    <Loader2 size={20} className="animate-spin text-white/40 mx-auto" />
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-white/40">No income history found</td>
                </tr>
              ) : (
                filteredHistory.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-white/2 transition">
                    <td className="px-4 py-3">{new Date(h.date_of_payment).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10">
                        {h.income_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-50 truncate" title={h.intern_name || h.income_reason}>
                      {h.income_type === 'Internship Payment' ? h.intern_name : h.income_reason}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">₹{parseFloat(h.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{h.payment_type}</td>
                    <td className="px-4 py-3">{h.paid_to}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(h)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(h)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedReceipt(h)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition"
                          title="Receipt"
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Income Receipt Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition shadow-sm"
                >
                  <Printer size={15} />
                  Print
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto bg-white text-gray-800" ref={receiptRef}>
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Q-Techx Solutions</h1>
                  <p className="text-sm text-gray-500 mt-1">123 Tech Avenue, Innovation Park</p>
                  <p className="text-sm text-gray-500">City, State, ZIP</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-orange-600 uppercase tracking-widest">Income Receipt</h2>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    Date: {new Date(selectedReceipt.date_of_payment).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    Receipt ID: {selectedReceipt.income_id.split('-')[0].toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Income Type</span>
                  <span className="font-bold text-base">{selectedReceipt.income_type}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Received By (Admin)</span>
                  <span className="font-bold text-base">{selectedReceipt.paid_to || 'N/A'}</span>
                </div>
                
                {selectedReceipt.income_type === 'Internship Payment' ? (
                  <>
                    <div>
                      <span className="text-gray-500 block mb-1">Intern Name</span>
                      <span className="font-semibold">{selectedReceipt.intern_name || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-500 block mb-1">Reason for Income</span>
                      <span className="font-semibold">{selectedReceipt.income_reason || '-'}</span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-gray-500 block mb-1">Payment Mode</span>
                  <span className="font-semibold">{selectedReceipt.payment_type || '-'}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">PAYMENT SUMMARY</h3>
                
                <div className="flex justify-between items-center text-base mb-3 py-2 border-y border-gray-200">
                  <span className="font-bold text-gray-800">Amount Received</span>
                  <span className="font-black text-xl text-emerald-600">₹{parseFloat(selectedReceipt.amount).toLocaleString('en-IN')}</span>
                </div>
                
                <p className="text-xs text-gray-500 italic mt-2">
                  * Note: This receipt acknowledges the payment received as per the details above.
                </p>
              </div>

              <div className="mt-12 pt-8 flex justify-between">
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <span className="text-xs text-gray-500 font-medium">Depositor Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <span className="text-xs text-gray-500 font-medium">Authorized Signatory</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-8 italic">This is a system generated document and does not require a physical signature.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
