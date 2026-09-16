import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PrivateLayout from "../Layout/PrivateLayout";
import { useDispatch, useSelector } from "react-redux";
import { authAxios } from "../Config/config";
import { logout } from "../Redux/Reducers/authSlice";
import { persistor } from "../Redux/store";
import { logoutUser } from "../Redux/thunks/authThunk";
import { toast } from "react-toastify";
import { IoCloseCircle } from "react-icons/io5";

// setTimeout can only safely schedule up to ~24.8 days (2^31 - 1 ms).
// Sessions are expected to be much shorter than that, but this guards
// against a runaway/huge session_expires_at value.
const MAX_TIMEOUT_MS = 2147483647;

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken, user, sessionExpiresAt } = useSelector(
    (state) => state.auth,
  );

  const [showPopup, setShowPopup] = useState(false);
  // Distinguishes *why* the session ended, so the popup copy can match.
  const [sessionEndReason, setSessionEndReason] = useState(null); // "expired" | "device"
  const isLoggingOut = useRef(false);

  // ✅ CENTRAL LOGOUT HANDLER (API ALWAYS CALLED)
  const logoutAndRedirect = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      // ✅ ALWAYS call API manually
      await authAxios().get("/auth/expires/token");
    } catch (e) {
      // ignore error
    }

    try {
      await dispatch(logoutUser()).unwrap(); // optional (keeps consistency)
    } catch {}

    persistor.purge();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!accessToken) return;

    const validateUser = async () => {
      try {
        const res = await authAxios().get("/staff");
        const staffList = res?.data?.data?.items || [];

        // Check if current user exists in staff list
        const userExists = staffList.some((staff) => staff.id === user?.id);

        // AUTO LOGOUT IF:
        // 1) API status is false
        // 2) Staff list is empty
        // 3) Current user's ID not found in staff list (user was deleted)
        if (!res.data?.success || staffList.length === 0 || !userExists) {
          handleSilentLogout();
        }
      } catch (err) {
        console.error("Staff validation failed:", err);
        handleSilentLogout();
      }
    };

    const handleSilentLogout = () => {
      dispatch(logout());
      persistor.purge();
      // Optional: Clear all localStorage items if needed
      // localStorage.clear();
    };

    validateUser();
  }, [accessToken, dispatch, user?.id, location.pathname]);

  /* =========================
     3️⃣ SESSION VALIDATION — catches "logged in from another device"
     (server invalidates the token, this poll notices via a 401)
  ========================== */
  useEffect(() => {
    if (!accessToken) return;

    let isCancelled = false;

    const checkSession = async () => {
      try {
        await authAxios().get("/auth/check/active");
      } catch (error) {
        if (!isCancelled && error?.response?.status === 401) {
          setSessionEndReason("device");
          setShowPopup(true);
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 10000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [accessToken]);

  /* =========================
     4️⃣ SESSION EXPIRY TIMER — proactively ends the session client-side
     the instant session_expires_at is reached, instead of waiting for
     a failed request to reveal it.
  ========================== */
  useEffect(() => {
    if (!accessToken || !sessionExpiresAt) return;

    const expiryTime = new Date(sessionExpiresAt).getTime();

    if (Number.isNaN(expiryTime)) return;

    const msUntilExpiry = expiryTime - Date.now();

    // Already expired (e.g. tab was reopened after the session lapsed)
    if (msUntilExpiry <= 0) {
      setSessionEndReason("expired");
      setShowPopup(true);
      return;
    }

    const delay = Math.min(msUntilExpiry, MAX_TIMEOUT_MS);
    const timeoutId = setTimeout(() => {
      setSessionEndReason("expired");
      setShowPopup(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [accessToken, sessionExpiresAt]);

  const handleLogout = () => {
    toast.dismiss();
    logoutAndRedirect();
  };

  // Check authentication before rendering
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const popupMessage =
    sessionEndReason === "expired"
      ? "Your session has expired. Please log in again."
      : "You have been logged out since you have logged in from another computer.";

  return (
    <>
      <PrivateLayout>{children}</PrivateLayout>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 py-6 rounded shadow-lg text-center max-w-[300px] w-full relative">
            <button
              onClick={handleLogout}
              className="absolute top-[-5px] right-[-5px] bg-white rounded-full"
            >
              <IoCloseCircle className="text-2xl" />
            </button>

            <p className="mb-2 text-lg font-semibold">
              {sessionEndReason === "expired" ? "Session Expired" : "Session Ended"}
            </p>

            <p className="mb-4 text-[12px] font-[500]">{popupMessage}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded max-w-[100px] w-full"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}