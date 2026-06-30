import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Assests/Images/logo.png";
import { useSelector } from "react-redux";
import { FaAngleDown, FaCircle } from "react-icons/fa";
import dashboardIcon from "../../Assests/Images/icons/dashboard.svg";
import { MdDashboard } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import {
  MdGroups,
  MdCampaign,
  MdAssessment,
  MdAdminPanelSettings,
  MdBadge,
  MdSettings,
} from "react-icons/md";

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
            width="122"
            height="120"
            className="mx-auto"
          />
        </Link>
      </div>

      <div className="mt-0 sidebar--menu--list">
        <p className="text-[#949494] text-uppercase menu--head mb-3 px-[17px]">
          Overview
        </p>
        <div className="space-y-1 menu--list">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <MdDashboard className="menu--icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
          <div
            className="nav-link d-flex justify-between align-items-center mb-2 dropdown--menu"
            onClick={() => toggleMenu("users")}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center">
              <HiUsers className="menu--icon" />
              <span className="nav-text">Users</span>
            </div>
            <FaAngleDown
              className={`downmenu transition ${
                dropdownToggles["users"] ? "rotate-[180deg]" : ""
              }`}
            />
          </div>

          {dropdownToggles["users"] && (
            <div className="pl-[40px] relative dropdown--menu--nav">
              <div className="absolute h-[calc(100%-15px)] w-[2px] bg-black left-[44px] top-[8px]"></div>
              <Link
                to="/all-users"
                className="text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item"
              >
                <FaCircle className="menu--icon !text-[10px]" />
                <span className="nav-text">All Users</span>
              </Link>
              <Link
                to="/banned-users"
                className="text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item"
              >
                <FaCircle className="menu--icon !text-[10px]" />
                <span className="nav-text">Banned Users</span>
              </Link>
              <Link
                to="/circle-moderator"
                className="text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item"
              >
                <FaCircle className="menu--icon !text-[10px]" />
                <span className="nav-text">Circle Moderators</span>
              </Link>
            </div>
          )}

          <Link
            to="/circles"
            className={`nav-link ${location.pathname === "/circles" ? "active" : ""}`}
          >
            <MdGroups className="menu--icon" />
            <span className="nav-text">Circles</span>
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
