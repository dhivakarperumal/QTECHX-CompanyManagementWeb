import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import checkTokenStatus from './utils/tokenDebugger.js'
import Home from './Componets/Home/Home.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Components/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'

const AdminDashboard = lazy(() => import('./Admin/AdminDashboard.jsx'))
const AdminLayout = lazy(() => import('./Admin/Adminpanel.jsx'))
const EmployeeList = lazy(() => import('./Admin/Employees/EmployeeList.jsx'))
const EmployeeAdd = lazy(() => import('./Admin/Employees/EmployeeAdd.jsx'))
// import EmployeeEdit from './Admin/Employees/EmployeeEdit.jsx'
const EmployeeView = lazy(() => import('./Admin/Employees/EmployeeView.jsx'))
const AdminLeaveManagement = lazy(() => import('./Admin/Employees/AdminLeaveManagement.jsx'))
const AttendancePage = lazy(() => import('./Admin/AttendancePage.jsx'))
const AttendanceView = lazy(() => import('./Admin/AttendanceView.jsx'))
const OfficeCalendar = lazy(() => import('./Admin/OfficeCalendar.jsx'))
const MyCalendar = lazy(() => import('./Admin/MyCalendar.jsx'))

import { AuthProvider } from './PrivateRouter/AuthContext.jsx'
import { NotificationsProvider } from './PrivateRouter/NotificationsContext.jsx'
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

