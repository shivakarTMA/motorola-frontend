import React, { useState, useMemo, useEffect } from "react"; // Import React hooks
import Highcharts from "highcharts"; // Import Highcharts
import HighchartsReact from "highcharts-react-official"; // Import React wrapper for Highcharts
import Select from "react-select"; // Import react-select for dropdowns
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import { customStyles } from "../../Helper/helper";
import { Link } from "react-router-dom";
import { LuCalendar } from "react-icons/lu";
import { toast } from "react-toastify";
import { authAxios } from "../../Config/config";

const filterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "month_till_date", label: "Month till date" },
  { value: "custom", label: "Custom Date" },
];

const StatCard = ({ title, value, highlight = false, subtitle }) => {
  return (
    <div
      className={`rounded-lg border p-4 bg-white min-h-[95px]
      ${highlight ? "border-red-200 bg-red-50" : "border-gray-200"}`}
    >
      <h3 className="text-3xl font-semibold text-gray-800">
        {value || "-"}
      </h3>

      <p className="text-sm text-gray-500 mt-1">{title}</p>

      {subtitle && (
        <p className="text-xs text-red-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
};

const ActivityRow = ({
  type,
  message,
  moderator,
  time,
}) => {
  const styles = {
    Ban: "bg-orange-600 text-white",
    Hide: "bg-gray-200 text-gray-700",
    Mute: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            styles[type]
          }`}
        >
          {type}
        </span>

        <span className="text-gray-800">
          {message}
        </span>
      </div>

      <div className="text-sm text-gray-500">
        {moderator} · {time}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <>
      <div>
        <div className="space-y-6">

          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 lg:gap-4 gap-2">
            <StatCard title="Total Users" value="5,284" />
            <StatCard title="Active" value="4,210" />
            <StatCard title="Muted" value="36" />
            <StatCard title="Banned" value="58" />
            <StatCard title="New this week" value="214" />

            <StatCard
              title="Pending DPDP Consent"
              value="-"
              subtitle="Blocked: consent not modeled"
            />
          </div>

          {/* Middle Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Moderation Snapshot */}
            <div>
              <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide">
                Moderation Snapshot
              </h2>

              <div className="grid md:grid-cols-3 lg:gap-4 gap-2">
                <StatCard
                  title="Pending Flags"
                  value="27"
                  highlight
                  subtitle="Open queue →"
                />

                <StatCard title="Actions Taken Today" value="8" />

                <StatCard title="Auto-hidden Today" value="3" />
              </div>
            </div>

            {/* Content & Community */}
            <div>
              <h2 className="text-xl font-semibold mb-4 uppercase tracking-wide">
                Content & Community
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 lg:gap-4 gap-2">
                <StatCard title="Posts" value="12.4k" />
                <StatCard title="Polls" value="318" />
                <StatCard title="Comments" value="41k" />
                <StatCard title="Active Circles" value="46" />
                <StatCard title="Loyalty Pts" value="1.2M" />
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold uppercase">
                Recent Moderation Activity
              </h2>
            </div>

            <div className="px-4">
              <ActivityRow
                type="Ban"
                message="Post by Diya Patel — repeated spam links"
                moderator="Neha K"
                time="12m ago"
              />

              <ActivityRow
                type="Hide"
                message='Comment by Imran Khan — flagged keyword "crack tool"'
                moderator="Rohit S"
                time="38m ago"
              />

              <ActivityRow
                type="Mute"
                message="User Rahul Verma — abusive replies (24h)"
                moderator="Neha K"
                time="1h ago"
              />

              <ActivityRow
                type="Hide"
                message="Poll by Sneha Iyer — off-topic"
                moderator="Rohit S"
                time="2h ago"
              />

              <ActivityRow
                type="Ban"
                message="Post by Karan Mehta — counterfeit listing"
                moderator="Neha K"
                time="3h ago"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
