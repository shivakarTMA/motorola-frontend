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
import TribesList from "../Pages/Admin/Tribes/TribesList";
import AppBannerList from "../Pages/Admin/AppBanner/AppBannerList";
import TribesGroupList from "../Pages/Admin/Tribes/TribesGroupList";
import RolesList from "../Pages/Admin/Roles/RolesList";
import CreateNewRole from "../Pages/Admin/Roles/CreateNewRole";
import StaffList from "../Pages/Admin/Staff/StaffList";
import ModulesList from "../Pages/Admin/Modules/ModulesList";
import TiersList from "../Pages/Admin/Tiers/TiersList";
import FlaggedKeywordsList from "../Pages/Admin/FlaggedKeywords/FlaggedKeywordsList";
import HotTakeList from "../Pages/Admin/PostArticles/HotTakeList";
import DeepDiveList from "../Pages/Admin/PostArticles/DeepDiveList";
import VibeCheckList from "../Pages/Admin/PostArticles/VibeCheckList";
import ModerationQueue from "../Pages/Admin/Moderation/ModerationQueue";
import DeviceBrandsList from "../Pages/Admin/DeviceBrands/DeviceBrandsList";
import DeviceModelList from "../Pages/Admin/DeviceModels/DeviceModelList";
import TopPicsList from "../Pages/Admin/TopPics/TopPicsList";
import RetailerList from "../Pages/Admin/Retailer/RetailerList";
import CampusList from "../Pages/Admin/Campus/CampusList";
import CampusReport from "../Pages/Admin/Reports/CampusReport";
import RetailerReport from "../Pages/Admin/Reports/RetailerReport";
import RoleBasedRoute from "./RoleBasedRoute";


// Helper function — outside the Routing component
const roleRoute = (element, allowedRoles) => (
  <RoleBasedRoute allowedRoles={allowedRoles}>
    <PrivateRoute>{element}</PrivateRoute>
  </RoleBasedRoute>
);

const ADMIN_ONLY = ["Admin"];
const ADMIN_MODERATOR = ["Admin", "Moderator"];

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
          element={roleRoute(
            <AdminDashboard />,
            ADMIN_MODERATOR
          )}
        />
        <Route
          path="/all-users"
          element={roleRoute(
            <AllUsersList />,
            ADMIN_ONLY
          )}
        />
        
        <Route
          path="/tribe-groups"
          element={roleRoute(
            <TribesGroupList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/tribes"
          element={roleRoute(
            <TribesList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/app-banner"
          element={roleRoute(
            <AppBannerList />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/user/:id"
          element={roleRoute(
            <ViewUser />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/roles"
          element={roleRoute(
            <RolesList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/role"
          element={roleRoute(
            <CreateNewRole />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/role/:id"
          element={roleRoute(
            <CreateNewRole />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/staff"
          element={roleRoute(
            <StaffList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/retailer"
          element={roleRoute(
            <RetailerList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/campus"
          element={roleRoute(
            <CampusList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/reports-campus"
          element={roleRoute(
            <CampusReport />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/reports-retailer"
          element={roleRoute(
            <RetailerReport />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/modules"
          element={roleRoute(
            <ModulesList />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/tiers"
          element={roleRoute(
            <TiersList />,
            ADMIN_ONLY
          )}
        />

        <Route
          path="/flagged-keywords"
          element={roleRoute(
            <FlaggedKeywordsList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/hot-take"
          element={roleRoute(
            <HotTakeList />,
            ADMIN_MODERATOR
          )}
        />
        <Route
          path="/deep-dive"
          element={roleRoute(
            <DeepDiveList />,
            ADMIN_MODERATOR
          )}
        />
        <Route
          path="/vibe-check"
          element={roleRoute(
            <VibeCheckList />,
            ADMIN_MODERATOR
          )}
        />
        <Route
          path="/moderation-queue"
          element={roleRoute(
            <ModerationQueue />,
            ADMIN_MODERATOR
          )}
        />
        <Route
          path="/device-brands"
          element={roleRoute(
            <DeviceBrandsList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/device-models"
          element={roleRoute(
            <DeviceModelList />,
            ADMIN_ONLY
          )}
        />
        <Route
          path="/top-pics"
          element={roleRoute(
            <TopPicsList />,
            ADMIN_MODERATOR
          )}
        />

        
      </Routes>
    </Router>
  );
}
