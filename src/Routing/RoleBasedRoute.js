import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { accessToken, userType } = useSelector(
    (state) => state.auth
  );

  // User must be authenticated.
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Reject unknown or unauthorized roles.
  if (!allowedRoles.includes(userType)) {
    if (userType === "Admin" || userType === "Moderator") {
      return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;