import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Save, RefreshCw, ArrowLeft, Loader2,
  AlertCircle, CheckCircle, DollarSign, Users, Briefcase
} from 'lucide-react';
import api from '../../api';

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const readOnlyFieldClass = 'w-full rounded-xl border border-white/5 bg-[#0a0c10] px-3 py-2.5 text-sm text-white/70 outline-none cursor-not-allowed';

const BLANK = {
  employee_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  basic_salary: '',
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
  const [formData, setFormData] = useState(BLANK);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch employees
  useEffect(() => {
    (async () => {
      setEmployeeLoading(true);
      try {
        const { data } = await api.get('/employees?limit=500&page=1');
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data);
        } else if (data.success && data.data?.rows) {
          setEmployees(data.data.rows);
        }
      } catch (err) {
        console.warn('Failed to load employees:', err);
      } finally {
        setEmployeeLoading(false);
      }
    })();
  }, []);

  // Fetch salary details when employee, month or year changes
  useEffect(() => {
    if (!formData.employee_id || !formData.month || !formData.year) return;
    
    const fetchDetails = async () => {
      setDetailsLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/salary/details?employee_id=${formData.employee_id}&month=${formData.month}&year=${formData.year}`);
        if (data.success) {
          const emp = data.data;
          
          const basic = parseFloat(emp.basic_salary) || 0;
          const leaveDays = parseInt(emp.leave_days) || 0;
          
          // Days in the selected month
          const daysInMonth = new Date(formData.year, formData.month, 0).getDate();
          
          // Calculate leave deduction based on days in month
          let lDeduct = 0;
          if (basic > 0 && leaveDays > 0) {
            lDeduct = parseFloat(((basic / daysInMonth) * leaveDays).toFixed(2));
          }

          setFormData(prev => ({
            ...prev,
            basic_salary: basic,
            leave_days: leaveDays,
            leave_deduction: lDeduct,
            bank_name: emp.bank_name || '',
            account_number: emp.account_number || '',
            ifsc_code: emp.ifsc_code || '',
            upi_id: emp.upi_id || ''
          }));
        } else {
          throw new Error(data.message || 'Failed to fetch details');
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Error fetching employee details');
      } finally {
        setDetailsLoading(false);
      }
    };
    
    fetchDetails();
  }, [formData.employee_id, formData.month, formData.year]);

  // Recalculate total salary whenever relevant fields change
  useEffect(() => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const lDeduct = parseFloat(formData.leave_deduction) || 0;
    
    const incPercent = parseFloat(formData.incentive_percentage) || 0;
    let incAmount = 0;
    if (incPercent > 0) {
        incAmount = parseFloat(((basic * incPercent) / 100).toFixed(2));
    }
    
    const addDeduct = parseFloat(formData.additional_deduction) || 0;
    
    const total = parseFloat((basic - lDeduct + incAmount - addDeduct).toFixed(2));
    
    setFormData(prev => ({
      ...prev,
      incentive_amount: incAmount,
      total_salary: total > 0 ? total : 0
    }));
  }, [formData.basic_salary, formData.leave_deduction, formData.incentive_percentage, formData.additional_deduction]);

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
        leave_days: parseInt(formData.leave_days) || 0,
        leave_deduction: parseFloat(formData.leave_deduction) || 0,
        incentive_percentage: parseFloat(formData.incentive_percentage) || 0,
        incentive_amount: parseFloat(formData.incentive_amount) || 0,
        additional_deduction: parseFloat(formData.additional_deduction) || 0,
        total_salary: parseFloat(formData.total_salary) || 0
      };

      const res = await api.post('/salary/pay', payload);
      if (!res.data.success) throw new Error(res.data.message || 'Payment failed');
      
      setSuccess('Salary paid successfully and recorded in expenses!');
      setTimeout(() => navigate('/admin/expenses'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to pay salary');
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
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <DollarSign size={11} /> Salary Management
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Salary</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Calculate and process monthly salary for an employee.
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
        
        {/* Selection Details */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><Users size={15} className="text-blue-400" /></div>
            <h2 className="text-base font-bold text-white">Select Details</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Employee *</span>
              <select className={fieldClass} name="employee_id" value={formData.employee_id} onChange={handleChange} required>
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
              <select className={fieldClass} name="month" value={formData.month} onChange={handleChange} required>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </label>
            
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Year *</span>
              <select className={fieldClass} name="year" value={formData.year} onChange={handleChange} required>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </div>
          {detailsLoading && <p className="mt-4 text-xs text-orange-400 animate-pulse">Loading employee salary details...</p>}
        </section>

        {/* Calculation */}
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
            
            <div className="grid gap-4 grid-cols-2">
                <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Leave Days</span>
                <input className={readOnlyFieldClass} type="number" readOnly value={formData.leave_days} />
                </label>
                
                <label className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">Leave Deduction (₹)</span>
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
            </label>
          </div>
        </section>

        {/* Bank Details */}
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

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading || !formData.employee_id}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
            {loading ? 'Processing...' : 'Pay Salary'}
          </button>
          
          <button type="button" onClick={() => setFormData(BLANK)} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
            <RefreshCw size={15} /> Reset
          </button>
          
          <button type="button" onClick={() => navigate('/admin/expenses')} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
            <ArrowLeft size={15} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
