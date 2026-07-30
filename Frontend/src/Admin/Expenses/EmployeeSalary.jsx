import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Save, RefreshCw, ArrowLeft, Loader2,
  AlertCircle, CheckCircle, DollarSign, Users, Briefcase,
  History, Printer, X, Edit, Trash2, Search, Plus
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';
import { useReactToPrint } from "react-to-print";

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const readOnlyFieldClass = 'w-full rounded-xl border border-white/5 bg-[#0a0c10] px-3 py-2.5 text-sm text-white/70 outline-none cursor-not-allowed';

const BLANK = {
  employee_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  basic_salary: '',
  present_days: 0,
  leave_days: 0,
  leave_deduction: 0,
  incentive_percentage: '',
  incentive_amount: 0,
  additional_deduction: '',
  total_salary: 0,
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: ''
};

export default function EmployeeSalary() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(BLANK);
  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editId, setEditId] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [historyMonthFilter, setHistoryMonthFilter] = useState('all');
  const [historyYearFilter, setHistoryYearFilter] = useState(String(new Date().getFullYear()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const payslipRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: payslipRef,
    documentTitle: selectedPayslip
      ? `Payslip_${selectedPayslip.first_name}_${selectedPayslip.salary_month}_${selectedPayslip.salary_year}`
      : "Payslip",
  });

  // Fetch employees & history on mount
  useEffect(() => {
    (async () => {
      setEmployeeLoading(true);
      try {
        const { data } = await api.get('/employees?limit=500&page=1');
        if (data.data && Array.isArray(data.data)) setEmployees(data.data);
        else if (data.data?.rows) setEmployees(data.data.rows);
        else if (Array.isArray(data)) setEmployees(data);
      } catch (err) {
        console.warn('Failed to load employees:', err);
      } finally {
        setEmployeeLoading(false);
      }
    })();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/salary/history');
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch salary history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch salary details when employee, month or year changes
  useEffect(() => {
    if (!formData.employee_id || !formData.month || !formData.year || editId) return; // skip if editing

    const fetchDetails = async () => {
      setDetailsLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/salary/details?employee_id=${formData.employee_id}&month=${formData.month}&year=${formData.year}`);
        if (data.success) {
          const emp = data.data;

          const basic = parseFloat(emp.basic_salary) || 0;
          const leaveDays = parseInt(emp.leave_days) || 0;
          const presentDays = parseInt(emp.present_days) || 0;
          const alreadyPaid = emp.alreadyPaid || false;

          const daysInMonth = new Date(formData.year, formData.month, 0).getDate();

          let lDeduct = 0;
          if (basic > 0 && leaveDays > 0) {
            lDeduct = parseFloat(((basic / daysInMonth) * leaveDays).toFixed(2));
          }

          if (alreadyPaid) {
            setError(`Salary has already been paid for this employee for ${new Date(0, formData.month - 1).toLocaleString('default', { month: 'long' })} ${formData.year}.`);
          }

          setFormData(prev => ({
            ...prev,
            basic_salary: basic,
            leave_days: leaveDays,
            present_days: presentDays,
            leave_deduction: lDeduct,
            alreadyPaid: alreadyPaid,
            bank_name: emp.bank_name || '',
            account_number: emp.account_number || '',
            ifsc_code: emp.ifsc_code || '',
            upi_id: emp.upi_id || ''
          }));
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Error fetching employee details');
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [formData.employee_id, formData.month, formData.year, editId]);

  // Recalculate total salary whenever relevant fields change
  useEffect(() => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const lDeduct = parseFloat(formData.leave_deduction) || 0;
    const pDays = parseInt(formData.present_days) || 0;
    const lDays = parseInt(formData.leave_days) || 0;

    const incPercent = parseFloat(formData.incentive_percentage) || 0;
    let incAmount = 0;
    if (incPercent > 0) {
      incAmount = parseFloat(((basic * incPercent) / 100).toFixed(2));
    }

    const addDeduct = parseFloat(formData.additional_deduction) || 0;

    const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
    let earnedBasic = 0;
    if (basic > 0 && pDays > 0) {
      earnedBasic = parseFloat(((basic / daysInMonth) * pDays).toFixed(2));
    }

    // Total is calculated purely from earnedBasic (based on present days) + incentives - additional.
    // We ignore lDeduct here since leave days naturally deduct from the earned basic.
    const total = parseFloat((earnedBasic + incAmount - addDeduct).toFixed(2));

    setFormData(prev => ({
      ...prev,
      incentive_amount: incAmount,
      total_salary: total > 0 ? total : 0
    }));
  }, [formData.basic_salary, formData.present_days, formData.month, formData.year, formData.incentive_percentage, formData.additional_deduction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee_id) { setError('Please select an employee'); return; }
    if (formData.total_salary <= 0) { setError('Total salary must be greater than 0'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        employee_id: formData.employee_id,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        basic_salary: parseFloat(formData.basic_salary) || 0,
        present_days: parseInt(formData.present_days) || 0,
        leave_days: parseInt(formData.leave_days) || 0,
        leave_deduction: parseFloat(formData.leave_deduction) || 0,
        incentive_percentage: parseFloat(formData.incentive_percentage) || 0,
        incentive_amount: parseFloat(formData.incentive_amount) || 0,
        additional_deduction: parseFloat(formData.additional_deduction) || 0,
        total_salary: parseFloat(formData.total_salary) || 0,
        updated_by: user?.user_id
      };

      let res;
      if (editId) {
        res = await api.put(`/salary/pay/${editId}`, payload);
      } else {
        res = await api.post('/salary/pay', payload);
      }

      if (!res.data.success) throw new Error(res.data.message || 'Payment failed');

      setSuccess(`Salary ${editId ? 'updated' : 'paid'} successfully!`);
      fetchHistory(); // refresh table
      resetForm();
      setShowForm(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to pay salary');
    } finally { setLoading(false); }
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setShowForm(true);
    setFormData({
      employee_id: record.employee_id,
      month: record.salary_month,
      year: record.salary_year,
      basic_salary: record.basic_salary,
      present_days: record.present_days,
      leave_days: record.leave_days,
      leave_deduction: record.leave_deduction,
      incentive_percentage: record.incentive_percentage,
      incentive_amount: record.incentive_amount,
      additional_deduction: record.additional_deduction,
      total_salary: record.total_salary,
      alreadyPaid: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Are you sure you want to delete this salary record? This will add the funds back to the company.")) return;
    try {
      const res = await api.delete(`/salary/pay/${record.id}`, { data: { updated_by: user?.user_id } });
      if (res.data.success) {
        setSuccess("Salary record deleted.");
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
    setShowForm(false);
    setFormData(BLANK);
    setError('');
  };

  const filteredEmployees = useMemo(() => {
    const search = employeeSearch.trim().toLowerCase();
    return employees.filter((emp) => {
      if (!search) return true;
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const code = (emp.employee_code || '').toLowerCase();
      return fullName.includes(search) || code.includes(search);
    });
  }, [employees, employeeSearch]);

  const filteredSalaryHistory = useMemo(() => {
    return history.filter((record) => {
      const employee = employees.find((item) => item.employee_id === record.employee_id);
      const fullName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.toLowerCase();
      const code = (employee?.employee_code || '').toLowerCase();
      const search = employeeSearch.trim().toLowerCase();
      const matchesSearch = !search || fullName.includes(search) || code.includes(search);
      const matchesMonth = historyMonthFilter === 'all' || Number(record.salary_month) === Number(historyMonthFilter);
      const matchesYear = historyYearFilter === 'all' || Number(record.salary_year) === Number(historyYearFilter);
      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [history, employees, employeeSearch, historyMonthFilter, historyYearFilter]);

  const selectedEmployeeHistory = useMemo(() => {
    if (!selectedEmployeeId) return filteredSalaryHistory;
    return filteredSalaryHistory.filter((record) => record.employee_id === selectedEmployeeId);
  }, [filteredSalaryHistory, selectedEmployeeId]);

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Left Side */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/admin/expenses")}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition shrink-0 mt-1"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <DollarSign size={11} />
              Salary Management
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Employee Salary
            </h1>

            <p className="text-sm text-white/40 mt-0.5">
              Calculate, process monthly salaries, and print payslips.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setError("");
              setSuccess("");
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 self-start"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          <Plus size={15} />
          {showForm ? "Close Form" : "Record Payment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="space-y-6">
          <section className={sectionClass}>
            <div className="mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><Users size={15} className="text-blue-400" /></div>
              <h2 className="text-base font-bold text-white">{editId ? 'Edit Details' : 'Select Details'}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Employee *</span>
                <select className={editId ? readOnlyFieldClass : fieldClass} name="employee_id" value={formData.employee_id} onChange={handleChange} required disabled={editId}>
                  <option value="">Select Employee</option>
                  {employeeLoading ? (
                    <option value="">Loading...</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_code || 'No Code'})
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Month *</span>
                <select className={editId ? readOnlyFieldClass : fieldClass} name="month" value={formData.month} onChange={handleChange} required disabled={editId}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Year *</span>
                <select className={editId ? readOnlyFieldClass : fieldClass} name="year" value={formData.year} onChange={handleChange} required disabled={editId}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            {detailsLoading && <p className="mt-4 text-xs text-orange-400 animate-pulse">Loading employee salary details...</p>}
          </section>

          <section className={sectionClass}>
            <div className="mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><DollarSign size={15} className="text-orange-400" /></div>
              <h2 className="text-base font-bold text-white">Salary Calculation</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Basic Salary (₹)</span>
                <input className={readOnlyFieldClass} type="number" readOnly value={formData.basic_salary} />
              </label>

              <div className="grid gap-4 grid-cols-3">
                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Present Days</span>
                  <input className={readOnlyFieldClass} type="number" readOnly value={formData.present_days} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Leave Days</span>
                  <input className={readOnlyFieldClass} type="number" readOnly value={formData.leave_days} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Leave Deduct (₹)</span>
                  <input className={readOnlyFieldClass} type="number" readOnly value={formData.leave_deduction} />
                </label>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Incentive (%)</span>
                  <input className={fieldClass} type="number" name="incentive_percentage" min="0" max="100" step="0.01" placeholder="0" value={formData.incentive_percentage} onChange={handleChange} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Incentive Amount (₹)</span>
                  <input className={readOnlyFieldClass} type="number" readOnly value={formData.incentive_amount} />
                </label>
              </div>

              <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Additional Deduction (₹)</span>
                <input className={fieldClass} type="number" name="additional_deduction" min="0" step="0.01" placeholder="0" value={formData.additional_deduction} onChange={handleChange} />
              </label>

              <label className="text-sm text-emerald-400 md:col-span-2">
                <span className="mb-1.5 block font-bold text-lg">Total Calculated Salary (₹)</span>
                <input className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xl font-bold text-emerald-400 outline-none" type="number" readOnly value={formData.total_salary} />
                {(formData.present_days === 0 && formData.leave_days === 0) && (
                  <p className="mt-2 text-xs text-rose-400">Warning: Attendance not marked for this month. Calculated salary is ₹0.</p>
                )}
              </label>
            </div>
          </section>

          {!editId && (
            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center"><Briefcase size={15} className="text-violet-400" /></div>
                <h2 className="text-base font-bold text-white">Bank Details</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Bank Name</span>
                  <input className={readOnlyFieldClass} type="text" readOnly value={formData.bank_name || 'Not provided'} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">Account Number</span>
                  <input className={readOnlyFieldClass} type="text" readOnly value={formData.account_number || 'Not provided'} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">IFSC Code</span>
                  <input className={readOnlyFieldClass} type="text" readOnly value={formData.ifsc_code || 'Not provided'} />
                </label>

                <label className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">UPI ID</span>
                  <input className={readOnlyFieldClass} type="text" readOnly value={formData.upi_id || 'Not provided'} />
                </label>
              </div>
            </section>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={resetForm} disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition">
              {editId ? 'Cancel' : 'Reset'}
            </button>

            <button type="submit" disabled={loading || !formData.employee_id || formData.total_salary <= 0 || (formData.alreadyPaid && !editId)}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
              {loading ? 'Processing...' : (editId ? 'Update Salary' : 'Pay Salary')}
            </button>
          </div>
        </form>
      )}

      <section className={sectionClass}>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">
              <Users size={11} /> Employee Overview
            </div>
            <h2 className="text-base font-bold text-white">Employee cards & salary history</h2>
            <p className="text-sm text-white/40 mt-0.5">Search employees, filter by month/year, and open a card to review that employee&apos;s salary records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Search employee"
                className="w-48 rounded-xl border border-white/10 bg-[#0e1118] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/70"
              />
            </div>
            <select value={historyMonthFilter} onChange={(e) => setHistoryMonthFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/70">
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select value={historyYearFilter} onChange={(e) => setHistoryYearFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500/70">
              <option value="all">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">No employees match this search.</div>
          ) : (
            filteredEmployees.map((emp) => {
              const employeeName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
              const employeeHistory = history.filter((item) => item.employee_id === emp.employee_id);
              const totalPaid = employeeHistory.reduce((sum, item) => sum + parseFloat(item.total_salary || 0), 0);
              const isActive = selectedEmployeeId === emp.employee_id;
              return (
                <button
                  key={emp.employee_id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.employee_id)}
                  className={`rounded-2xl border p-4 text-left transition ${isActive ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{employeeName || emp.employee_code || 'Unnamed Employee'}</p>
                      <p className="text-xs text-white/40">{emp.employee_code || 'No code'}</p>
                    </div>
                    <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/60">{employeeHistory.length} pays</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/50">Total salary</span>
                    <span className="font-semibold text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0e1118] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Salary history {selectedEmployeeId ? 'for selected employee' : 'for current filters'}</h3>
            <span className="text-xs text-white/40">{selectedEmployeeHistory.length} record(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/40">
                <tr>
                  <th className="px-3 py-2 text-left">Employee</th>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Total Salary</th>
                  <th className="px-3 py-2 text-left">Present / Leave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/70">
                {selectedEmployeeHistory.length === 0 ? (
                  <tr><td colSpan="5" className="px-3 py-4 text-center text-white/40">No salary records found.</td></tr>
                ) : (
                  selectedEmployeeHistory.map((record) => {
                    const emp = employees.find((item) => item.employee_id === record.employee_id);
                    const employeeLabel = `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim() || emp?.employee_code || 'Unknown';
                    return (
                      <tr key={record.id} className="hover:bg-white/5">
                        <td className="px-3 py-2 font-medium text-white">{employeeLabel}</td>
                        <td className="px-3 py-2">{new Date(0, Number(record.salary_month) - 1).toLocaleString('default', { month: 'long' })}</td>
                        <td className="px-3 py-2">{record.salary_year}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-400">₹{parseFloat(record.total_salary || 0).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2">{record.present_days}/{record.leave_days}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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

      {/* Salary History Table */}
      <section className={`${sectionClass} mt-10`}>
        <div className="mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center"><History size={15} className="text-pink-400" /></div>
          <h2 className="text-base font-bold text-white">Salary History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Basic (₹)</th>
                <th className="px-4 py-3 font-medium">Net Salary (₹)</th>
                <th className="px-4 py-3 font-medium">Paid On</th>
                <th className="px-4 py-3 rounded-r-lg font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyLoading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-white/40">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-white/40">No salary records found.</td></tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{record.first_name} {record.last_name}</div>
                      <div className="text-xs opacity-60">{record.employee_code}</div>
                    </td>
                    <td className="px-4 py-3">{new Date(0, record.salary_month - 1).toLocaleString('default', { month: 'short' })} {record.salary_year}</td>
                    <td className="px-4 py-3">{parseFloat(record.basic_salary).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{parseFloat(record.total_salary).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedPayslip(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition"
                          title="Payslip"
                        >
                          <Printer size={13} /> Payslip
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

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Payslip Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition shadow-sm"
                >
                  <Printer size={15} />
                  Print
                </button>
                <button onClick={() => setSelectedPayslip(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 overflow-y-auto bg-white text-gray-800" ref={payslipRef}>
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Q-Techx Solutions</h1>
                  <p className="text-sm text-gray-500 mt-1">123 Tech Avenue, Innovation Park</p>
                  <p className="text-sm text-gray-500">City, State, ZIP</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-orange-600 uppercase tracking-widest">Payslip</h2>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {new Date(0, selectedPayslip.salary_month - 1).toLocaleString('default', { month: 'long' })} {selectedPayslip.salary_year}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Employee Name</span>
                  <span className="font-bold text-base">{selectedPayslip.first_name} {selectedPayslip.last_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Employee ID</span>
                  <span className="font-bold text-base">{selectedPayslip.employee_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Present Days</span>
                  <span className="font-semibold">{selectedPayslip.present_days}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Leave Days</span>
                  <span className="font-semibold">{selectedPayslip.leave_days}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Earnings */}
                <div>
                  <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">EARNINGS</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-medium">₹{parseFloat(selectedPayslip.basic_salary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Incentive ({selectedPayslip.incentive_percentage}%)</span>
                    <span className="font-medium">₹{parseFloat(selectedPayslip.incentive_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">DEDUCTIONS</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Leave Deduction</span>
                    <span className="font-medium">₹{parseFloat(selectedPayslip.leave_deduction).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Other Deductions</span>
                    <span className="font-medium">₹{parseFloat(selectedPayslip.additional_deduction).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-700 text-lg">Net Pay</span>
                <span className="font-black text-2xl text-orange-700">₹{parseFloat(selectedPayslip.total_salary).toLocaleString('en-IN')}</span>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <span className="text-xs text-gray-500 font-medium">Employer Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <span className="text-xs text-gray-500 font-medium">Employee Signature</span>
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
