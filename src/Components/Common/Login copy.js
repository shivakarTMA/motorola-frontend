import React, { useState, useEffect } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import IsLoadingHOC from "./IsLoadingHOC";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessToken,
  setIsAuthenticated,
  setUser,
  setUserType,
} from "../../Redux/Reducers/authSlice";
import Logo from "../../Assests/Images/logo.png";
import LoginBg from "../../Assests/Images/login-bg.webp";
import { apiAxios } from "../../Config/config";

const Login = (props) => {
  const { setLoading } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  const [data, setData] = useState({ identifier: "", otp: "" });
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isPhoneValid = /^\d{10}$/.test(data.identifier);
  const isOtpValid = /^\d{6}$/.test(data.otp);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      try {
        setLoading(true);
        const response = await apiAxios().post("/auth/send-otp", {
          mobile: data.identifier,
        });

        if (response.data.success) {
          setCurrentUser({ mobile: data.identifier });
          toast.success(response.data.message || "OTP sent successfully");
          setStep(2);
        } else {
          toast.error(response.data.message || "Failed to send OTP");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Invalid phone number or email",
        );
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      try {
        setLoading(true);
        const response = await apiAxios().post("/auth/login", {
          mobile: currentUser.mobile,
          otp: data.otp,
        });

        if (response.data.success) {
          const { token, staff } = response.data.data;

          dispatch(setAccessToken(token));
          dispatch(
            setUser({
              id: staff.id,
              name: staff.name,
              email: staff.email,
              role: staff.role_id,
            }),
          );
          dispatch(setUserType(staff.role_id));
          dispatch(setIsAuthenticated(true));

          toast.success(response.data.message);
          navigate("/");
        } else {
          toast.error(response.data.message || "Login failed");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col">
      {/* Left panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <img src={Logo} alt="logo" width={36} height={36} />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-5">
            {step === 1
              ? "Welcome back, please enter your details"
              : `Enter the 6-digit code sent to ${currentUser?.mobile || ""}`}
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <div
                  className={`relative flex items-center bg-white rounded-xl border-2 transition-colors ${
                    isPhoneValid
                      ? "border-green-400"
                      : "border-gray-200 focus-within:border-blue-400"
                  }`}
                >
                  <span className="flex items-center justify-center w-12 h-14 text-gray-400 pl-2">
                    <FaPhoneAlt className="w-4 h-4" />
                  </span>
                  {/* <input
                    name="identifier"
                    type="text"
                    value={data.identifier}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={10}
                    pattern="\d{10}"
                    className="flex-1 h-14 px-2 bg-transparent focus:outline-none text-gray-900"
                    placeholder="Enter 10-digit phone number"
                  /> */}
                  <input
                    name="identifier"
                    type="text"
                    value={data.identifier}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={10}
                    pattern="\d{10}"
                    className="flex-1 h-14 px-2 focus:outline-none"
                    placeholder="Enter 10-digit phone number"
                  />
                  {isPhoneValid && (
                    <span className="pr-4 text-green-500">
                      <IoCheckmarkCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Enter OTP
                </label>
                <div
                  className={`relative flex items-center bg-white rounded-xl border-2 transition-colors ${
                    isOtpValid
                      ? "border-green-400"
                      : "border-gray-200 focus-within:border-blue-400"
                  }`}
                >
                  <span className="flex items-center justify-center w-12 h-14 text-gray-400 pl-2">
                    <RiLockPasswordFill className="w-4 h-4" />
                  </span>
                  <input
                    name="otp"
                    type="text"
                    value={data.otp}
                    onChange={handleChange}
                    required
                    minLength={6}
                    maxLength={6}
                    className="flex-1 h-14 px-2 bg-transparent focus:outline-none text-gray-900 tracking-widest text-lg"
                    placeholder="000000"
                  />
                  {isOtpValid && (
                    <span className="pr-4 text-green-500">
                      <IoCheckmarkCircle className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-xl"
            >
              {step === 1 ? "Continue" : "Verify & Login"}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setData({ identifier: "", otp: "" });
                  setCurrentUser(null);
                }}
                className="w-full text-sm text-gray-500 font-medium hover:text-gray-700"
              >
                ← Change phone number
              </button>
            )}
          </form>

          {/* <p className="text-xs text-gray-400 mt-10 leading-relaxed">
            Join the millions of smart investors who trust us to manage their
            finances. Log in to access your personalized dashboard, track
            your portfolio performance, and make informed investment
            decisions.
          </p> */}
        </div>
      </div>

      {/* Right panel - illustration */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-300 to-blue-500 items-center justify-center overflow-hidden" style={{
        backgroundImage:`url(${LoginBg})`,
        backgroundSize:'cover',
        backgroundPosition:'center'
      }}>
        
      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);