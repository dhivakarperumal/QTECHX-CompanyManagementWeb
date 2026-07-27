import { useAuth } from "./AuthContext.jsx";
import EmployeeDashboard from "../Employees/EmployeeDashboard.jsx";
import TraineeDashboard from "../Trainee/TraineeDashboard.jsx";

const EmployeeOrTraineeDashboard = () => {
  const { role } = useAuth();
  return role?.toString().toLowerCase() === "trainee" ? <TraineeDashboard /> : <EmployeeDashboard />;
};

export default EmployeeOrTraineeDashboard;
