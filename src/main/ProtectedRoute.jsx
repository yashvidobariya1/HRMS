import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  console.log("userRole", userRole);
  console.log("allowedRoles", allowedRoles);
  console.log("children", children.type.name);

  if (children.type.name === "EmployeesTimesheet" && userRole === undefined)
    return children;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;