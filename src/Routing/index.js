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
import CirclesList from "../Pages/Admin/Circles/CirclesList";
import AppBannerList from "../Pages/Admin/AppBanner/AppBannerList";
import CirclesGroupList from "../Pages/Admin/Circles/CirclesGroupList";
import RolesList from "../Pages/Admin/Roles/RolesList";
import CreateNewRole from "../Pages/Admin/Roles/CreateNewRole";
import StaffList from "../Pages/Admin/Staff/StaffList";
import ModulesList from "../Pages/Admin/Modules/ModulesList";
import TiersList from "../Pages/Admin/Tiers/TiersList";
import FlaggedKeywordsList from "../Pages/Admin/FlaggedKeywords/FlaggedKeywordsList";


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
          path="/tribes"
          element={
            <PrivateRoute>
              <CirclesGroupList />
            </PrivateRoute>
          }
        />
        <Route
          path="/sub-tribes"
          element={
            <PrivateRoute>
              <CirclesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/app-banner"
          element={
            <PrivateRoute>
              <AppBannerList />
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

        <Route
          path="/roles"
          element={
            <PrivateRoute>
              <RolesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/role"
          element={
            <PrivateRoute>
              <CreateNewRole />
            </PrivateRoute>
          }
        />
        <Route
          path="/role/:id"
          element={
            <PrivateRoute>
              <CreateNewRole />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <StaffList />
            </PrivateRoute>
          }
        />

        <Route
          path="/modules"
          element={
            <PrivateRoute>
              <ModulesList />
            </PrivateRoute>
          }
        />

        <Route
          path="/tiers"
          element={
            <PrivateRoute>
              <TiersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/flagged-keywords"
          element={
            <PrivateRoute>
              <FlaggedKeywordsList />
            </PrivateRoute>
          }
        />

        
      </Routes>
    </Router>
  );
}
