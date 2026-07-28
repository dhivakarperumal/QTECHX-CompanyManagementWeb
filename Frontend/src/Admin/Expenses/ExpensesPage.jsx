import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Receipt, DollarSign, PlusCircle, CheckCircle2, AlertCircle, Loader2, X, Download } from "lucide-react";

const ExpensesPage = () => {
  const [fund, setFund] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [fundAmount, setFundAmount] = useState("");
  const [expenseData, setExpenseData] = useState({
    expense_type: "",
    date_of_payment: "",
    amount: "",
    payment_type: "",
    paid_to: "",
    description: "",
    invoice_number: "",
  });
  const [billFile, setBillFile] = useState(null);

  const fetchFund = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/fund", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (data.success) {
        setFund(data.available_fund);
      }
    } catch (error) {
      console.error("Error fetching fund", error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFund();
    fetchExpenses();
  }, []);

  const handleUpdateFund = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/fund", 
        { available_fund: parseFloat(fundAmount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
      );
      if (data.success) {
        toast.success("Fund updated successfully", {
          style: { background: '#10b981', color: '#fff' },
        });
        setFund(data.available_fund);
        setShowFundForm(false);
        setFundAmount("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating fund", {
        style: { background: '#ef4444', color: '#fff' },
      });
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(expenseData).forEach((key) => {
      formData.append(key, expenseData[key]);
    });
    if (billFile) {
      formData.append("upload_bill", billFile);
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/expenses", formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      if (data.success) {
        toast.success("Expense added successfully", {
          style: { background: '#10b981', color: '#fff' },
        });
        setShowExpenseForm(false);
        setExpenseData({
          expense_type: "",
          date_of_payment: "",
          amount: "",
          payment_type: "",
          paid_to: "",
          description: "",
          invoice_number: "",
        });
        setBillFile(null);
        fetchFund();
        fetchExpenses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding expense", {
        style: { background: '#ef4444', color: '#fff' },
      });
    }
  };

  const totalSpent = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <Toaster position="top-right" />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Receipt size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Expenses</h1>
            <p className="text-white/40 text-xs mt-0.5">
              Manage your company funds and track expenses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            {showExpenseForm ? <X size={15} /> : <PlusCircle size={15} />}
            {showExpenseForm ? "Cancel" : "Add Expense"}
          </button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Available Fund Stat */}
        <div className="bg-white/[0.04] border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.06] transition relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition duration-500" />
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Available Fund</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">₹ {parseFloat(fund).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            {!showFundForm ? (
              <button 
                onClick={() => setShowFundForm(true)}
                className="text-xs font-semibold px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition"
              >
                Update Fund
              </button>
            ) : (
              <form onSubmit={handleUpdateFund} className="flex gap-2">
                <input 
                  type="number" step="0.01" 
                  value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  placeholder="New amount" required
                />
                <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600">Save</button>
                <button type="button" onClick={() => setShowFundForm(false)} className="px-3 py-1.5 bg-white/5 text-white/60 rounded-lg hover:text-white hover:bg-white/10">X</button>
              </form>
            )}
          </div>
        </div>

        {/* Total Spent Stat */}
        <div className="bg-white/[0.04] border border-rose-500/20 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.06] transition relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition duration-500" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
              <Receipt size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Total Spent</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">₹ {totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/30 mt-4 relative z-10">{expenses.length} total expenses recorded.</p>
        </div>
      </div>

      {/* ── Add Expense Form ── */}
      {showExpenseForm && (
        <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" />
            Record New Expense
          </h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Expense Type</label>
              <input type="text" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition" 
                placeholder="e.g. Server Hosting, Office Supplies"
                value={expenseData.expense_type} onChange={(e) => setExpenseData({...expenseData, expense_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Paid To</label>
              <input type="text" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
                placeholder="e.g. Amazon Web Services"
                value={expenseData.paid_to} onChange={(e) => setExpenseData({...expenseData, paid_to: e.target.value})} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Date of Payment</label>
              <input type="date" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition [color-scheme:dark]"
                value={expenseData.date_of_payment} onChange={(e) => setExpenseData({...expenseData, date_of_payment: e.target.value})} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Amount (₹)</label>
              <input type="number" step="0.01" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
                placeholder="0.00"
                value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Payment Type</label>
              <select required 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition appearance-none"
                value={expenseData.payment_type} onChange={(e) => setExpenseData({...expenseData, payment_type: e.target.value})}>
                <option value="" className="bg-[#111318]">Select Payment Type</option>
                <option value="Cash" className="bg-[#111318]">Cash</option>
                <option value="Bank Transfer" className="bg-[#111318]">Bank Transfer</option>
                <option value="Credit Card" className="bg-[#111318]">Credit Card</option>
                <option value="UPI" className="bg-[#111318]">UPI</option>
                <option value="Cheque" className="bg-[#111318]">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Invoice Number</label>
              <input type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
                placeholder="Optional"
                value={expenseData.invoice_number} onChange={(e) => setExpenseData({...expenseData, invoice_number: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Description</label>
              <textarea rows="2"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
                placeholder="Additional notes about this expense..."
                value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}></textarea>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Upload Bill (Optional)</label>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition cursor-pointer"
                onChange={(e) => setBillFile(e.target.files[0])} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 mt-2 border-t border-white/5 pt-5">
              <button type="button" onClick={() => setShowExpenseForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition">
                Cancel
              </button>
              <button type="submit" 
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                Submit Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table Mode ── */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading expenses…</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Receipt size={30} className="opacity-40" />
            </div>
            <p className="text-base font-semibold text-white/40">No expenses recorded</p>
            <p className="text-xs mt-1">Add your first expense to track spending.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Date</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Expense Details</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Payment Mode</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Amount</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Bill</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.expense_id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white/80 font-medium text-sm">
                        {new Date(exp.date_of_payment).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold text-sm leading-tight">{exp.expense_type}</p>
                      <p className="text-white/40 text-xs mt-0.5">Paid to: {exp.paid_to}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/5 text-white/60 border border-white/10">
                        {exp.payment_type}
                      </span>
                      {exp.invoice_number && (
                        <p className="text-[10px] text-white/30 mt-1">Inv: {exp.invoice_number}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-rose-400 font-bold text-sm">₹ {parseFloat(exp.amount).toFixed(2)}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {exp.upload_bill ? (
                        <a href={`http://localhost:5000/uploads/expenses/${exp.upload_bill}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition"
                          title="View Bill">
                          <Download size={14} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-white/20 italic">No bill</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
