import React, { useEffect, useRef, useState } from "react";
import userIcon from "../../Assests/Images/icons/user.svg";
import logoutIcon from "../../Assests/Images/icons/logout.svg";
import ToggleMenu from "../../Assests/Images/icons/togglemenu.svg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../Redux/Reducers/authSlice";
import Tooltip from "./Tooltip";
import { IoIosSearch } from "react-icons/io";
import { authAxios } from "../../Config/config";
import { toast } from "react-toastify";

const Topbar = ({ setToggleMenuBar, toggleMenuBar, pageTitle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchRef = useRef(null);

  const searchUsers = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoadingSearch(true);

      const response = await authAxios().get("/dashboard/search", {
        params: {
          search: value,
        },
      });

      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setShowResults(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchItem);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchItem]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = () => {
    setToggleMenuBar(!toggleMenuBar);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(searchItem);
    setSearchItem("");
  };
  return (
    <>
      <section className="top--bar p-3 border-b border-b-[#D4D4D4]">
        <div className="inner--container flex lg:flex-nowrap flex-wrap justify-between gap-3">
          {/* Left Section */}
          <div className="topbar--left flex items-center gap-2 lg:w-[40%] w-[47%] order-1">
            <div
              className="toggle--bar lg:w-[32px] w-[25px]"
              onClick={handleToggleMenu}
            >
              <img src={ToggleMenu} className="cursor-pointer w-8" />
            </div>
            <h2 className="font-semibold lg:text-xl text-sm">{pageTitle}</h2>
          </div>

          <div className="search--global flex w-full lg:order-2 order-3">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-0 w-full"
            >
              <div className="w-full relative" ref={searchRef}>
                <span className="absolute lg:left-[15px] left-[10px] top-[50%] translate-y-[-50%]">
                  <IoIosSearch className="text-xl" />
                </span>
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Search users — name, mobile, or ID"
                  className="outline-none py-1 lg:min-h-[45px] min-h-[40px] w-full bg-gray-100 rounded-[10px] px-3 lg:pl-[45px] pl-[35px] lg:text-sm text-[12px]"
                  onFocus={() => {
                    if (searchResults.length) {
                      setShowResults(true);
                    }
                  }}
                />

                {showResults && (
                  <div className="absolute top-[50px] left-0 w-full bg-white rounded-lg shadow-lg border z-50">
                    {loadingSearch && (
                      <p className="p-3 text-sm text-gray-500">Searching...</p>
                    )}

                    {!loadingSearch && searchResults.length === 0 && (
                      <p className="p-3 text-sm text-gray-500">
                        No users found
                      </p>
                    )}

                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                        onClick={() => {
                          navigate(`/user/${user.id}`);
                          setSearchItem("");
                          setShowResults(false);
                        }}
                      >
                        <p className="font-semibold text-sm">{user.name}</p>

                        <p className="text-xs text-gray-500">
                          @{user.username} - {user.email}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* <button
                type="submit"
                className="text-white bg-black rounded-r-[10px] w-10 h-10 flex items-center justify-center cursor-pointer"
              >
                <IoIosSearch className="text-xl" />
              </button> */}
            </form>
          </div>

          {/* Right Section */}
          <div className="top--bar--menu flex items-center gap-3 lg:w-[40%] w-[45%] justify-end lg:order-3 order-2">
            <div className="flex gap-2 items-center">
              <p className="text-sm text-right leading-none">
                <span className="text-black font-semibold">{user?.name}</span>
                <br />
                <span className="text-[12px]">Super Admin</span>
              </p>
              <div className=" bg-[#EAEAEA] rounded-full items-center justify-center w-10 h-10 md:flex hidden">
                <img src={userIcon} className="w-4" />
              </div>

              <Tooltip id={`tooltip-guide`} content={`Logout`} place="left">
                <div
                  className="flex bg-[#EAEAEA] rounded-full items-center justify-center cursor-pointer w-10 h-10"
                  onClick={handleLogout}
                >
                  <img src={logoutIcon} className="w-4" />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Topbar;
