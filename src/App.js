import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router";
import "./App.css";
import Sidebar from "./main/Sidebar";
import Header from "./main/Header";
import Subheader from "./main/Subheader";
import ProtectedRoute from "./main/ProtectedRoute";
import ToastManager from "./main/ToastManager";
import Unauthorized from "./pages/Helper/Unauthorized";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Settings from "./pages/Settings/Settings";
import EmploymentContract from "./pages/EmploymentContract/EmploymentContract";
import Location from "./pages/Location/Location";
import AddLocation from "./pages/Location/AddLocation";
import Templates from "./pages/Templates/Templates";
import Employee from "./pages/Employee/Employee";
import AddEmployee from "./pages/Employee/AddEmployee";
import LoggedInUser from "./pages/LoggedInUser/LoggedInUser";
import Leaves from "./pages/Leaves/Leaves";
import Holidays from "./pages/Holidays/Holidays";
import ClockIn from "./pages/ClockIn/ClockIn";
import Job from "./pages/Job/Job";
import Candidate from "./pages/Candidate/Candidate";
import ChangePassword from "./pages/EmployeeProfile/ChangePassword";
import Viewhours from "./pages/ViewHours/Viewhours";
import TimeSheetReport from "./pages/TimeSheetReport/TimeSheetReport";
import AbsenceReport from "./pages/AbsenceReport/AbsenceReport";
import AddCompany from "./pages/Settings/AddCompany";
import Profile from "./pages/EmployeeProfile/Profile";
import GenerateQRcode from "./pages/GenerateQRcode/GenerateQRcode";
import AddLeaves from "./pages/Leaves/AddLeaves";
import LeavesRequest from "./pages/Leaves/LeaveRequest";
import ShowNotification from "./pages/ShowNotification/ShowNotification";
import PublicRoute from "./main/PublicRoute";
import AddHoliday from "./pages/Holidays/AddHoliday";
import HolidayList from "./pages/Holidays/HolidayList";
import Client from "./pages/Client/Client";
import AddClient from "./pages/Client/AddClient";
import EmployeeTimesheet from "./pages/Client/EmployeesTimesheet";
import ReportList from "./pages/Client/ReportList";
import ViewStatus from "./pages/Client/ViewStatus";
import ViewReport from "./pages/Client/ViewReport";
import ViewTasks from "./pages/ViewTasks/ViewTasks";
import AddJob from "./pages/Job/AddJob";
import ApplyJob from "./pages/Applypost/ApplyJob";
import GenerateQRcodeForClient from "./pages/GenerateQRcode/GenerateQRcodeForClient";
import JobTitles from "./pages/JobTitles/JobTitles";
import AddJobTitles from "./pages/JobTitles/AddJobTitles";

