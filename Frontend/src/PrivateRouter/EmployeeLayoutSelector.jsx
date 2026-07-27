import { useAuth } from "./AuthContext.jsx";
import EmployeeLayout from "../Employees/EmployeePanel.jsx";
import TraineeLayout from "../Trainee/TraineePanel.jsx";

const EmployeeLayoutSelector = () => {
  const { role } = useAuth();
  return role?.toString().toLowerCase() === "trainee" ? <TraineeLayout /> : <EmployeeLayout />;
};

export default EmployeeLayoutSelector;
