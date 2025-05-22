import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles, path }) => {
  const token = localStorage.getItem("token");
  const userInfo = useSelector((state) => state.userInfo.userInfo);

  const employeeFormFilled = useSelector(
    (state) => state.employeeformFilled.employeeformFilled
  );

  if (path === "/employeestimesheet") return children;

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (
    employeeFormFilled === false &&
    allowedRoles.includes(userInfo.role) &&
    path !== "/addemployee" &&
    path !== "/viewtimesheetreport"
  ) {
    return <Navigate to={`/editemployee/${userInfo._id}`} />;
  }

  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
