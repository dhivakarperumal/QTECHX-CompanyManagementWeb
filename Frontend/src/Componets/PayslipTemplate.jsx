import React from 'react';
import { 
  MapPin, Mail, Phone, Globe, 
  ReceiptText, CalendarDays, WalletCards, CreditCard, ShieldCheck, Contact2,
  Wallet, FileMinus, Landmark, Banknote, CalendarCheck
} from 'lucide-react';
import dayjs from 'dayjs';

const PayslipTemplate = ({ payslip }) => {
  if (!payslip) return null;

  const monthName = new Date(0, (payslip.salary_month || dayjs().month() + 1) - 1).toLocaleString('default', { month: 'long' });
  const year = payslip.salary_year || dayjs().year();
  const formatCurrency = (val) => parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Calculations based on available data in selectedPayslip
  const basicSalary = parseFloat(payslip.basic_salary || 0);
  const hra = parseFloat(payslip.hra || 0);
  const specialAllowance = parseFloat(payslip.special_allowance || 0);
  const incentiveAmount = parseFloat(payslip.incentive_amount || 0);
  
  const totalEarnings = basicSalary + hra + specialAllowance + incentiveAmount;
  
  const pf = parseFloat(payslip.provident_fund || 0);
  const profTax = parseFloat(payslip.professional_tax || 0);
  const leaveDeduction = parseFloat(payslip.leave_deduction || 0);
  const otherDeduction = parseFloat(payslip.additional_deduction || 0);
  
  const totalDeductions = pf + profTax + leaveDeduction + otherDeduction;
  const netPay = parseFloat(payslip.total_salary || totalEarnings - totalDeductions);
  const grossSalary = netPay + totalDeductions;

  return (
    <div className="bg-white text-[#1e293b] font-sans mx-auto max-w-4xl border-l-[12px] border-l-[#1d4ed8] relative">
      {/* Top Header */}
      <div className="flex justify-between items-start p-8 pb-4">
        {/* Left: Company Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#1d4ed8] rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              Q
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a] leading-tight">Q-Techx Solutions</h1>
              <p className="text-[#3b82f6] text-xs font-medium tracking-wide">Innovate. Develop. Deliver.</p>
            </div>
          </div>
          
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex gap-2">
              <MapPin size={14} className="text-[#1d4ed8] shrink-0 mt-0.5" />
              <span>123, Tech Park, Coimbatore,<br/>Tamil Nadu - 641 014, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[#1d4ed8] shrink-0" />
              <span>hr@qtechx.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#1d4ed8] shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#1d4ed8] shrink-0" />
              <span>www.qtechx.com</span>
            </div>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center pt-2">
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tight mb-2">PAY SLIP</h2>
          <div className="flex items-center justify-center gap-2 text-[#2563eb] font-bold text-sm">
            <span className="w-8 h-px bg-[#2563eb]/30"></span>
            <span className="uppercase tracking-widest">{monthName} {year}</span>
            <span className="w-8 h-px bg-[#2563eb]/30"></span>
          </div>
        </div>

        {/* Right: Slip Info */}
        <div className="flex-1 flex justify-end">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <ReceiptText size={14} className="text-[#1d4ed8]" />
                <span>Payslip No</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: QTX/{monthName.substring(0,3).toUpperCase()}/{year}/{payslip.employee_code?.substring(3) || '000'}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <CalendarDays size={14} className="text-[#1d4ed8]" />
                <span>Pay Date</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: {dayjs().endOf('month').format('DD MMMM YYYY')}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <WalletCards size={14} className="text-[#1d4ed8]" />
                <span>Payment Mode</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: Bank Transfer</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <CreditCard size={14} className="text-[#1d4ed8]" />
                <span>PAN</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: {payslip.pan_number || 'ABCDE1234F'}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <ShieldCheck size={14} className="text-[#1d4ed8]" />
                <span>PF No</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: {payslip.pf_number || 'TN/12345/000/0000'}</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 w-24">
                <Contact2 size={14} className="text-[#1d4ed8]" />
                <span>UAN</span>
              </div>
              <div className="font-semibold text-gray-800 flex-1">: {payslip.uan_number || '101234567890'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-4">
        {/* Details Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Employee Details */}
          <div className="border border-blue-100 rounded-xl bg-gray-50/50 p-4 relative pt-6 mt-3">
            <div className="absolute -top-3 left-4 bg-[#1e40af] text-white text-[10px] font-bold px-3 py-1 rounded">
              EMPLOYEE DETAILS
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Employee ID</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.employee_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Employee Name</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.first_name} {payslip.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Designation</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.designation || 'Developer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Department</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.department || 'Engineering'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Date of Joining</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.date_of_joining ? dayjs(payslip.date_of_joining).format('DD MMM YYYY') : '01 Jan 2024'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Work Location</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.location || 'Coimbatore'}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border border-blue-100 rounded-xl bg-gray-50/50 p-4 relative pt-6 mt-3">
            <div className="absolute -top-3 left-4 bg-[#1e40af] text-white text-[10px] font-bold px-3 py-1 rounded">
              BANK DETAILS
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Bank Name</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.bank_name || 'State Bank of India'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Account No</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.account_number || '1234 5678 9012'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">IFSC Code</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.ifsc_code || 'SBIN0001234'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 w-28">Account Holder</span>
                <span className="font-medium text-gray-800 flex-1">: {payslip.first_name} {payslip.last_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="border border-green-100 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-3 bg-white border-b border-green-100">
              <Wallet size={18} className="text-green-600" />
              <h3 className="font-bold text-green-700 text-sm">EARNINGS</h3>
            </div>
            <div className="flex justify-between px-4 py-2 bg-green-50/50 text-[10px] font-bold text-green-800 border-b border-green-100">
              <span>DESCRIPTION</span>
              <span>AMOUNT (₹)</span>
            </div>
            <div className="flex-1 p-4 space-y-3 text-xs bg-white">
              <div className="flex justify-between">
                <span className="text-gray-700">Basic Salary</span>
                <span className="font-medium text-gray-900">{formatCurrency(basicSalary)}</span>
              </div>
              {hra > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">House Rent Allowance (HRA)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(hra)}</span>
                </div>
              )}
              {specialAllowance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Special Allowance</span>
                  <span className="font-medium text-gray-900">{formatCurrency(specialAllowance)}</span>
                </div>
              )}
              {incentiveAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Incentive ({payslip.incentive_percentage || 0}%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(incentiveAmount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50/80 border-t border-green-200">
              <span className="font-bold text-green-800 text-xs">TOTAL EARNINGS</span>
              <span className="font-black text-green-900 text-sm">₹ {formatCurrency(totalEarnings)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-red-100 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-3 bg-white border-b border-red-100">
              <FileMinus size={18} className="text-red-600" />
              <h3 className="font-bold text-red-700 text-sm">DEDUCTIONS</h3>
            </div>
            <div className="flex justify-between px-4 py-2 bg-red-50/50 text-[10px] font-bold text-red-800 border-b border-red-100">
              <span>DESCRIPTION</span>
              <span>AMOUNT (₹)</span>
            </div>
            <div className="flex-1 p-4 space-y-3 text-xs bg-white">
              <div className="flex justify-between">
                <span className="text-gray-700">Leave Deduction</span>
                <span className="font-medium text-gray-900">{formatCurrency(leaveDeduction)}</span>
              </div>
              {pf > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Provident Fund (PF)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(pf)}</span>
                </div>
              )}
              {profTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Professional Tax</span>
                  <span className="font-medium text-gray-900">{formatCurrency(profTax)}</span>
                </div>
              )}
              {otherDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Other Deduction</span>
                  <span className="font-medium text-gray-900">{formatCurrency(otherDeduction)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50/80 border-t border-red-200">
              <span className="font-bold text-red-800 text-xs">TOTAL DEDUCTIONS</span>
              <span className="font-black text-red-900 text-sm">₹ {formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Payable Banner */}
        <div className="border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1d4ed8] rounded-xl flex items-center justify-center text-white shrink-0">
              <Landmark size={28} />
            </div>
            <div>
              <div className="text-[#1d4ed8] font-bold text-xs mb-0.5">NET PAYABLE</div>
              <div className="text-2xl font-black text-[#0f172a]">₹ {formatCurrency(netPay)}</div>
              <div className="text-[10px] text-gray-500 italic mt-0.5">(Rupees {netPay} Only)</div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-gray-500 text-[10px] font-bold mb-1">GROSS SALARY</div>
              <div className="font-bold text-sm text-gray-800">₹ {formatCurrency(grossSalary)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-[10px] font-bold mb-1">TOTAL DEDUCTIONS</div>
              <div className="font-bold text-sm text-gray-800">₹ {formatCurrency(totalDeductions)}</div>
            </div>
            <div className="bg-[#0f172a] text-white rounded-lg px-6 py-3 text-center">
              <div className="text-[10px] font-bold text-blue-200 mb-0.5">NET PAY</div>
              <div className="font-black text-lg">₹ {formatCurrency(netPay)}</div>
            </div>
          </div>
        </div>

        {/* YTD & Attendance */}
        <div className="grid grid-cols-2 gap-4">
          {/* Payment Summary YTD */}
          <div className="border border-blue-100 rounded-xl overflow-hidden bg-gray-50/30">
            <div className="flex items-center gap-2 p-3 border-b border-blue-100 bg-white">
              <Banknote size={16} className="text-[#1d4ed8]" />
              <h3 className="font-bold text-[#1d4ed8] text-xs">PAYMENT SUMMARY (YTD)</h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Earnings (YTD)</span>
                <span className="font-bold">₹ {formatCurrency(totalEarnings * 7)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Deductions (YTD)</span>
                <span className="font-bold">₹ {formatCurrency(totalDeductions * 7)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Net Payable (YTD)</span>
                <span className="font-bold">₹ {formatCurrency(netPay * 7)}</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="border border-blue-100 rounded-xl overflow-hidden bg-gray-50/30">
            <div className="flex items-center gap-2 p-3 border-b border-blue-100 bg-white">
              <CalendarCheck size={16} className="text-[#1d4ed8]" />
              <h3 className="font-bold text-[#1d4ed8] text-xs">ATTENDANCE SUMMARY</h3>
            </div>
            <div className="p-4 flex justify-between items-center h-[calc(100%-45px)] text-center">
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-medium mb-2">Total Working Days</div>
                <div className="font-bold text-base">{payslip.present_days + payslip.leave_days || 26}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-medium mb-2">Days Present</div>
                <div className="font-bold text-base">{payslip.present_days || 26}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-medium mb-2">Leaves Taken</div>
                <div className="font-bold text-base">{payslip.leave_days || 0}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-medium mb-2">Paid Days</div>
                <div className="font-bold text-base">{payslip.present_days || 26}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end pt-8">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1d4ed8] shrink-0 mt-1">
              <span className="font-serif text-xl font-bold leading-none">"</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Thank you for your dedication and hard work!</p>
              <p className="text-[10px] text-gray-500 mt-1">This is a system generated payslip & does not require signature.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-signature text-3xl text-[#1d4ed8] mb-1 italic" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>Regards,</div>
            <div className="text-xs font-bold text-[#0f172a]">Human Resources</div>
            <div className="text-[10px] text-gray-500">Q-Techx Solutions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipTemplate;
