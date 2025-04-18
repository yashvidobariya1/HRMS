import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // const userRole = localStorage.getItem("userRole");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const applyJobKey = searchParams.has("key");

  if (token && !applyJobKey) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
