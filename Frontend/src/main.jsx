import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import checkTokenStatus from './utils/tokenDebugger.js'
import Home from './Componets/Home/Home.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Components/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'

import AdminDashboard from './Admin/AdminDashboard.jsx'
import AdminLayout from './Admin/Adminpanel.jsx'
import EmployeeList from './Admin/Employees/EmployeeList.jsx'
import EmployeeAdd from './Admin/Employees/EmployeeAdd.jsx'
// import EmployeeEdit from './Admin/Employees/EmployeeEdit.jsx'
import EmployeeView from './Admin/Employees/EmployeeView.jsx'
import AdminLeaveManagement from './Admin/Employees/AdminLeaveManagement.jsx'
import AttendancePage from './Admin/AttendancePage.jsx'
import AttendanceView from './Admin/AttendanceView.jsx'
import OfficeCalendar from './Admin/OfficeCalendar.jsx'
import MyCalendar from './Admin/MyCalendar.jsx'

import { AuthProvider } from './PrivateRouter/AuthContext.jsx'
import { StoreProvider } from './PrivateRouter/StoreContext.jsx'
import { AdminProvider } from './PrivateRouter/AdminContext';
import RouteError from './Componets/Components/RouteError.jsx'
import AboutUs from './Componets/About/About.jsx'
import ServiceDetails from './Componets/Services/ServiceDetails.jsx'
import ProjectPage from "./Componets/Projects/ProjectPage.jsx";
import Prices from "./Componets/Prices/Prices.jsx";
import WhyChooseUs from './Componets/WhyChooseUs/WhyChooseUs.jsx';
import WhoWeWorkWith from "./Componets/WhyChooseUs/WhoWeWorkWith.jsx";
import WhatWeDo from "./Componets/WhyChooseUs/WhatWeDo.jsx";
import OurAchievements from "./Componets/WhyChooseUs/Achivements.jsx";
import CareerDetail from "./Componets/Careers/CareerDetail.jsx";
import JobApply from "./Admin/JobApply/JobApply.jsx";
import ContactPage from "./Componets/Contact/ContactPage.jsx";
import Booknow from "./Componets/BookingForm/Booknow.jsx";
import PrivacyPolicy from "./Componets/PrivacyPolicy/PrivacyPolicy.jsx";

