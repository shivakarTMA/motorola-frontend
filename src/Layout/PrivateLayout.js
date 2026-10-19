import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Common/Sidebar";
import Topbar from "../Components/Common/Topbar";
import { Link, matchPath, useLocation } from "react-router-dom";

export default function PrivateLayout({ children }) {
  const [toggleMenuBar, setToggleMenuBar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setToggleMenuBar(false);
  }, [location.pathname]);

  // Map route paths to titles
  const pageRoutes = [
    { path: "/", title: "Dashboard" },
    { path: "/all-users", title: "All Users" },
    { path: "/banned-users", title: "Banned Users" },
    { path: "/circle-moderator", title: "Circle Moderators" },
    { path: "/user/:id", title: "View User" },
    { path: "/tribe-groups", title: "Tribe Groups" },
    { path: "/tribes", title: "Tribes" },
    { path: "/app-banner", title: "App Banner" },
    { path: "/roles", title: "Roles" },
    { path: "/role", title: "Create Role" },
    { path: "/role/:id", title: "Edit Role" },
    { path: "/staff", title: "Staff List" },
    { path: "/modules", title: "Modules" },
    { path: "/tiers", title: "Tiers" },
    { path: "/flagged-keywords", title: "Flagged Keywords" },
    { path: "/hot-take", title: "Hot Take" },
    { path: "/deep-dive", title: "Deep Dive" },
    { path: "/vibe-check", title: "Vibe Check" },
    { path: "/moderation-queue", title: "Moderation Queue" },
    { path: "/device-brands", title: "Device Brands" },
    { path: "/device-models", title: "Device Models" },
    { path: "/top-pics", title: "Top Picks" },
    { path: "/retailer", title: "Retailer List" },
    { path: "/campus", title: "Campus List" },
    { path: "/reports-campus", title: "Campus Ambassador Report" },
    { path: "/reports-retailer", title: "Retailer Report" },
  ];

  const pageTitle =
    pageRoutes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname),
    )?.title || "Page";

  return (
    <>
      <div className="flex  h-full w-full">
        {toggleMenuBar && (
          <div
            className="overlay--sidebar"
            onClick={() => setToggleMenuBar(false)}
          ></div>
        )}
        <Sidebar
          toggleMenuBar={toggleMenuBar}
          setToggleMenuBar={setToggleMenuBar}
        />
        <div
          className={`${
            toggleMenuBar ? "w-[calc(100%-100px)]" : "w-[calc(100%-230px)]"
          } ml-[auto] side--content--area transition duration-150] flex flex-col h-screen`}
        >
          <Topbar
            setToggleMenuBar={setToggleMenuBar}
            toggleMenuBar={toggleMenuBar}
            pageTitle={pageTitle}
          />
          <div className="content--area lg:p-5 p-3">{children}</div>
          <div className="footer--area p-3 text-center text-[12px] text-gray-500 mt-auto">
            Powered by <Link to="https://www.themarcomavenue.com/" target="_blank" rel="noopener noreferrer" className="text-black underline hover:underline">
              The Marcom Avenue
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
