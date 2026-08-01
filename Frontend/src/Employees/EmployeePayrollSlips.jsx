import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Printer, X, Loader2, FileText, AlertCircle, Search, LayoutGrid, List } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import { useReactToPrint } from "react-to-print";
import { Link } from 'react-router-dom';

const EmployeePayrollSlips = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const payslipRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: payslipRef,
    documentTitle: selectedPayslip
      ? `Payslip_${selectedPayslip.first_name}_${selectedPayslip.salary_month}_${selectedPayslip.salary_year}`
      : "Payslip",
  });

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const possibleIds = [user?.id, user?._id, user?.userId, user?.employee_id, user?.employeeId, user?.user_id, user?.uuid].filter(Boolean).map(String);
      if (possibleIds.length === 0) {
        setError('Employee ID not found in profile.');
        setLoading(false);
        return;
      }

      const res = await api.get('/salary/history');
      if (res.data && res.data.success) {
        const allHistory = res.data.data;
        const myHistory = allHistory.filter(r => possibleIds.includes(String(r.employee_id)));
        myHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistory(myHistory);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch salary slips.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/30">
            <FileText size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              My Payroll Slips
            </h1>
            <p className="text-xs text-white/50">
              View and print your monthly payslips
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/employee/payroll"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/20 transition border border-orange-500/30"
          >
            View Full History
          </Link>
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-60 rounded-xl border border-white/10 bg-[#0e1118] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500"
            />
          </div>

          {/* Month */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          >
            <option value="all">All Months</option>

            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          >
            <option value="all">All Years</option>

            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          {/* View Toggle */}
          <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
        {(() => {
          const filteredHistory = history.filter(record => {
            const recordMonth = new Date(0, record.salary_month - 1).toLocaleString('default', { month: 'long' }).toLowerCase();
            const searchMatch = !search ||
              recordMonth.includes(search.toLowerCase()) ||
              String(record.salary_year).includes(search) ||
              String(record.total_salary).includes(search);
            const monthMatch = monthFilter === 'all' || Number(record.salary_month) === Number(monthFilter);
            const yearMatch = yearFilter === 'all' || Number(record.salary_year) === Number(yearFilter);
            return searchMatch && monthMatch && yearMatch;
          });

          return loading ? (
            <div className="flex justify-center items-center h-48 text-white/50">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-48 text-rose-400">
              <AlertCircle size={24} className="mr-2" /> {error}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/50">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No payslips found for the selected filters.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 text-white/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Month & Year</th>
                    <th className="px-4 py-3 font-medium">Basic (₹)</th>
                    <th className="px-4 py-3 font-medium">Net Salary (₹)</th>
                    <th className="px-4 py-3 font-medium">Credited On</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        {new Date(0, record.salary_month - 1).toLocaleString('default', { month: 'long' })} {record.salary_year}
                      </td>
                      <td className="px-4 py-3">{parseFloat(record.basic_salary).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{parseFloat(record.total_salary).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">{new Date(record.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedPayslip(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition"
                        >
                          <Printer size={13} /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((record) => (
                <div key={record.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">{new Date(0, record.salary_month - 1).toLocaleString('default', { month: 'long' })} {record.salary_year}</h3>
                      <p className="text-xs text-white/50">Credited: {new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPayslip(record)}
                      className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 mb-3 border-t border-white/5 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Basic Salary</span>
                      <span className="text-white font-medium">₹{parseFloat(record.basic_salary).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Net Salary</span>
                      <span className="text-emerald-400 font-bold">₹{parseFloat(record.total_salary).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

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
};

export default EmployeePayrollSlips;