import EmployeeDashboard from './Employees/EmployeeDashboard.jsx'
import EmployeeLayout from './Employees/EmployeePanel.jsx'
import EmployeeMeetings from './Employees/EmployeeMeetings.jsx'
import EmployeeProjects from './Employees/Employee Projects/EmployeeProjects.jsx'
import EmployeeProjectDetails from './Employees/Employee Projects/EmployeeProjectDetails.jsx'
import EmployeeTasks from './Employees/EmployeeTasks.jsx'
import EmployeeTaskDetails from './Employees/EmployeeTaskDetails.jsx'
import EmployeeTimesheetPage from './Employees/EmployeeTimesheetPage.jsx'
import TodayTasksPage from './Employees/TodayTasksPage.jsx'
import CompletedTasksPage from './Employees/CompletedTasksPage.jsx'
import PendingTasksPage from './Employees/PendingTasksPage.jsx'
import CancelledTasksPage from './Employees/CancelledTasksPage.jsx'
import EmployeePayroll from './Employees/EmployeePayroll.jsx'
import EmployeePayrollSlips from './Employees/EmployeePayrollSlips.jsx'
import ApplyLeave from './Employees/Leaves/ApplyLeave.jsx'
import LeaveHistory from './Employees/Leaves/LeaveHistory.jsx'
import EmployeeLeaveHistoryPage from './Employees/Leaves/EmployeeLeaveHistoryPage.jsx'
import AllProjects from './Admin/Projects/AllProjects.jsx'
import AddProject from './Admin/Projects/AddProject.jsx'
import EditProject from './Admin/Projects/EditProject.jsx'
import ProjectDetails from './Admin/Projects/ProjectDetails.jsx'
import MyProjectDetails from './Admin/Projects/MyProjectDetails.jsx'
import ProjectAssignments from './Admin/Projects/ProjectAssignments.jsx'
import ProjectAssetsPage from './Admin/Projects/ProjectAssetsPage.jsx'
import ProjectPlansPage from './Admin/Projects/ProjectPlansPage.jsx'
import ProjectQuotationsPage from './Admin/Projects/ProjectQuotationsPage.jsx'
import QuotationFormPage from './Admin/Projects/QuotationFormPage.jsx'
import QuotationDetailsPage from './Admin/Projects/QuotationDetailsPage.jsx'
import ProjectExpiryPage from './Admin/Projects/ProjectExpiryPage.jsx'
import CompletedProjects from './Admin/Projects/CompletedProjects.jsx'
import AssignmentView from './Admin/Projects/AssignmentView.jsx'
import TasksPage from './Admin/Tasks/TasksPage.jsx'
import AssignTaskPage from './Admin/Tasks/AssignTaskPage.jsx'
import AdminTodayTasksPage from './Admin/Tasks/AdminTodayTasksPage.jsx'
import AdminNewTasksPage from './Admin/Tasks/AdminNewTasksPage.jsx'
import AdminPendingTasksPage from './Admin/Tasks/AdminPendingTasksPage.jsx'
import AdminCompletedTasksPage from './Admin/Tasks/AdminCompletedTasksPage.jsx'
import AdminCancelledTasksPage from './Admin/Tasks/AdminCancelledTasksPage.jsx'
import AllTraineeInterns from './Admin/Trainees/AllTraineeInterns.jsx'
import AddTraineeIntern from './Admin/Trainees/AddTraineeIntern.jsx'
import TraineeInternDetails from './Admin/Trainees/TraineeInternDetails.jsx'
import TraineeInternAttendancePage from './Admin/Trainees/TraineeInternAttendancePage.jsx'
import TraineeInternAttendanceView from './Admin/Trainees/TraineeInternAttendanceView.jsx'
import PendingTraineeInterns from './Admin/Trainees/PendingTraineeInterns.jsx'

import EmployeeAttendance from './Employees/EmployeeAttendance.jsx'
import EmployeeAttendanceSummary from './Employees/EmployeeAttendanceSummary.jsx'
import EmployeeProfile from './Employees/EmployeeProfile.jsx'

import EmployeeAllTraineeInterns from './Employees/Trainees/AllTraineeInterns.jsx'
import EmployeeAddTraineeIntern from './Employees/Trainees/AddTraineeIntern.jsx'
import EmployeeTraineeInternAttendancePage from './Employees/Trainees/TraineeInternAttendancePage.jsx'
import EmployeeTraineeTaskMaster from './Employees/Trainees/TraineeTaskMaster.jsx'
import EmployeeTraineeTaskAssign from './Employees/Trainees/TraineeTaskAssign.jsx'
import EmployeeTraineeInternDetails from './Employees/Trainees/TraineeInternDetails.jsx'
import EmployeeTraineeInternAttendanceView from './Employees/Trainees/TraineeInternAttendanceView.jsx'
import EmployeeTraineeTaskDetails from './Employees/Trainees/TraineeTaskDetails.jsx'

