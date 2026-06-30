import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import PrivateRoute from "./PrivateRoute";
import Login from "../Components/Common/Login";
import AdminDashboard from "../Pages/Admin/Home";
import AllUsersList from "../Pages/Admin/AllUsers/AllUsersList";
import ViewUser from "../Components/UserDetails/ViewUser";
import BannedUsersList from "../Pages/Admin/AllUsers/BannedUsersList";
import CircleModeratorsList from "../Pages/Admin/AllUsers/CircleModeratorsList";


export default function Routing() {
  const { accessToken, userType } = useSelector((state) => state.auth);

  if (!accessToken) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Common Login Route */}
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<Navigate to="/" />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-users"
          element={
            <PrivateRoute>
              <AllUsersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/banned-users"
          element={
            <PrivateRoute>
              <BannedUsersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/circle-moderator"
          element={
            <PrivateRoute>
              <CircleModeratorsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/user/:id"
          element={
            <PrivateRoute>
              <ViewUser />
            </PrivateRoute>
          }
        />

        
      </Routes>
    </Router>
  );
}