// Layout wrapper
function MainLayout({ children, path }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="main-content">
      {path !== "/employeestimesheet" && path !== "/viewtimesheetreport" ? (
        <>
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Subheader isCollapsed={isCollapsed} />
          <div className={`content ${isCollapsed ? "collapsed" : ""}`}>
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

// Define route configurations
const protectedRoutes = [
  {
    path: "/dashboard",
    component: <Dashboard />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/profile",
    component: <Profile />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/changepassword",
    component: <ChangePassword />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/company",
    component: <Settings />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/clients",
    component: <Client />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/clients/generateqrcode",
    component: <GenerateQRcodeForClient />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/company/addCompany",
    component: <AddCompany />,
    roles: ["Superadmin"],
  },
  {
    path: "/company/editcompany/:id",
    component: <AddCompany />,
    roles: ["Superadmin"],
  },
  {
    path: "/clients/addclient",
    component: <AddClient />,
    roles: ["Superadmin"],
  },
  {
    path: "/clients/editclient/:id",
    component: <AddClient />,
    roles: ["Superadmin"],
  },
  {
    path: "/reportlist",
    component: <ReportList />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/reportlist/viewstatus",
    component: <ViewStatus />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/employmentcontract",
    component: <EmploymentContract />,
    roles: ["Superadmin"],
  },
  { path: "/location", component: <Location />, roles: ["Superadmin"] },
  {
    path: "/location/addlocation",
    component: <AddLocation />,
    roles: ["Superadmin"],
  },
  {
    path: "/location/editlocation/:id",
    component: <AddLocation />,
    roles: ["Superadmin"],
  },
  { path: "/templates", component: <Templates />, roles: ["Superadmin"] },
  {
    path: "/employees",
    component: <Employee />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/employees/addemployee",
    component: <AddEmployee />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/employees/editemployee/:id",
    component: <AddEmployee />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/editemployee/:id",
    component: <AddEmployee />,
    roles: ["Administrator", "Manager", "Employee"],
  },
  {
    path: "/loggedinuser",
    component: <LoggedInUser />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/leaves",
    component: <Leaves />,
    roles: ["Administrator", "Manager", "Employee"],
  },
  {
    path: "/leavesrequest",
    component: <LeavesRequest />,
    roles: ["Superadmin"],
  },
  {
    path: "/leaves/addleaves",
    component: <AddLeaves />,
    roles: ["Administrator", "Manager", "Employee"],
  },
  {
    path: "/leaves/leavesrequest",
    component: <LeavesRequest />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/leaves/editleave/:id",
    component: <AddLeaves />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/holidays",
    component: <Holidays />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/holidays/holidaylist",
    component: <HolidayList />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/holidays/addholiday",
    component: <AddHoliday />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/holidays/editholiday/:id",
    component: <AddHoliday />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/absencereport",
    component: <AbsenceReport />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/employees/absencereport/:name",
    component: <AbsenceReport />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/clockin",
    component: <ClockIn />,
    roles: ["Administrator", "Manager", "Employee"],
  },
  {
    path: "/viewhours",
    component: <Viewhours />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/employees/viewhours/:name",
    component: <Viewhours />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/timesheetreport",
    component: <TimeSheetReport />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/employees/timesheetreport/:name",
    component: <TimeSheetReport />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/job",
    component: <Job />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/job/addjob",
    component: <AddJob />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/job/editjob/:id",
    component: <AddJob />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/candidate",
    component: <Candidate />,
    roles: ["Superadmin", "Administrator", "Manager"],
  },
  {
    path: "/location/generateqrcode",
    component: <GenerateQRcode />,
    roles: ["Superadmin", "Administrator"],
  },
  {
    path: "/notification",
    component: <ShowNotification />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/employeestimesheet",
    component: <EmployeeTimesheet />,
    roles: ["Client"],
  },
  {
    path: "/viewtimesheetreport",
    component: <ViewReport />,
    roles: ["Client"],
  },
  // {
  //   path: "employees/viewtasks/:name",
  //   component: <ViewTasks />,
  //   roles: ["Superadmin", "Administrator", "Manager"],
  // },
  {
    path: "viewtasks",
    component: <ViewTasks />,
    roles: ["Superadmin", "Administrator", "Manager", "Employee"],
  },
  {
    path: "/jobtitles",
    component: <JobTitles />,
    roles: ["Superadmin"],
  },
  {
    path: "/jobtitles/addjobtitles",
    component: <AddJobTitles />,
    roles: ["Superadmin"],
  },
  {
    path: "/jobtitles/editjobtitles/:id",
    component: <AddJobTitles />,
    roles: ["Superadmin"],
  },
];

const App = () => {
  // useEffect(() => {
  //   document.addEventListener("contextmenu", (e) => e.preventDefault());
  //   document.onkeydown = function (e) {
  //     if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
  //       return false;
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   // Disable right-click
  //   const handleContextMenu = (e) => {
  //     e.preventDefault();
  //   };

  //   // Disable certain keyboard shortcuts
  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) || // Ctrl+Shift+I/C/J
  //       (e.ctrlKey && e.key === "U") // Ctrl+U (View Source)
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener("contextmenu", handleContextMenu);
  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <>
      <ToastManager />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <MainLayout>
                <Unauthorized />
              </MainLayout>
            }
          />

          <Route
            path="/applyJob"
            element={
              <PublicRoute>
                <ApplyJob />
              </PublicRoute>
            }
          />

          {protectedRoutes.map(({ path, component, roles }) => (
            <Route
              key={path}
              path={path}
              element={
                <MainLayout path={path}>
                  <ProtectedRoute allowedRoles={roles} path={path}>
                    {component}
                  </ProtectedRoute>
                </MainLayout>
              }
            />
          ))}

          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
          <Route
            path="*"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
