import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Componets/Home/Home.jsx'
import Login from './Componets/Auth/Login.jsx'
import Register from './Componets/Components/Register.jsx'
import PrivateRoute from './PrivateRouter/PrivateRouter.jsx'
import EmployeeDashboard from './Employees/EmployeeDashboard.jsx'
import AdminDashboard from './Admin/AdminDashboard.jsx'
import AdminLayout from './Admin/Adminpanel.jsx'
import EmployeeList from './Admin/Employees/EmployeeList.jsx'
import EmployeeAdd from './Admin/Employees/EmployeeAdd.jsx'
// import EmployeeEdit from './Admin/Employees/EmployeeEdit.jsx'
import EmployeeView from './Admin/Employees/EmployeeView.jsx'
import AttendancePage from './Admin/AttendancePage.jsx'
import AttendanceView from './Admin/AttendanceView.jsx'
import EmployeeLayout from './Employees/EmployeePanel.jsx'
import { AuthProvider } from './PrivateRouter/AuthContext.jsx'
import { StoreProvider } from './PrivateRouter/StoreContext.jsx'
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
import ContactPage from "./Componets/Contact/ContactPage.jsx";
import TraineeDashboard from './Trainee/TraineeDashboard.jsx'
import TraineeLayout from './Trainee/TraineePanel.jsx'
import AllProjects from './Admin/Projects/AllProjects.jsx'
import AddProject from './Admin/Projects/AddProject.jsx'
import EditProject from './Admin/Projects/EditProject.jsx'
import ProjectDetails from './Admin/Projects/ProjectDetails.jsx'
import ProjectAssignments from './Admin/Projects/ProjectAssignments.jsx'
import ProjectAssetsPage from './Admin/Projects/ProjectAssetsPage.jsx'
import ProjectPlansPage from './Admin/Projects/ProjectPlansPage.jsx'
import ProjectQuotationsPage from './Admin/Projects/ProjectQuotationsPage.jsx'
import ProjectExpiryPage from './Admin/Projects/ProjectExpiryPage.jsx'
import CompletedProjects from './Admin/Projects/CompletedProjects.jsx'
import TasksPage from './Admin/Tasks/TasksPage.jsx'

const AllClients = lazy(() => import('./Admin/Clients/AllClients.jsx'))



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
      { path: "/contact", element: <ContactPage /> },
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
            path: 'tasks',
            element: <TasksPage />,
          },
          {
            path: 'tasks/add',
            element: <TasksPage />,
          },
          {
            path: 'tasks/assign',
            element: <TasksPage />,
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
            element: <TasksPage />,
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
            path: 'attendance',
            element: <AttendancePage />,
          },
          {
            path: 'attendance/view/:id',
            element: <AttendanceView />,
          },
          {
            path: 'attendance/summary',
            element: <AttendancePage />,
          },
        ],
      },
      {
        path: 'employee',
        element: (
          <PrivateRoute allowedRoles={["Manager", "Staff", "Employee"]}>
            <EmployeeLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <EmployeeDashboard />,
          },
        ],
      },

      {
        path: 'trainee',
        element: (
          <PrivateRoute allowedRoles={["Trainee"]}>
            <TraineeLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <TraineeDashboard />,
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
        <RouterProvider router={router} />
      </StoreProvider>
    </AuthProvider>
  </StrictMode>,
)
