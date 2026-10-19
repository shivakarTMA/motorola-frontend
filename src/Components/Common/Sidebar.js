import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Assests/Images/logo.png";
import { FaAngleDown, FaCircle, FaLayerGroup, FaUserTie, FaBuilding } from "react-icons/fa";
import { SiGooglesheets } from "react-icons/si";
import { MdDashboard, MdDevices, MdTextFormat, MdAdminPanelSettings, MdBadge, MdSettings } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { TbSitemapFilled } from "react-icons/tb";
import { RiArticleFill, RiPushpin2Fill } from "react-icons/ri";

const Sidebar = ({ toggleMenuBar, setToggleMenuBar }) => {
  const location = useLocation();
  const [dropdownToggles, setDropdownToggles] = useState({});

  const toggleMenu = (menuKey) => {
    setDropdownToggles((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));

    if (window.innerWidth > 1200) {
      setToggleMenuBar(false);
    }
  };

  useEffect(() => {
    if (toggleMenuBar) {
      setDropdownToggles({});
    }
  }, [toggleMenuBar]);

  // Keep the relevant parent menus open when a nested route is active.
  useEffect(() => {
    const path = location.pathname;

    setDropdownToggles((prev) => ({
      ...prev,
      posts: ["/hot-take", "/deep-dive", "/vibe-check"].includes(path)
        ? true
        : prev.posts,
      configuration: [
        "/device-brands",
        "/device-models",
        "/staff",
        "/retailer",
        "/campus",
        "/app-banner",
        "/flagged-keywords",
      ].includes(path)
        ? true
        : prev.configuration,
      devices: ["/device-brands", "/device-models"].includes(path)
        ? true
        : prev.devices,
      reports: ["/reports-campus", "/reports-retailer"].includes(path)
        ? true
        : prev.reports,
    }));
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const submenuClass = (path) =>
    `text-black flex items-center gap-[5px] mb-2 text-sm dropdown--nav--item ${
      isActive(path) ? "active" : ""
    }`;

  const renderSubmenuItem = (to, label) => (
    <Link to={to} className={submenuClass(to)} key={to}>
      <FaCircle className="menu--icon !text-[10px]" />
      <span className="nav-text">{label}</span>
    </Link>
  );

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
          {/* Dashboard */}
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            <MdDashboard className="menu--icon" />
            <span className="nav-text">Dashboard</span>
          </Link>

          {/* Post */}
          <div
            className="nav-link d-flex justify-between align-items-center mb-2 dropdown--menu"
            onClick={() => toggleMenu("posts")}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center">
              <RiArticleFill className="menu--icon" />
              <span className="nav-text">Post</span>
            </div>
            <FaAngleDown
              className={`downmenu transition ${
                dropdownToggles.posts ? "rotate-[180deg]" : ""
              }`}
            />
          </div>

          {dropdownToggles.posts && (
            <div className="pl-[40px] relative dropdown--menu--nav">
              <div className="absolute h-[calc(100%-15px)] w-[2px] bg-black left-[44px] top-[8px]" />
              {renderSubmenuItem("/hot-take", "Hot Take")}
              {renderSubmenuItem("/deep-dive", "Deep Dive")}
              {renderSubmenuItem("/vibe-check", "Vibe Check")}
            </div>
          )}

          {/* Moderation Queue */}
          <Link
            to="/moderation-queue"
            className={`nav-link ${isActive("/moderation-queue") ? "active" : ""}`}
          >
            <MdAdminPanelSettings className="menu--icon" />
            <span className="nav-text">Moderation Queue</span>
          </Link>

          {/* All Users */}
          <Link
            to="/all-users"
            className={`nav-link ${isActive("/all-users") ? "active" : ""}`}
          >
            <HiUsers className="menu--icon" />
            <span className="nav-text">All Users</span>
          </Link>

          {/* Tribe Groups */}
          <Link
            to="/tribe-groups"
            className={`nav-link ${isActive("/tribe-groups") ? "active" : ""}`}
          >
            <FaLayerGroup className="menu--icon" />
            <span className="nav-text">Tribe Groups</span>
          </Link>

          {/* Tribes */}
          <Link
            to="/tribes"
            className={`nav-link ${isActive("/tribes") ? "active" : ""}`}
          >
            <TbSitemapFilled className="menu--icon" />
            <span className="nav-text">Tribes</span>
          </Link>

          {/* Top Picks */}
          <Link
            to="/top-pics"
            className={`nav-link ${isActive("/top-pics") ? "active" : ""}`}
          >
            <RiPushpin2Fill className="menu--icon" />
            <span className="nav-text">Top Picks</span>
          </Link>

          {/* Configuration */}
          <div
            className="nav-link d-flex justify-between align-items-center mb-2 dropdown--menu"
            onClick={() => toggleMenu("configuration")}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center">
              <MdSettings className="menu--icon" />
              <span className="nav-text">Configuration</span>
            </div>
            <FaAngleDown
              className={`downmenu transition ${
                dropdownToggles.configuration ? "rotate-[180deg]" : ""
              }`}
            />
          </div>

          {dropdownToggles.configuration && (
            <div className="pl-[36px] relative dropdown--menu--nav pr-[17px]">
              <div className="absolute h-[calc(100%-15px)] w-[2px] bg-black left-[40px] top-[8px]" />

              {/* Devices */}
              <div
                className="text-black flex justify-between items-center mb-2 text-sm dropdown--nav--item"
                onClick={() => toggleMenu("devices")}
                style={{ cursor: "pointer" }}
              >
                <div className="flex items-center gap-[5px]">
                  <FaCircle className="menu--icon !text-[10px]" />
                  <span className="nav-text">Devices</span>
                </div>
                <FaAngleDown
                  className={`downmenu transition ${
                    dropdownToggles.devices ? "rotate-[180deg]" : ""
                  }`}
                />
              </div>

              {dropdownToggles.devices && (
                <div className="pl-[6px] relative">
                  <Link
                    to="/device-brands"
                    className={`${submenuClass("/device-brands")} submenu-link`}
                  >
                    <span className="nav-text">Brands</span>
                  </Link>

                  <Link
                    to="/device-models"
                    className={`${submenuClass("/device-models")} submenu-link`}
                  >
                    <span className="nav-text">Models</span>
                  </Link>
                </div>
              )}

              {renderSubmenuItem("/staff", "Staff List")}
              {renderSubmenuItem("/retailer", "Retailer List")}
              {renderSubmenuItem("/campus", "Campus List")}
              {renderSubmenuItem("/app-banner", "App Banner")}
              {renderSubmenuItem("/flagged-keywords", "Flagged Keywords")}
            </div>
          )}

          {/* Reports */}
          <div
            className="nav-link d-flex justify-between align-items-center mb-2 dropdown--menu"
            onClick={() => toggleMenu("reports")}
            style={{ cursor: "pointer" }}
          >
            <div className="flex items-center">
              <SiGooglesheets className="menu--icon" />
              <span className="nav-text">Reports</span>
            </div>
            <FaAngleDown
              className={`downmenu transition ${
                dropdownToggles.reports ? "rotate-[180deg]" : ""
              }`}
            />
          </div>

          {dropdownToggles.reports && (
            <div className="pl-[40px] relative dropdown--menu--nav">
              <div className="absolute h-[calc(100%-15px)] w-[2px] bg-black left-[44px] top-[8px]" />
              {renderSubmenuItem(
                "/reports-campus",
                "Campus Ambassador Report"
              )}
              {renderSubmenuItem("/reports-retailer", "Retailer Report")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
