import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = useSelector((state) => state.userInfo.userInfo.role);

  if (children.type.name === "EmployeesTimesheet" && userRole === undefined)
    if (!allowedRoles.includes(userRole)) {
      // if (children.type.name === "ApplyJob" && userRole === undefined)
      //   if (!allowedRoles) return children;

      return <Navigate to="/unauthorized" />;
    }

  return children;
};

export default ProtectedRoute;
