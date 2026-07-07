import React, { useState, useEffect, useRef } from "react";
import { RiLoginBoxLine } from "react-icons/ri";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
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
import { apiAxios } from "../../Config/config";
import { blockOnlyNumericKeys, sanitizeOnlyNumeric } from "../../Helper/Inputhelpers";


const OTP_LENGTH = 6;
const PHONE_LENGTH = 10;

const Login = (props) => {
  const { setLoading } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken]);

  const isPhoneValid = /^\d{10}$/.test(phone);
  const otpValue = otp.join("");
  const isOtpValid = /^\d{6}$/.test(otpValue);

  const handlePhoneChange = (e) => {
    const sanitized = sanitizeOnlyNumeric(e.target.value).slice(
      0,
      PHONE_LENGTH,
    );
    setPhone(sanitized);
  };

  const handleOtpChange = (index, e) => {
    const rawValue = e.target.value;
    const digit = sanitizeOnlyNumeric(rawValue).slice(-1); // keep last typed digit only

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Enforce numeric-only typing (reuses your shared helper)
    blockOnlyNumericKeys(e);

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
        setOtp((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = sanitizeOnlyNumeric(e.clipboardData.getData("text")).slice(
      0,
      OTP_LENGTH,
    );
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await apiAxios().post("/auth/send-otp", {
        mobile: phone,
      });

      if (response.data.success) {
        setCurrentUser({ mobile: phone });
        toast.success(response.data.message || "OTP sent successfully");
        setStep(2);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
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
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const response = await apiAxios().post("/auth/login", {
        mobile: currentUser.mobile,
        otp: otpValue,
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!isPhoneValid) {
        toast.error("Enter a valid 10-digit phone number");
        return;
      }
      handleSendOtp();
    } else {
      if (!isOtpValid) {
        toast.error("Enter the complete 6-digit OTP");
        return;
      }
      handleVerifyOtp();
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp(Array(OTP_LENGTH).fill(""));
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-white px-4 py-10">
      {/* Decorative cloud blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-white/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-full h-64 bg-white/60 rounded-full blur-3xl" />
      </div>

      {/* Logo top-left */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <img src={Logo} alt="logo" width={50} height={50} className="rounded-lg" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 sm:p-10">
        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center">
            <RiLoginBoxLine className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 mb-2">
            {step === 1 ? "Sign in with phone" : "Enter OTP"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed px-2">
            {step === 1
              ? "Make a new doc to bring your words, data, and teams together. For free."
              : `We've sent a 6-digit code to ${currentUser?.mobile || "your phone"}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div
              className={`flex items-center bg-white/70 rounded-xl border transition-colors px-3 h-14 ${
                isPhoneValid
                  ? "border-blue-400"
                  : "border-gray-200 focus-within:border-gray-400"
              }`}
            >
              <HiOutlinePhone className="w-6 h-6 text-gray-400 mr-2 rotate-0" />
              {/* Static +91 prefix — remove if not needed */}
              <span className="text-black text-md mr-2 select-none">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={blockOnlyNumericKeys}
                placeholder="Enter 10-digit phone number"
                maxLength={PHONE_LENGTH}
                className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border bg-white/70 focus:outline-none transition-colors ${
                    digit
                      ? "border-blue-400"
                      : "border-gray-200 focus:border-gray-400"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={step === 1 ? !isPhoneValid : !isOtpValid}
            className="w-full h-14 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl"
          >
            {step === 1 ? "Get Started" : "Verify & Login"}
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Change phone number
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);