import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Common/Sidebar";
import Topbar from "../Components/Common/Topbar";
import { matchPath, useLocation } from "react-router-dom";

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
    { path: "/tribes", title: "Tribes" },
    { path: "/tribes-groups", title: "Tribes Groups" },
    { path: "/app-banner", title: "App Banner" },
    { path: "/roles", title: "Roles" },
    { path: "/role", title: "Create Role" },
    { path: "/role/:id", title: "Edit Role" },
    { path: "/staff", title: "Staff" },
    { path: "/modules", title: "Modules" },
    { path: "/tiers", title: "Tiers" },
    { path: "/flagged-keywords", title: "Flagged Keywords" },
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
          } ml-[auto] side--content--area transition duration-150]`}
        >
          <Topbar
            setToggleMenuBar={setToggleMenuBar}
            toggleMenuBar={toggleMenuBar}
            pageTitle={pageTitle}
          />
          <div className="content--area lg:p-5 p-3">{children}</div>
        </div>
      </div>
    </>
  );
}
