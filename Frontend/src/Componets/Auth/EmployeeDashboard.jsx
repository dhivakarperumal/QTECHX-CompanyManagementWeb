import React from "react";
import { useAuth } from "../../PrivateRouter/AuthContext";
import PageContainer from "../CommonComponents/PageContainer";

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <PageContainer className="py-12">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">QTech Solutions</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="mt-3 text-gray-600">View assigned work and manage your day-to-day tasks.</p>
        <p className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          Signed in as <strong>{user?.username}</strong> ({user?.role})
        </p>
      </section>
    </PageContainer>
  );
};

export default EmployeeDashboard;
