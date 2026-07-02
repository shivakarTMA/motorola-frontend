import React, { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
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
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = ({ setLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await apiAxios().post("/auth/login", {
        email: data.email,
        password: data.password,
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
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden justify-center">
      <div className="w-full flex items-center justify-center">
        <div className="lg:p-2 p-5 transform transition-all duration-300 max-w-[450px] w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={Logo} alt="logo" width={150} height={30} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <div className="relative flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
                <span className="flex items-center justify-center w-12 h-14 text-gray-500 pl-2">
                  <MdEmail className="w-5 h-5" />
                </span>

                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="flex-1 h-14 px-2 focus:outline-none"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="relative flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
                <span className="flex items-center justify-center w-12 h-14 text-gray-500 pl-2">
                  <RiLockPasswordFill className="w-5 h-5" />
                </span>

                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="flex-1 h-14 px-2 focus:outline-none w-full"
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-[var(--primarycolor)] text-white font-semibold rounded-xl"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);