import TraineeTaskMaster from './Admin/Trainees/TraineeTaskMaster.jsx';
import TraineeTaskAssign from './Admin/Trainees/TraineeTaskAssign.jsx';
import TraineeTaskDetails from './Admin/Trainees/TraineeTaskDetails.jsx';
import ReportsPage from './Admin/ReportsPage.jsx';
import AdminProfile from './Admin/Settings/AdminProfile.jsx';
import AdminSettingsPage from './Admin/Settings/AdminSettingsPage.jsx';
import AdminLeaveSettingsPage from './Admin/Settings/AdminLeaveSettingsPage.jsx';
import AdminServicesSettingsPage from './Admin/Settings/AdminServicesSettingsPage.jsx';
import AdminPricingSettingsPage from './Admin/Settings/AdminPricingSettingsPage.jsx';
import AdminReviewsSettingsPage from './Admin/Settings/AdminReviewsSettingsPage.jsx';
import AdminJobsSettingsPage from './Admin/Settings/AdminJobsSettingsPage.jsx';
import AdminJobApplicationsPage from './Admin/Settings/AdminJobApplicationsPage.jsx';
import AdminServiceRequestsPage from './Admin/Settings/AdminServiceRequestsPage.jsx';
import AdminContactRequestsPage from './Admin/Settings/AdminContactRequestsPage.jsx';
import AdminCompletedProjectsSettingsPage from './Admin/Settings/AdminCompletedProjectsSettingsPage.jsx';
import AdminUsersSettingsPage from './Admin/Settings/AdminUsersSettingsPage.jsx';

const AllClients = lazy(() => import('./Admin/Clients/AllClients.jsx'))
const ExpensesPage = lazy(() => import('./Admin/Expenses/ExpensesPage.jsx'))
const EmployeeSalary = lazy(() => import('./Admin/Expenses/EmployeeSalary.jsx'))
const ProjectPayment = lazy(() => import('./Admin/Expenses/ProjectPayment.jsx'))
const Incomes = lazy(() => import('./Admin/Expenses/Incomes.jsx'))



