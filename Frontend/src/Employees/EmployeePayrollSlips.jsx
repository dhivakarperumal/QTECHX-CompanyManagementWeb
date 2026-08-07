import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Printer, X, Loader2, FileText, AlertCircle, Search, LayoutGrid, List } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import { useReactToPrint } from "react-to-print";
import { Link } from 'react-router-dom';
import Select from 'react-select';
import PayslipTemplate from '../Componets/PayslipTemplate';
import ModalPortal from '../Componets/CommonComponents/ModalPortal';

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
      const possibleIds = [user?.employee_id, user?.employeeId, user?.user_id, user?.userId, user?.id, user?._id, user?.uuid].filter(Boolean).map(String);
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
          <div className="w-44 z-20">
            <Select
              value={{
                value: monthFilter,
                label: monthFilter === 'all' ? 'All Months' : new Date(0, monthFilter - 1).toLocaleString("default", { month: "long" })
              }}
              onChange={(option) => setMonthFilter(option ? option.value : 'all')}
              options={[
                { value: 'all', label: 'All Months' },
                ...Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
                  value: month,
                  label: new Date(0, month - 1).toLocaleString("default", { month: "long" })
                }))
              ]}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {/* Year */}
          <div className="w-32 z-10">
            <Select
              value={{ value: yearFilter, label: yearFilter === 'all' ? 'All Years' : yearFilter }}
              onChange={(option) => setYearFilter(option ? option.value : 'all')}
              options={[
                { value: 'all', label: 'All Years' },
                ...Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => ({
                  value: year,
                  label: year
                }))
              ]}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
          
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
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
              <div className="bg-[#f8fafc] overflow-y-auto" ref={payslipRef}>
                <PayslipTemplate payslip={selectedPayslip} />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default EmployeePayrollSlips;
