import React from "react";

// Simple static users table for the Trainee dashboard
const UsersTable = () => {
  const users = [
    {
      name: "Trainee",
      email: "trainee@gmail.com",
      phone: "1234567898",
      role: "Trainee",
      status: "Active",
    },
  ];

  return (
    <div className="mt-6 overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Users Table</h2>
        <p className="text-sm text-white/50">1 trainee record loaded</p>
      </div>
      <table className="min-w-full border border-gray-700 rounded-lg bg-[#0d0d12] text-white">
        <thead className="bg-gray-800 text-white/70">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Phone</th>
            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.email} className={idx % 2 === 0 ? "bg-[#0d0d12]" : "bg-gray-900"}>
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.phone}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