const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: "/about", element: <AboutUs /> },
      { path: "/services/:id", element: <ServiceDetails /> },
      { path: "/projects", element: <ProjectPage /> },
      { path: "/prices", element: <Prices /> },
      { path: "/whychooseus", element: <WhyChooseUs /> },
      { path: "/whoweworkwith", element: <WhoWeWorkWith /> },
      { path: "/whatwedo", element: <WhatWeDo /> },
      { path: "/achievements", element: <OurAchievements /> },
      { path: "/career", element: <CareerDetail /> },
      { path: "/apply/:jobId", element: <JobApply /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/booknow", element: <Booknow /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },

      {
        path: 'admin',
        element: (
          <PrivateRoute allowedRoles={["Super Admin", "Admin"]}>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'clients',
            element: <AllClients key="all" />,
          },
          {
            path: 'clients/followups',
            element: <AllClients key="followups" defaultFuFilter="Pending" />,
          },
          {
            path: 'projects',
            element: <AllProjects />,
          },
          {
            path: 'projects/assignments',
            element: <ProjectAssignments />,
          },
          {
            path: 'projects/assignments/view/:id',
            element: <AssignmentView />,
          },
          {
            path: 'tasks',
            element: <TasksPage />,
          },
          {
            path: 'tasks/add',
            element: <TasksPage />,
          },
          {
            path: 'tasks/assign',
            element: <AssignTaskPage />,
          },
          {
            path: 'tasks/update',
            element: <TasksPage />,
          },
          {
            path: 'tasks/board',
            element: <TasksPage />,
          },
          {
            path: 'tasks/graph',
            element: <TasksPage />,
          },
          {
            path: 'tasks/completed',
            element: <AdminCompletedTasksPage />,
          },
          {
            path: 'tasks/pending',
            element: <AdminPendingTasksPage />,
          },
          {
            path: 'tasks/cancelled',
            element: <AdminCancelledTasksPage />,
          },
          {
            path: 'tasks/today',
            element: <AdminTodayTasksPage />,
          },
          {
            path: 'tasks/new',
            element: <AdminNewTasksPage />,
          },
          {
            path: 'projects/add',
            element: <AddProject />,
          },
          {
            path: 'projects/edit/:id',
            element: <EditProject />,
          },
          {
            path: 'projects/view/:id',
            element: <ProjectDetails />,
          },
          {
            path: 'myprojects',
            element: <CompletedProjects />,
          },
          {
            path: 'myprojects/view/:id',
            element: <MyProjectDetails />,
          },
          {
            path: 'myprojects/assets',
            element: <ProjectAssetsPage />,
          },
          {
            path: 'myprojects/images',
            element: <ProjectAssetsPage />,
          },
          {
            path: 'myprojects/plans',
            element: <ProjectPlansPage />,
          },
          {
            path: 'myprojects/quotations',
            element: <ProjectQuotationsPage />,
          },
          {
            path: 'myprojects/quotations/new',
            element: <QuotationFormPage />,
          },
          {
            path: 'myprojects/quotations/view/:uuid',
            element: <QuotationDetailsPage />,
          },
          {
            path: 'myprojects/quotations/edit/:uuid',
            element: <QuotationFormPage />,
          },
          {
            path: 'myprojects/documents',
            element: <ProjectAssetsPage />,
          },
          {
            path: 'myprojects/expiry',
            element: <ProjectExpiryPage />,
          },
          {
            path: 'employees',
            element: <EmployeeList />,
          },
          {
            path: 'employees/add',
            element: <EmployeeAdd />,
          },
          {
            path: 'employees/edit/:id',
            element: <EmployeeAdd />,
          },
          {
            path: 'employees/view/:id',
            element: <EmployeeView />,
          },
          {
            path: 'employees/leave',
            element: <AdminLeaveManagement />,
          },
          {
            path: 'trainees',
            element: <AllTraineeInterns />,
          },
          {
            path: 'trainees/pending',
            element: <PendingTraineeInterns />,
          },
          {
            path: 'internships',
            element: <AllTraineeInterns />,
          },
          {
            path: 'trainees/add',
            element: <AddTraineeIntern />,
          },
          {
            path: 'internships/add',
            element: <AddTraineeIntern />,
          },
          {
            path: 'trainees/edit/:id',
            element: <AddTraineeIntern />,
          },
          {
            path: 'trainees/view/:id',
            element: <TraineeInternDetails />,
          },
          {
            path: 'trainees/attendance',
            element: <TraineeInternAttendancePage />,
          },
          {
            path: 'trainees/attendance/view/:id',
            element: <TraineeInternAttendanceView />,
          },
          {
            path: 'trainees/tasks',
            element: <TraineeTaskMaster />,
          },
          {
            path: 'trainees/tasks/assign',
            element: <TraineeTaskAssign />,
          },
          {
            path: 'trainees/tasks/view/:uuid',
            element: <TraineeTaskDetails />,
          },
          {
            path: 'attendance',
            element: <AttendancePage />,
          },
          {
            path: 'attendance/view/:id',
            element: <AttendanceView />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'settings',
            element: <AdminSettingsPage />,
          },
          {
            path: 'settings/users',
            element: <AdminUsersSettingsPage />,
          },
          {
            path: 'settings/leave',
            element: <AdminLeaveSettingsPage />,
          },
          {
            path: 'settings/services',
            element: <AdminServicesSettingsPage />,
          },
          {
            path: 'settings/pricing',
            element: <AdminPricingSettingsPage />,
          },
          {
            path: 'settings/reviews',
            element: <AdminReviewsSettingsPage />,
          },
          {
            path: 'settings/completed-projects',
            element: <AdminCompletedProjectsSettingsPage />,
          },
          {
            path: 'settings/completedprojects',
            element: <AdminCompletedProjectsSettingsPage />,
          },
          {
            path: 'settings/jobs',
            element: <AdminJobsSettingsPage />,
          },
          {
            path: 'settings/job-applications',
            element: <AdminJobApplicationsPage />,
          },
          {
            path: 'settings/service-requests',
            element: <AdminServiceRequestsPage />,
          },
          {
            path: 'settings/contacts',
            element: <AdminContactRequestsPage />,
          },
          {
            path: 'settings/contact-requests',
            element: <AdminContactRequestsPage />,
          },
          {
            path: 'settings/profile',
            element: <AdminProfile />,
          },
          {
            path: 'leave-history/:employeeId',
            element: <EmployeeLeaveHistoryPage />,
          },
          {
            path: 'office-calendar',
            element: <OfficeCalendar />,
          },
          {
            path: 'my-calendar',
            element: <MyCalendar />,
          },
          {
            path: 'expenses',
            element: <ExpensesPage />,
          },
          {
            path: 'expenses/salary',
            element: <EmployeeSalary />,
          },
          {
            path: 'expenses/project-payment',
            element: <ProjectPayment />,
          },
          {
            path: 'expenses/incomes',
            element: <Incomes />,
          },
        ],
      },


       
      {
        path: 'employee',
        element: (
          <PrivateRoute allowedRoles={["Employee"]}>
            <EmployeeLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <EmployeeDashboard />,
          },
          {
            path: 'office-calendar',
            element: <OfficeCalendar />,
          },
          {
            path: 'my-calendar',
            element: <MyCalendar />,
          },
          {
            path: 'meetings',
            element: <EmployeeMeetings />,
          },
          {
            path: 'meetings/upcoming',
            element: <EmployeeMeetings />,
          },
          {
            path: 'projects',
            element: <EmployeeProjects />,
          },
          {
            path: 'projects/view/:id',
            element: <EmployeeProjectDetails />,
          },
          {
            path: 'tasks',
            element: <EmployeeTasks />,
          },
          {
            path: 'tasks/board',
            element: <EmployeeTasks />,
          },
          {
            path: 'tasks/pending',
            element: <PendingTasksPage />,
          },
          {
            path: 'tasks/completed',
            element: <CompletedTasksPage />,
          },
          {
            path: 'tasks/cancelled',
            element: <CancelledTasksPage />,
          },
          {
            path: 'tasks/today',
            element: <TodayTasksPage />,
          },
          {
            path: 'tasks/processing',
            element: <EmployeeTasks />,
          },
          {
            path: 'tasks/view/:id',
            element: <EmployeeTaskDetails />,
          },
          {
            path: 'payroll',
            element: <EmployeePayroll />,
          },
          {
            path: 'payroll/slips',
            element: <EmployeePayrollSlips />,
          },
          {
            path: 'attendance',
            element: <EmployeeAttendance />,
          },
          {
            path: 'attendance/summary',
            element: <EmployeeAttendanceSummary />,
          },
          {
            path: 'settings/profile',
            element: <EmployeeProfile />,
          },
          {
            path: 'leaves/apply',
            element: <ApplyLeave />,
          },
          {
            path: 'leaves/history',
            element: <LeaveHistory />,
          },
          {
            path: 'leaves/history/:employeeId',
            element: <EmployeeLeaveHistoryPage />,
          },
          {
            path: 'trainees',
            element: <EmployeeAllTraineeInterns />,
          },
          {
            path: 'trainees/add',
            element: <EmployeeAddTraineeIntern />,
          },
          {
            path: 'trainees/view/:id',
            element: <EmployeeTraineeInternDetails />,
          },
          {
            path: 'trainees/attendance',
            element: <EmployeeTraineeInternAttendancePage />,
          },
          {
            path: 'trainees/attendance/view/:id',
            element: <EmployeeTraineeInternAttendanceView />,
          },
          {
            path: 'trainees/tasks',
            element: <EmployeeTraineeTaskMaster />,
          },
          {
            path: 'trainees/tasks/assign',
            element: <EmployeeTraineeTaskAssign />,
          },
          {
            path: 'trainees/tasks/view/:uuid',
            element: <EmployeeTraineeTaskDetails />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <StoreProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </StoreProvider>
    </AuthProvider>
  </StrictMode>,
)

// Make token debugger available globally in browser console
if (import.meta.env.DEV) {
  console.log("🔐 Token debugger available. Run checkTokenStatus() in console to debug authentication.");
}
