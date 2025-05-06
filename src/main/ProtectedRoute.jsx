import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userInfo = useSelector((state) => state.userInfo.userInfo);

  const employeeFormFilled = useSelector(
    (state) => state.employeeformFilled.employeeformFilled
  );

  if (
    employeeFormFilled === false &&
    allowedRoles.includes(userInfo.role) &&
    children.type.name !== "AddEmployee"
  ) {
    // console.log("inner edit page");
    return <Navigate to={`/editemployee/${userInfo._id}`} />;
  }

  if (
    children.type.name === "EmployeesTimesheet" &&
    userInfo.role === undefined
  )
    return children;

  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;