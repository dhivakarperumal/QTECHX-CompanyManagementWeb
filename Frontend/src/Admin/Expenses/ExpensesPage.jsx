import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const ExpensesPage = () => {
  const [fund, setFund] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showFundForm, setShowFundForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

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
    try {
      const { data } = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses", error);
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
        toast.success("Fund updated successfully");
        setFund(data.available_fund);
        setShowFundForm(false);
        setFundAmount("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating fund");
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
        toast.success("Expense added successfully");
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
      toast.error(error.response?.data?.message || "Error adding expense");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Expenses Management</h1>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700">Available Fund</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹ {parseFloat(fund).toFixed(2)}</p>
          <button 
            onClick={() => setShowFundForm(!showFundForm)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {showFundForm ? "Cancel" : "Update Fund"}
          </button>
          
          {showFundForm && (
            <form onSubmit={handleUpdateFund} className="mt-4 flex gap-2">
              <input 
                type="number" 
                step="0.01"
                placeholder="Enter new fund amount" 
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
            </form>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 flex flex-col justify-center items-start">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Actions</h2>
          <button 
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
          >
            {showExpenseForm ? "Cancel Adding Expense" : "+ Add New Expense"}
          </button>
        </div>
      </div>

      {/* Expense Form */}
      {showExpenseForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Add Expense</h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Expense Type</label>
              <input type="text" className="w-full border p-2 rounded mt-1" required 
                value={expenseData.expense_type} onChange={(e) => setExpenseData({...expenseData, expense_type: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-700">Date of Payment</label>
              <input type="date" className="w-full border p-2 rounded mt-1" required 
                value={expenseData.date_of_payment} onChange={(e) => setExpenseData({...expenseData, date_of_payment: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-700">Amount</label>
              <input type="number" step="0.01" className="w-full border p-2 rounded mt-1" required 
                value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-700">Payment Type</label>
              <select className="w-full border p-2 rounded mt-1" required 
                value={expenseData.payment_type} onChange={(e) => setExpenseData({...expenseData, payment_type: e.target.value})}>
                <option value="">Select Payment Type</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Paid To</label>
              <input type="text" className="w-full border p-2 rounded mt-1" required 
                value={expenseData.paid_to} onChange={(e) => setExpenseData({...expenseData, paid_to: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-700">Invoice Number</label>
              <input type="text" className="w-full border p-2 rounded mt-1" 
                value={expenseData.invoice_number} onChange={(e) => setExpenseData({...expenseData, invoice_number: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700">Description</label>
              <textarea className="w-full border p-2 rounded mt-1" rows="3"
                value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700">Upload Bill (Images/Docs)</label>
              <input type="file" className="w-full border p-2 rounded mt-1" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                onChange={(e) => setBillFile(e.target.files[0])} />
            </div>
            <div className="md:col-span-2 text-right mt-4">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Submit Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Expense List</h2>
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Paid To</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Bill</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? expenses.map((exp) => (
              <tr key={exp.expense_id} className="border-b hover:bg-gray-50">
                <td className="p-3">{new Date(exp.date_of_payment).toLocaleDateString()}</td>
                <td className="p-3">{exp.expense_type}</td>
                <td className="p-3">{exp.paid_to}</td>
                <td className="p-3">{exp.payment_type}</td>
                <td className="p-3 font-semibold text-red-600">₹ {parseFloat(exp.amount).toFixed(2)}</td>
                <td className="p-3">
                  {exp.upload_bill ? (
                    <a href={`http://localhost:5000/uploads/expenses/${exp.upload_bill}`} target="_blank" rel="noreferrer" className="text-blue-500 underline">View</a>
                  ) : "N/A"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No expenses recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesPage;
