import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PrivateLayout from "../Layout/PrivateLayout";
import { useDispatch, useSelector } from "react-redux";
import { authAxios } from "../Config/config";
import { logout } from "../Redux/Reducers/authSlice";
import { persistor } from "../Redux/store";

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const accessToken = "dummy_access_token_123456"
  // const { accessToken, user } = useSelector((state) => state.auth);

  // console.log(user?.id, 'user');

  // useEffect(() => {
  //   if (!accessToken) return;

  //   const validateUser = async () => {
  //     try {
  //       const res = await authAxios().get("/staff/fetch/all");
  //       const staffList = res?.data?.data || [];

  //       // Check if current user exists in staff list
  //       const userExists = staffList.some(staff => staff.id === user?.id);

  //       // AUTO LOGOUT IF:
  //       // 1) API status is false
  //       // 2) Staff list is empty
  //       // 3) Current user's ID not found in staff list (user was deleted)
  //       if (!res.data?.status || staffList.length === 0 || !userExists) {
  //         handleLogout();
  //       }
  //     } catch (err) {
  //       console.error("Staff validation failed:", err);
  //       handleLogout();
  //     }
  //   };

  //   const handleLogout = () => {
  //     dispatch(logout());
  //     persistor.purge();
  //     // Optional: Clear all localStorage items if needed
  //     // localStorage.clear();
  //   };

  //   validateUser();
  // }, [accessToken, dispatch, user?.id, location.pathname]);

  // Check authentication before rendering
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}