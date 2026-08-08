import React, { useState, useEffect } from "react";
import Select from 'react-select';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
      ? '#f97316'
      : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Receipt, DollarSign, PlusCircle, CheckCircle2, AlertCircle, Loader2, X, Download } from "lucide-react";
import ModalPortal from "../../Componets/CommonComponents/ModalPortal";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </ModalPortal>
  );
}

const ExpensesPage = () => {
  const [fund, setFund] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    expenseType: "",
    paymentMethod: "",
    datePreset: "all",
    dateFrom: "",
    dateTo: "",
  });

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
  const [customExpenseType, setCustomExpenseType] = useState("");
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

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (data?.data) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  useEffect(() => {
    fetchFund();
    fetchExpenses();
    fetchEmployees();
  }, []);

  const handleUpdateFund = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/fund",
        { available_fund: parseFloat(fundAmount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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

    const finalExpenseType = expenseData.expense_type === "Other"
      ? customExpenseType.trim()
      : expenseData.expense_type;

    if (!finalExpenseType) {
      toast.error("Please enter a custom expense type", {
        style: { background: '#ef4444', color: '#fff' },
      });
      return;
    }

    const formData = new FormData();
    formData.append("expense_type", finalExpenseType);
    formData.append("date_of_payment", expenseData.date_of_payment);
    formData.append("amount", expenseData.amount);
    formData.append("payment_type", expenseData.payment_type);
    formData.append("paid_to", expenseData.paid_to);
    formData.append("description", expenseData.description);
    formData.append("invoice_number", expenseData.invoice_number);
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
        setCustomExpenseType("");
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

  const expenseFormTypeOptions = [
    "Office Rent",
    "Electricity Bill",
    "Water Bill",
    "Internet Bill",
    "Phone Bill",
    "Office Maintenance",
    "Office Supplies",
    "Stationery",
    "Snacks & Tea",
    "Travel Expense",
    "Fuel Expense",
    "Software Subscription",
    "Cloud Hosting",
    "Domain & SSL",
    "Marketing",
    "Advertising",
    "Courier & Shipping",
    "Furniture",
    "Computer & Accessories",
    "Employee Welfare",
    "Training",
    "Taxes",
    "Insurance",
    "Miscellaneous",
    "Other",
  ];
  const expenseFilterTypeOptions = [
    "Salary",
    "Project Payment",
    "Income",
    "Office Rent",
    "Electricity Bill",
    "Water Bill",
    "Internet Bill",
    "Phone Bill",
    "Office Maintenance",
    "Office Supplies",
    "Stationery",
    "Snacks & Tea",
    "Travel Expense",
    "Fuel Expense",
    "Software Subscription",
    "Cloud Hosting",
    "Domain & SSL",
    "Marketing",
    "Advertising",
    "Courier & Shipping",
    "Furniture",
    "Computer & Accessories",
    "Employee Welfare",
    "Training",
    "Taxes",
    "Insurance",
    "Miscellaneous",
    "Other",
  ];
  const paymentMethodOptions = ["Cash", "Bank Transfer", "Credit Card", "UPI", "Cheque"];
  const datePresetOptions = [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];
  const isOtherExpenseType = expenseData.expense_type === "Other";

  const isCreditEntry = (entry) => {
    const type = String(entry?.expense_type || "").trim().toLowerCase();
    return type === "income" || type === "project payment";
  };

  const filteredExpenses = expenses.filter((exp) => {
    const expenseDate = exp.date_of_payment ? new Date(exp.date_of_payment) : null;

    if (filters.expenseType && exp.expense_type !== filters.expenseType) return false;
    if (filters.paymentMethod && exp.payment_type !== filters.paymentMethod) return false;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    let dateMatch = true;
    if (filters.datePreset === "today") {
      dateMatch = Boolean(expenseDate && expenseDate >= startOfToday && expenseDate <= endOfToday);
    } else if (filters.datePreset === "yesterday") {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(startOfToday);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      dateMatch = Boolean(expenseDate && expenseDate >= yesterday && expenseDate <= yesterdayEnd);
    } else if (filters.datePreset === "this_week") {
      const weekStart = new Date(startOfToday);
      weekStart.setDate(startOfToday.getDate() - startOfToday.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      dateMatch = Boolean(expenseDate && expenseDate >= weekStart && expenseDate <= weekEnd);
    } else if (filters.datePreset === "this_month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      dateMatch = Boolean(expenseDate && expenseDate >= monthStart && expenseDate <= monthEnd);
    } else if (filters.datePreset === "custom") {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }
      if (fromDate && expenseDate && expenseDate < fromDate) dateMatch = false;
      if (toDate && expenseDate && expenseDate > toDate) dateMatch = false;
    }

    return dateMatch;
  });

  const filteredSpendEntries = filteredExpenses.filter((exp) => !isCreditEntry(exp));
  const totalSpent = filteredSpendEntries.reduce((acc, exp) => acc + parseFloat(exp.amount || 0), 0);
  const categoryBreakdown = Object.entries(
    filteredSpendEntries.reduce((acc, exp) => {
      const key = exp.expense_type || "Miscellaneous";
      acc[key] = (acc[key] || 0) + parseFloat(exp.amount || 0);
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const pieSegments = categoryBreakdown.length > 0
    ? categoryBreakdown.map((item, index) => {
      const colors = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
      return `${colors[index % colors.length]} ${index === 0 ? 0 : categoryBreakdown.slice(0, index).reduce((sum, entry) => sum + (entry.value / totalSpent) * 100, 0)}% ${index === categoryBreakdown.length - 1 ? 100 : categoryBreakdown.slice(0, index + 1).reduce((sum, entry) => sum + (entry.value / totalSpent) * 100, 0)}%`;
    })
    : ["#f97316 0% 100%"];

  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
    const monthValue = filteredSpendEntries.reduce((sum, exp) => {
      const expenseDate = exp.date_of_payment ? new Date(exp.date_of_payment) : null;
      if (!expenseDate) return sum;
      return expenseDate.getMonth() === index ? sum + parseFloat(exp.amount || 0) : sum;
    }, 0);
    return { monthName, monthValue };
  });

  const maxMonthlyValue = Math.max(...monthlyTrend.map((item) => item.monthValue), 1);

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
        <div className="bg-white/4 border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/6 transition relative overflow-hidden group">
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
        <div className="bg-white/4 border border-rose-500/20 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/6 transition relative overflow-hidden group">
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
          <p className="text-[11px] text-white/30 mt-4 relative z-10">{expenses.length} total transactions recorded.</p>
        </div>
      </div>

      <Modal open={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Record New Expense">
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Expense Type</label>
            <Select
              options={[
                ...expenseFormTypeOptions.map(option => ({ value: option, label: option }))
              ]}
              value={expenseData.expense_type ? { value: expenseData.expense_type, label: expenseData.expense_type } : null}
              onChange={(option) => {
                const value = option ? option.value : "";
                setExpenseData((prev) => ({ ...prev, expense_type: value, paid_to: value === "Salary" ? prev.paid_to : "" }));
                if (value !== "Other") {
                  setCustomExpenseType("");
                }
              }}
              styles={customSelectStyles}
              placeholder="Select Expense Type"
              isSearchable={true}
            />
            {isOtherExpenseType && (
              <div className="mt-2">
                <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Custom Expense Type</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
                  placeholder="Enter expense type"
                  value={customExpenseType}
                  onChange={(e) => setCustomExpenseType(e.target.value)}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Paid To</label>
            <input type="text" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
              placeholder="e.g. Amazon Web Services"
              value={expenseData.paid_to} onChange={(e) => setExpenseData({ ...expenseData, paid_to: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Date of Payment</label>
            <input type="date" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition scheme-dark"
              value={expenseData.date_of_payment} onChange={(e) => setExpenseData({ ...expenseData, date_of_payment: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Amount (₹)</label>
            <input type="number" step="0.01" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
              placeholder="0.00"
              value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Payment Type</label>
            <Select
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cheque', label: 'Cheque' }
              ]}
              value={expenseData.payment_type ? { value: expenseData.payment_type, label: expenseData.payment_type } : null}
              onChange={(option) => setExpenseData({ ...expenseData, payment_type: option ? option.value : "" })}
              styles={customSelectStyles}
              placeholder="Select Payment Type"
              isSearchable={false}
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Invoice Number</label>
            <input type="text"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
              placeholder="Optional"
              value={expenseData.invoice_number} onChange={(e) => setExpenseData({ ...expenseData, invoice_number: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-1">Description</label>
            <textarea rows="2"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
              placeholder="Additional notes about this expense..."
              value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}></textarea>
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
      </Modal>

      <div className="bg-[#111318] border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1">Expense Type</label>
              <Select
                options={[
                  { value: '', label: 'All Types' },
                  ...expenseFilterTypeOptions.map(option => ({ value: option, label: option }))
                ]}
                value={{ value: filters.expenseType, label: filters.expenseType || 'All Types' }}
                onChange={(option) => setFilters((prev) => ({ ...prev, expenseType: option ? option.value : "" }))}
                styles={customSelectStyles}
                className="w-48"
                isSearchable={true}
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1">Payment Method</label>
              <Select
                options={[
                  { value: '', label: 'All Methods' },
                  ...paymentMethodOptions.map(option => ({ value: option, label: option }))
                ]}
                value={{ value: filters.paymentMethod, label: filters.paymentMethod || 'All Methods' }}
                onChange={(option) => setFilters((prev) => ({ ...prev, paymentMethod: option ? option.value : "" }))}
                styles={customSelectStyles}
                className="w-48"
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/35 uppercase tracking-wider font-semibold mb-1">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {datePresetOptions.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, datePreset: preset.value }))}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filters.datePreset === preset.value ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {filters.datePreset === "custom" && (
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />
                <input
                  type="date"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setFilters({ expenseType: "", paymentMethod: "", datePreset: "all", dateFrom: "", dateTo: "" })}
              className="text-sm text-white/60 hover:text-white transition"
            >
              Clear
            </button>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              {filteredExpenses.length} matched
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Mode ── */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
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
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Date</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Expense Details</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Payment Mode</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Amount</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Bill</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.expense_id} className="border-b border-white/4 hover:bg-white/2.5 transition-colors">
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
                      <p className={`${isCreditEntry(exp) ? "text-emerald-400" : "text-rose-400"} font-bold text-sm`}>
                        {isCreditEntry(exp) ? "+" : "-"} ₹ {parseFloat(exp.amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">{isCreditEntry(exp) ? "Added" : "Spent"}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-[#111318] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Monthly Summary</h3>
              <p className="text-xs text-white/40">Current view total and category breakdown.</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/35">Total</p>
              <p className="text-xl font-bold text-rose-400">₹ {totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/35">Entries</p>
              <p className="text-lg font-semibold text-white">{filteredExpenses.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/35">Top Category</p>
              <p className="text-lg font-semibold text-white">{categoryBreakdown[0]?.name || "None"}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {categoryBreakdown.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm text-white/70">
                <span>{item.name}</span>
                <span className="font-semibold text-white">₹ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111318] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Expense Distribution</h3>
              <p className="text-xs text-white/40">Category share by percentage.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div
              className="w-44 h-44 rounded-full shrink-0"
              style={{ background: `conic-gradient(${pieSegments.join(", ")})` }}
            />
            <div className="flex-1 w-full space-y-2">
              {categoryBreakdown.length > 0 ? categoryBreakdown.map((item, index) => {
                const percent = totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][index % 6] }} />
                      <span className="text-white/70">{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{percent}%</span>
                  </div>
                );
              }) : (
                <div className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">No expense data for the current filters.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111318] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Monthly Expense Trend</h3>
            <p className="text-xs text-white/40">Full year comparison.</p>
          </div>
        </div>
        <div className="flex items-end gap-2 h-56 mt-3 overflow-x-auto">
          {monthlyTrend.map((item) => (
            <div key={item.monthName} className="min-w-11 flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-44 rounded-2xl bg-white/5 p-2">
                <div
                  className="w-full rounded-xl bg-linear-to-t from-primary to-orange-400"
                  style={{ height: `${Math.max((item.monthValue / maxMonthlyValue) * 100, 6)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-[11px] text-white/40">{item.monthName}</p>
                <p className="text-sm font-semibold text-white">₹ {item.monthValue.toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default ExpensesPage;
