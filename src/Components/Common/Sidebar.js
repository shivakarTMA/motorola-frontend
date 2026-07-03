import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Assests/Images/logo.png";
import { useSelector } from "react-redux";
import { FaAngleDown, FaCircle, FaLayerGroup } from "react-icons/fa";
import dashboardIcon from "../../Assests/Images/icons/dashboard.svg";
import { MdControlCamera, MdDashboard, MdFormatListBulleted, MdManageAccounts, MdTextFormat } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import {
  MdGroups,
  MdCampaign,
  MdAssessment,
  MdAdminPanelSettings,
  MdBadge,
  MdSettings,
} from "react-icons/md";
import { IoIosGift } from "react-icons/io";
import { TbSitemapFilled } from "react-icons/tb";

const Sidebar = ({ toggleMenuBar, setToggleMenuBar }) => {
  const location = useLocation();
  const { userType } = useSelector((state) => state.auth);

  const [dropdownToggles, setDropdownToggles] = useState({});

  const toggleMenu = (menuKey) => {
    setDropdownToggles((prev) => {
      const newState = {};

      // If the same menu is clicked, toggle it; otherwise, open the new one only
      if (!prev[menuKey]) {
        newState[menuKey] = true;
      }

      return newState;
    });

    if (window.innerWidth > 1200) {
      setToggleMenuBar(false);
    }
  };
  useEffect(() => {
    if (toggleMenuBar) {
      setDropdownToggles({});
    }
  }, [toggleMenuBar]);

  return (
    <div className={`sidebar ${toggleMenuBar ? "activetoggle" : ""}`}>
      <div className="sidebar-logo d-flex align-items-center">
        <Link to="/" className="text-center">
          <img
            src={Logo}
            alt="logo"
          width="112"
            height="100"
            className="mx-auto"
          />
        </Link>
      </div>

      <div className="mt-0 sidebar--menu--list">
        <p className="text-[#949494] text-uppercase menu--head mb-3 px-[17px]">
          Overview
        </p>
        <div className="space-y-0 menu--list">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <MdDashboard className="menu--icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link
            to="/all-users"
            className={`nav-link ${location.pathname === "/all-users" ? "active" : ""}`}
          >
            <HiUsers className="menu--icon" />
            <span className="nav-text">Users</span>
          </Link>

          {/* <div
            className="nav-link d-flex justify-between align-items-center mb-2 dropdown--menu"
            onClick={() => toggleMenu("circles")}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center">
              <MdGroups className="menu--icon" />
              <span className="nav-text">Tribes</span>
            </div>
            <FaAngleDown
              className={`downmenu transition ${
                dropdownToggles["circles"] ? "rotate-[180deg]" : ""
              }`}
            />
          </div>

          {dropdownToggles["circles"] && (
            <div className="pl-[40px] relative dropdown--menu--nav">
              <div className="absolute h-[calc(100%-15px)] w-[2px] bg-black left-[44px] top-[8px]"></div>
              <Link
                to="/tribes"
                className="text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item"
              >
                <FaCircle className="menu--icon !text-[10px]" />
                <span className="nav-text">Tribes</span>
              </Link>
              <Link
                to="/sub-tribes"
                className="text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item"
              >
                <FaCircle className="menu--icon !text-[10px]" />
                <span className="nav-text">Sub-Tribes</span>
              </Link>
            </div>
          )} */}

          <Link
            to="/tribes-groups"
            className={`nav-link ${location.pathname === "/tribes-groups" ? "active" : ""}`}
          >
            <FaLayerGroup className="menu--icon" />
            <span className="nav-text">Tribes Groups</span>
          </Link>

          <Link
            to="/tribes"
            className={`nav-link ${location.pathname === "/tribes" ? "active" : ""}`}
          >
            <TbSitemapFilled className="menu--icon" />
            <span className="nav-text">Tribes</span>
          </Link>


          <Link
            to="/app-banner"
            className={`nav-link ${location.pathname === "/app-banner" ? "active" : ""}`}
          >
            <MdCampaign className="menu--icon" />
            <span className="nav-text">App Banner</span>
          </Link>

          <Link
            to="/reports"
            className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`}
          >
            <MdAssessment className="menu--icon" />
            <span className="nav-text">Reports</span>
          </Link>

          <Link
            to="/moderation-queue"
            className={`nav-link ${location.pathname === "/moderation-queue" ? "active" : ""}`}
          >
            <MdAdminPanelSettings className="menu--icon" />
            <span className="nav-text">Moderation Queue</span>
          </Link>

          <Link
            to="/staff"
            className={`nav-link ${location.pathname === "/staff" ? "active" : ""}`}
          >
            <MdBadge className="menu--icon" />
            <span className="nav-text">Staff</span>
          </Link>

          <Link
            to="/roles"
            className={`nav-link ${location.pathname === "/roles" ? "active" : ""}`}
          >
            <MdManageAccounts className="menu--icon" />
            <span className="nav-text">Roles</span>
          </Link>

          <Link
            to="/modules"
            className={`nav-link ${location.pathname === "/modules" ? "active" : ""}`}
          >
            <MdControlCamera className="menu--icon" />
            <span className="nav-text">Modules</span>
          </Link>

          <Link
            to="/tiers"
            className={`nav-link ${location.pathname === "/tiers" ? "active" : ""}`}
          >
            <IoIosGift className="menu--icon" />
            <span className="nav-text">Tiers</span>
          </Link>

          <Link
            to="/flagged-keywords"
            className={`nav-link ${location.pathname === "/flagged-keywords" ? "active" : ""}`}
          >
            <MdTextFormat className="menu--icon" />
            <span className="nav-text">Flagged Keywords</span>
          </Link>

          <Link
            to="/settings"
            className={`nav-link ${location.pathname === "/settings" ? "active" : ""}`}
          >
            <MdSettings className="menu--icon" />
            <span className="nav-text">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
