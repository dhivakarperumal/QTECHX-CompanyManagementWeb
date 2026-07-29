import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, FolderKanban,
  DollarSign, Briefcase, History, Printer, X
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';
import { useReactToPrint } from "react-to-print";

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const readOnlyFieldClass = 'w-full rounded-xl border border-white/5 bg-[#0a0c10] px-3 py-2.5 text-sm text-white/70 outline-none cursor-not-allowed';

const BLANK = {
  project_id: '',
  amount_paid: '',
  reason_for_payment: '',
  date_of_payment: new Date().toISOString().split('T')[0],
  time_of_payment: new Date().toTimeString().split(' ')[0].slice(0, 5)
};

export default function ProjectPayment() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [formData, setFormData] = useState(BLANK);
  const [projects, setProjects] = useState([]);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [projectSummary, setProjectSummary] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: selectedReceipt
      ? `Receipt_${selectedReceipt.project_code}_${selectedReceipt.date_of_payment}`
      : "Receipt",
  });

  // Fetch projects on mount
  useEffect(() => {
    (async () => {
      setProjectsLoading(true);
      try {
        const { data } = await api.get('/projects?limit=500&page=1');
        if (data.data && Array.isArray(data.data)) setProjects(data.data);
        else if (data.data?.rows) setProjects(data.data.rows);
        else if (Array.isArray(data)) setProjects(data);
      } catch (err) {
        console.warn('Failed to load projects:', err);
      } finally {
        setProjectsLoading(false);
      }
    })();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/project-payments');
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch project payments history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch project details when project selection changes
  useEffect(() => {
    if (!formData.project_id) {
      setSelectedProjectDetails(null);
      setProjectSummary(null);
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      setError('');
      try {
        // Find project from loaded projects
        const proj = projects.find(p => p.id.toString() === formData.project_id);
        if (proj) {
          setSelectedProjectDetails(proj);
        }

        // Fetch summary (total paid, balance)
        const { data } = await api.get(`/project-payments/${formData.project_id}/summary`);
        if (data.success) {
          setProjectSummary(data.data);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Error fetching project details');
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [formData.project_id, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_id) { setError('Please select a project'); return; }
    if (!formData.amount_paid || formData.amount_paid <= 0) { setError('Amount must be greater than 0'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        project_id: formData.project_id,
        client_name: selectedProjectDetails?.client_name,
        paid_to: userProfile?.displayName || 'Admin',
        amount_paid: parseFloat(formData.amount_paid),
        reason_for_payment: formData.reason_for_payment,
        date_of_payment: formData.date_of_payment,
        time_of_payment: formData.time_of_payment
      };

      const res = await api.post('/project-payments', payload);
      if (!res.data.success) throw new Error(res.data.message || 'Payment failed');

      setSuccess('Project payment recorded successfully!');
      fetchHistory(); // refresh table
      
      // Update summary manually so UI reflects instantly without re-fetching
      if (res.data.summary) {
        setProjectSummary(res.data.summary);
      }
      
      setFormData(BLANK); // reset form

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to record payment');
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
            <FolderKanban size={11} /> Project Finance
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Payment</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Record payments received from clients for ongoing projects.
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

        {/* Project Selection */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><FolderKanban size={15} className="text-blue-400" /></div>
            <h2 className="text-base font-bold text-white">Select Project</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Project *</span>
              <select className={fieldClass} name="project_id" value={formData.project_id} onChange={handleChange} required>
                <option value="">Select Project</option>
                {projectsLoading ? (
                  <option value="">Loading...</option>
                ) : (
                  projects.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      {proj.project_name} ({proj.project_code})
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
          
          {detailsLoading && <p className="mt-4 text-xs text-orange-400 animate-pulse">Loading project details...</p>}

          {selectedProjectDetails && (
            <div className="mt-6 grid gap-4 md:grid-cols-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <span className="block text-xs text-white/50 mb-1">Project Name</span>
                <span className="font-semibold">{selectedProjectDetails.project_name}</span>
              </div>
              <div>
                <span className="block text-xs text-white/50 mb-1">Project ID</span>
                <span className="font-semibold">{selectedProjectDetails.project_code}</span>
              </div>
              <div>
                <span className="block text-xs text-white/50 mb-1">Client Name</span>
                <span className="font-semibold">{selectedProjectDetails.client_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-white/50 mb-1">Total Project Cost</span>
                <span className="font-bold text-emerald-400">₹{parseFloat(selectedProjectDetails.total_project_cost || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {projectSummary && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex justify-between items-center">
                <span className="text-emerald-400 text-sm font-medium">Total Paid So Far</span>
                <span className="text-xl font-bold text-emerald-400">₹{parseFloat(projectSummary.total_paid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex justify-between items-center">
                <span className="text-orange-400 text-sm font-medium">Balance Remaining</span>
                <span className="text-xl font-bold text-orange-400">₹{parseFloat(projectSummary.balance || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </section>

        {/* Payment Details */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center"><DollarSign size={15} className="text-emerald-400" /></div>
            <h2 className="text-base font-bold text-white">Mark Project Payment</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Amount Paid (₹) *</span>
              <input className={fieldClass} type="number" name="amount_paid" min="1" step="0.01" value={formData.amount_paid} onChange={handleChange} required />
            </label>
            
            <label className="text-sm text-white/60 lg:col-span-3">
              <span className="mb-1.5 block font-medium">Reason for Payment</span>
              <input className={fieldClass} type="text" name="reason_for_payment" placeholder="e.g. Advance, Milestone 1, Final Settlement" value={formData.reason_for_payment} onChange={handleChange} />
            </label>

            <label className="text-sm text-white/60 lg:col-span-2">
              <span className="mb-1.5 block font-medium">From (Client)</span>
              <input className={readOnlyFieldClass} type="text" readOnly value={selectedProjectDetails?.client_name || ''} placeholder="Autofilled from project" />
            </label>

            <label className="text-sm text-white/60 lg:col-span-2">
              <span className="mb-1.5 block font-medium">To (Admin)</span>
              <input className={readOnlyFieldClass} type="text" readOnly value={userProfile?.displayName || 'Admin'} />
            </label>

            <label className="text-sm text-white/60 lg:col-span-2">
              <span className="mb-1.5 block font-medium">Date of Payment *</span>
              <input className={fieldClass} type="date" name="date_of_payment" value={formData.date_of_payment} onChange={handleChange} required />
            </label>

            <label className="text-sm text-white/60 lg:col-span-2">
              <span className="mb-1.5 block font-medium">Time of Payment *</span>
              <input className={fieldClass} type="time" name="time_of_payment" value={formData.time_of_payment} onChange={handleChange} required />
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading || !formData.project_id}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
            {loading ? 'Processing...' : 'Record Payment'}
          </button>
        </div>
      </form>

      {/* Payment History Table */}
      <section className={`${sectionClass} mt-10`}>
        <div className="mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center"><History size={15} className="text-pink-400" /></div>
          <h2 className="text-base font-bold text-white">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Amount (₹)</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 rounded-r-lg font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyLoading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-white/40">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-white/40">No payment records found.</td></tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{record.project_name}</div>
                      <div className="text-xs opacity-60">{record.project_code}</div>
                    </td>
                    <td className="px-4 py-3">{record.client_name || 'N/A'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{parseFloat(record.amount_paid).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">{record.reason_for_payment || '-'}</td>
                    <td className="px-4 py-3">{new Date(record.date_of_payment).toLocaleDateString()} {record.time_of_payment}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(record)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition"
                      >
                        <Printer size={13} /> Receipt
                      </button>
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
              <h3 className="font-bold text-gray-800">Payment Receipt Preview</h3>
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
                  <h2 className="text-2xl font-bold text-orange-600 uppercase tracking-widest">Payment Receipt</h2>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    Date: {new Date(selectedReceipt.date_of_payment).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Time: {selectedReceipt.time_of_payment}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Received From (Client)</span>
                  <span className="font-bold text-base">{selectedReceipt.client_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Received By (Admin)</span>
                  <span className="font-bold text-base">{selectedReceipt.paid_to || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Project Name</span>
                  <span className="font-semibold">{selectedReceipt.project_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Project ID</span>
                  <span className="font-semibold">{selectedReceipt.project_code}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block mb-1">Reason for Payment</span>
                  <span className="font-semibold">{selectedReceipt.reason_for_payment || '-'}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">PAYMENT SUMMARY</h3>
                
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Total Project Cost</span>
                  <span className="font-medium">₹{parseFloat(selectedReceipt.total_project_cost || 0).toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center text-base mb-3 py-2 border-y border-gray-200">
                  <span className="font-bold text-gray-800">Amount Paid Now</span>
                  <span className="font-black text-xl text-emerald-600">₹{parseFloat(selectedReceipt.amount_paid).toLocaleString('en-IN')}</span>
                </div>
                
                <p className="text-xs text-gray-500 italic mt-2">
                  * Note: This receipt acknowledges the payment received as per the details above. Balance amount may reflect other payments made separately.
                </p>
              </div>

              <div className="mt-12 pt-8 flex justify-between">
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <span className="text-xs text-gray-500 font-medium">Client Signature</span>
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