const EmployeeDashboard = lazy(() => import('./Employees/EmployeeDashboard.jsx'))
const EmployeeLayout = lazy(() => import('./Employees/EmployeePanel.jsx'))
const EmployeeMeetings = lazy(() => import('./Employees/EmployeeMeetings.jsx'))
const EmployeeProjects = lazy(() => import('./Employees/Employee Projects/EmployeeProjects.jsx'))
const EmployeeProjectDetails = lazy(() => import('./Employees/Employee Projects/EmployeeProjectDetails.jsx'))
const EmployeeTasks = lazy(() => import('./Employees/EmployeeTasks.jsx'))
const EmployeeTaskDetails = lazy(() => import('./Employees/EmployeeTaskDetails.jsx'))
const EmployeeTimesheetPage = lazy(() => import('./Employees/EmployeeTimesheetPage.jsx'))
const TodayTasksPage = lazy(() => import('./Employees/TodayTasksPage.jsx'))
const CompletedTasksPage = lazy(() => import('./Employees/CompletedTasksPage.jsx'))
const PendingTasksPage = lazy(() => import('./Employees/PendingTasksPage.jsx'))
const CancelledTasksPage = lazy(() => import('./Employees/CancelledTasksPage.jsx'))
const EmployeePayroll = lazy(() => import('./Employees/EmployeePayroll.jsx'))
const EmployeePayrollSlips = lazy(() => import('./Employees/EmployeePayrollSlips.jsx'))
const ApplyLeave = lazy(() => import('./Employees/Leaves/ApplyLeave.jsx'))
const LeaveHistory = lazy(() => import('./Employees/Leaves/LeaveHistory.jsx'))
const EmployeeLeaveHistoryPage = lazy(() => import('./Employees/Leaves/EmployeeLeaveHistoryPage.jsx'))
const AllProjects = lazy(() => import('./Admin/Projects/AllProjects.jsx'))
const AddProject = lazy(() => import('./Admin/Projects/AddProject.jsx'))
const EditProject = lazy(() => import('./Admin/Projects/EditProject.jsx'))
const ProjectDetails = lazy(() => import('./Admin/Projects/ProjectDetails.jsx'))
const MyProjectDetails = lazy(() => import('./Admin/Projects/MyProjectDetails.jsx'))
const ProjectAssignments = lazy(() => import('./Admin/Projects/ProjectAssignments.jsx'))
const ProjectAssetsPage = lazy(() => import('./Admin/Projects/ProjectAssetsPage.jsx'))
const ProjectPlansPage = lazy(() => import('./Admin/Projects/ProjectPlansPage.jsx'))
const ProjectQuotationsPage = lazy(() => import('./Admin/Projects/ProjectQuotationsPage.jsx'))
const QuotationFormPage = lazy(() => import('./Admin/Projects/QuotationFormPage.jsx'))
const QuotationDetailsPage = lazy(() => import('./Admin/Projects/QuotationDetailsPage.jsx'))
const ProjectExpiryPage = lazy(() => import('./Admin/Projects/ProjectExpiryPage.jsx'))
const CompletedProjects = lazy(() => import('./Admin/Projects/CompletedProjects.jsx'))
const AssignmentView = lazy(() => import('./Admin/Projects/AssignmentView.jsx'))
const TasksPage = lazy(() => import('./Admin/Tasks/TasksPage.jsx'))
const AssignTaskPage = lazy(() => import('./Admin/Tasks/AssignTaskPage.jsx'))
const AdminTodayTasksPage = lazy(() => import('./Admin/Tasks/AdminTodayTasksPage.jsx'))
const AdminNewTasksPage = lazy(() => import('./Admin/Tasks/AdminNewTasksPage.jsx'))
const AdminPendingTasksPage = lazy(() => import('./Admin/Tasks/AdminPendingTasksPage.jsx'))
const AdminCompletedTasksPage = lazy(() => import('./Admin/Tasks/AdminCompletedTasksPage.jsx'))
const AdminCancelledTasksPage = lazy(() => import('./Admin/Tasks/AdminCancelledTasksPage.jsx'))
const AllTraineeInterns = lazy(() => import('./Admin/Trainees/AllTraineeInterns.jsx'))
const AddTraineeIntern = lazy(() => import('./Admin/Trainees/AddTraineeIntern.jsx'))
const TraineeInternDetails = lazy(() => import('./Admin/Trainees/TraineeInternDetails.jsx'))
const TraineeInternAttendancePage = lazy(() => import('./Admin/Trainees/TraineeInternAttendancePage.jsx'))
const TraineeInternAttendanceView = lazy(() => import('./Admin/Trainees/TraineeInternAttendanceView.jsx'))
const PendingTraineeInterns = lazy(() => import('./Admin/Trainees/PendingTraineeInterns.jsx'))
const EmployeeAttendance = lazy(() => import('./Employees/EmployeeAttendance.jsx'))
const EmployeeAttendanceSummary = lazy(() => import('./Employees/EmployeeAttendanceSummary.jsx'))
const EmployeeProfile = lazy(() => import('./Employees/EmployeeProfile.jsx'))
const EmployeeAllTraineeInterns = lazy(() => import('./Employees/Trainees/AllTraineeInterns.jsx'))
const EmployeeAddTraineeIntern = lazy(() => import('./Employees/Trainees/AddTraineeIntern.jsx'))
const EmployeeTraineeInternAttendancePage = lazy(() => import('./Employees/Trainees/TraineeInternAttendancePage.jsx'))
const EmployeeTraineeTaskMaster = lazy(() => import('./Employees/Trainees/TraineeTaskMaster.jsx'))
const EmployeeTraineeTaskAssign = lazy(() => import('./Employees/Trainees/TraineeTaskAssign.jsx'))
const EmployeeTraineeInternDetails = lazy(() => import('./Employees/Trainees/TraineeInternDetails.jsx'))
const EmployeeTraineeInternAttendanceView = lazy(() => import('./Employees/Trainees/TraineeInternAttendanceView.jsx'))
const EmployeeTraineeTaskDetails = lazy(() => import('./Employees/Trainees/TraineeTaskDetails.jsx'))
const TraineeTaskMaster = lazy(() => import('./Admin/Trainees/TraineeTaskMaster.jsx'))
const TraineeTaskAssign = lazy(() => import('./Admin/Trainees/TraineeTaskAssign.jsx'))
const TraineeTaskDetails = lazy(() => import('./Admin/Trainees/TraineeTaskDetails.jsx'))
const ReportsPage = lazy(() => import('./Admin/ReportsPage.jsx'))
const AdminProfile = lazy(() => import('./Admin/Settings/AdminProfile.jsx'))
const AdminSettingsPage = lazy(() => import('./Admin/Settings/AdminSettingsPage.jsx'))
const AdminLeaveSettingsPage = lazy(() => import('./Admin/Settings/AdminLeaveSettingsPage.jsx'))
const AdminServicesSettingsPage = lazy(() => import('./Admin/Settings/AdminServicesSettingsPage.jsx'))
const AdminPricingSettingsPage = lazy(() => import('./Admin/Settings/AdminPricingSettingsPage.jsx'))
const AdminReviewsSettingsPage = lazy(() => import('./Admin/Settings/AdminReviewsSettingsPage.jsx'))
const AdminJobsSettingsPage = lazy(() => import('./Admin/Settings/AdminJobsSettingsPage.jsx'))
const AdminJobApplicationsPage = lazy(() => import('./Admin/Settings/AdminJobApplicationsPage.jsx'))
const AdminServiceRequestsPage = lazy(() => import('./Admin/Settings/AdminServiceRequestsPage.jsx'))
const AdminContactRequestsPage = lazy(() => import('./Admin/Settings/AdminContactRequestsPage.jsx'))
const AdminCompletedProjectsSettingsPage = lazy(() => import('./Admin/Settings/AdminCompletedProjectsSettingsPage.jsx'))
const AdminUsersSettingsPage = lazy(() => import('./Admin/Settings/AdminUsersSettingsPage.jsx'))

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
      <NotificationsProvider>
        <StoreProvider>
          <AdminProvider>
            <Suspense fallback={<div className="min-h-screen bg-slate-950" aria-label="Loading page" />}>
              <RouterProvider router={router} />
            </Suspense>
          </AdminProvider>
        </StoreProvider>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>,
)

// Make token debugger available globally in browser console
if (import.meta.env.DEV) {
  console.log("🔐 Token debugger available. Run checkTokenStatus() in console to debug authentication.");
}
