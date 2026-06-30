import React, { useState, useEffect } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
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

const Login = (props) => {
  const { setLoading } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  const [data, setData] = useState({ identifier: "", otp: "" });
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  // Redirect to home if already logged in
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (step === 1) {
  //     try {
  //       setLoading(true);
  //       // Send request to /staff/login with mobile
  //       const response = await apiAxios().post("staff/login", {
  //         mobile: data.identifier,
  //       });

  //       if (response.data.status) {
  //         setCurrentUser({ mobile: data.identifier });
  //         toast.success(response.data.message || "OTP sent successfully");
  //         setStep(2);
  //       } else {
  //         toast.error(response.data.message || "Failed to send OTP");
  //       }
  //     } catch (error) {
  //       toast.error(
  //         error.response?.data?.message || "Invalid phone number or email"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else if (step === 2) {
  //     try {
  //       setLoading(true);
  //       // Send request to /staff/otp/verify with mobile and OTP
  //       const response = await apiAxios().post("staff/otp/verify", {
  //         mobile: currentUser.mobile,
  //         otp: data.otp,
  //       });

  //       if (response.data.status) {
  //         const result = response.data.data;

  //         dispatch(setAccessToken(result.access_token));
  //         dispatch(
  //           setUser({
  //             id: result.id,
  //             name: result.name,
  //             mobile: result.mobile,
  //             role: result.role,
  //           })
  //         );
  //         dispatch(setUserType(result.role));
  //         dispatch(setIsAuthenticated(true));

  //         toast.success(response.data.message || "Login successful");
  //         navigate("/");
  //       } else {
  //         toast.error(response.data.message || "Invalid OTP");
  //       }
  //     } catch (error) {
  //       toast.error(error.response?.data?.message || "Invalid OTP");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setLoading(true);

      setTimeout(() => {
        if (data.identifier === "8700704309") {
          setCurrentUser({ mobile: data.identifier });
          toast.success("OTP sent successfully");
          setStep(2);
        } else {
          toast.error("Invalid phone number");
        }

        setLoading(false);
      }, 1000);
    } else if (step === 2) {
      setLoading(true);

      setTimeout(() => {
        if (data.otp === "123456") {
          const dummyUser = {
            access_token: "dummy_access_token_123456",
            id: 1,
            name: "John Doe",
            mobile: currentUser.mobile,
            role: "Admin",
          };

          dispatch(setAccessToken(dummyUser.access_token));
          dispatch(
            setUser({
              id: dummyUser.id,
              name: dummyUser.name,
              mobile: dummyUser.mobile,
              role: dummyUser.role,
            })
          );
          dispatch(setUserType(dummyUser.role));
          dispatch(setIsAuthenticated(true));

          toast.success("Login successful");
          navigate("/");
        } else {
          toast.error("Invalid OTP");
        }

        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden justify-center">

      <div className="w-full flex items-center justify-center">
        <div className="lg:p-2 p-5 transform transition-all duration-300 max-w-[450px] w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center  mb-4 ">
              <img src={Logo} alt="logo" width={150} height={30} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-2 animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <div className="relative flex items-center bg-white rounded-xl border-2 border-gray-200">
                  <span className="flex items-center justify-center w-12 h-14 text-gray-500 pl-2">
                    <FaPhoneAlt className="w-5 h-5" />
                  </span>
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
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2 animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700">
                  Enter OTP
                </label>

                <div className="relative flex items-center bg-white rounded-xl border-2 border-gray-200">
                  <span className="flex items-center justify-center w-12 h-14 text-gray-500 pl-2">
                    <RiLockPasswordFill className="w-5 h-5" />
                  </span>
                  <input
                    name="otp"
                    type="text"
                    value={data.otp}
                    onChange={handleChange}
                    required
                    minLength={6}
                    maxLength={6}
                    className="flex-1 h-14 px-2 focus:outline-none tracking-widest text-lg"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 bg-[var(--primarycolor)] text-white font-semibold rounded-xl"
            >
              {step === 1 ? "Send OTP" : "Verify & Login"}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setData({ identifier: "", otp: "" });
                  setCurrentUser(null);
                }}
                className="w-full text-sm text-gray-600 font-medium"
              >
                ← Change phone number
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);
