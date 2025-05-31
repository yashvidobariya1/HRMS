// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = ({ children, allowedRoles, path }) => {
//   const token = localStorage.getItem("token");
//   const userInfo = useSelector((state) => state.userInfo.userInfo);

//   const employeeFormFilled = useSelector(
//     (state) => state.employeeformFilled.employeeformFilled
//   );

//   if (path === "/employeestimesheet") return children;

//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   console.log("children", children);
//   console.log(employeeFormFilled, allowedRoles, userInfo.role, path);

//   if (
//     employeeFormFilled === false &&
//     allowedRoles.includes(userInfo.role) &&
//     // path !== "/addemployee" &&
//     path !== "/viewtimesheetreport" &&
//     !path.startsWith("/editemployee")
//   ) {
//     console.log("inner employee path");
//     return <Navigate to={`/editemployee/${userInfo._id}`} />;
//   }

//   if (employeeFormFilled === true && path.startsWith("/editemployee")) {
//     return <Navigate to="/dashboard" />;
//   }

//   if (!allowedRoles.includes(userInfo.role)) {
//     return <Navigate to="/unauthorized" />;
//   }
//   console.log("end access");
//   return children;
// };

// export default ProtectedRoute;

import { Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles, path }) => {
  const token = localStorage.getItem("token");
  const userInfo = useSelector((state) => state.userInfo.userInfo);

  const location = useLocation();
  const currentPath = location.pathname;

  const employeeFormFilled = useSelector(
    (state) => state.employeeformFilled.employeeformFilled
  );

  const { id: routeUserId } = useParams();

  if (path === "/employeestimesheet") return children;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (
    currentPath.startsWith("/editemployee/") &&
    routeUserId &&
    routeUserId !== userInfo._id
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  const targetPath = `/editemployee/${userInfo._id}`;
  if (
    employeeFormFilled === false &&
    allowedRoles.includes(userInfo.role) &&
    currentPath !== targetPath
  ) {
    return <Navigate to={targetPath} replace />;
  }

  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
