import React, { useState, useEffect } from "react"; // Import React hooks
import Select from "react-select"; // Import react-select for dropdowns
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import { Link } from "react-router-dom";
import { LuCalendar } from "react-icons/lu";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import { customStyles } from "../../../Helper/helper";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiEye,
  FiSlash,
  FiUserCheck,
  FiUserX,
  FiMoreVertical,
} from "react-icons/fi";

const StatCard = ({ title, value, highlight = false, subtitle }) => {
  return (
    <div
      className={`rounded-lg border p-4 bg-white min-h-[95px]
      ${highlight ? "border-red-200 bg-red-50" : "border-gray-200"}`}
    >
      <h3 className="text-3xl font-semibold text-gray-800">{value || "-"}</h3>

      <p className="text-sm text-gray-500 mt-1">{title}</p>

      {subtitle && <p className="text-xs text-red-500 mt-2">{subtitle}</p>}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
    Suspended: "bg-orange-100 text-orange-700",
    Banned: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}>
      {status}
    </span>
  );
};

const ConsentBadge = ({ consent, date }) => {
  return consent === "Given" ? (
    <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">
      Given • {date}
    </span>
  ) : (
    <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs">
      Pending
    </span>
  );
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
];

const consentOptions = [
  { value: "DPDP Consent", label: "DPDP Consent" },
  { value: "given", label: "Given" },
  { value: "pending", label: "Pending" },
];

const cityOptions = [
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
  { value: "Pune", label: "Pune" },
];

const roleOptions = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

const users = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "MOD",
    userId: "MOT100482",
    mobile: "+91 98XXXXXX21",
    city: "Mumbai",
    registered: "12 Jan 2026",
    consent: "Given",
    consentDate: "12 Jan",
    status: "Active",
    lastActive: "2h ago",
    posts: 34,
  },
  {
    id: 2,
    name: "Priya Nair",
    role: "",
    userId: "MOT100501",
    mobile: "+91 99XXXXXX08",
    city: "Bengaluru",
    registered: "04 Feb 2026",
    consent: "Given",
    consentDate: "04 Feb",
    status: "Active",
    lastActive: "1d ago",
    posts: 12,
  },
  {
    id: 3,
    name: "Rahul Verma",
    role: "",
    userId: "MOT100533",
    mobile: "+91 90XXXXXX77",
    city: "Delhi",
    registered: "21 Feb 2026",
    consent: "Pending",
    consentDate: "",
    status: "Inactive",
    lastActive: "18d ago",
    posts: 0,
  },
  {
    id: 4,
    name: "Sneha Iyer",
    role: "",
    userId: "MOT100560",
    mobile: "+91 81XXXXXX44",
    city: "Pune",
    registered: "02 Mar 2026",
    consent: "Given",
    consentDate: "02 Mar",
    status: "Suspended",
    lastActive: "5d ago",
    posts: 7,
  },
  {
    id: 5,
    name: "Imran Khan",
    role: "MOD",
    userId: "MOT100580",
    mobile: "+91 70XXXXXX13",
    city: "Hyderabad",
    registered: "15 Mar 2026",
    consent: "Pending",
    consentDate: "",
    status: "Active",
    lastActive: "3h ago",
    posts: 21,
  },
  {
    id: 6,
    name: "Neha Gupta",
    role: "",
    userId: "MOT100601",
    mobile: "+91 88XXXXXX45",
    city: "Delhi",
    registered: "19 Mar 2026",
    consent: "Given",
    consentDate: "19 Mar",
    status: "Active",
    lastActive: "4h ago",
    posts: 15,
  },
  {
    id: 7,
    name: "Rohan Mehta",
    role: "",
    userId: "MOT100612",
    mobile: "+91 97XXXXXX66",
    city: "Ahmedabad",
    registered: "24 Mar 2026",
    consent: "Given",
    consentDate: "24 Mar",
    status: "Active",
    lastActive: "30m ago",
    posts: 41,
  },
  {
    id: 8,
    name: "Ananya Kapoor",
    role: "ADMIN",
    userId: "MOT100625",
    mobile: "+91 89XXXXXX17",
    city: "Chandigarh",
    registered: "28 Mar 2026",
    consent: "Given",
    consentDate: "28 Mar",
    status: "Active",
    lastActive: "5m ago",
    posts: 102,
  },
  {
    id: 9,
    name: "Karan Malhotra",
    role: "",
    userId: "MOT100638",
    mobile: "+91 78XXXXXX92",
    city: "Jaipur",
    registered: "01 Apr 2026",
    consent: "Pending",
    consentDate: "",
    status: "Inactive",
    lastActive: "12d ago",
    posts: 3,
  },
  {
    id: 10,
    name: "Pooja Singh",
    role: "",
    userId: "MOT100654",
    mobile: "+91 95XXXXXX71",
    city: "Lucknow",
    registered: "05 Apr 2026",
    consent: "Given",
    consentDate: "05 Apr",
    status: "Active",
    lastActive: "7h ago",
    posts: 18,
  },
  {
    id: 11,
    name: "Vikram Joshi",
    role: "MOD",
    userId: "MOT100669",
    mobile: "+91 84XXXXXX39",
    city: "Pune",
    registered: "09 Apr 2026",
    consent: "Given",
    consentDate: "09 Apr",
    status: "Suspended",
    lastActive: "8d ago",
    posts: 29,
  },
  {
    id: 12,
    name: "Meera Patel",
    role: "",
    userId: "MOT100684",
    mobile: "+91 79XXXXXX20",
    city: "Surat",
    registered: "13 Apr 2026",
    consent: "Pending",
    consentDate: "",
    status: "Active",
    lastActive: "9h ago",
    posts: 6,
  },
  {
    id: 13,
    name: "Aditya Rao",
    role: "",
    userId: "MOT100698",
    mobile: "+91 91XXXXXX88",
    city: "Bengaluru",
    registered: "18 Apr 2026",
    consent: "Given",
    consentDate: "18 Apr",
    status: "Banned",
    lastActive: "27d ago",
    posts: 56,
  },
  {
    id: 14,
    name: "Simran Kaur",
    role: "",
    userId: "MOT100705",
    mobile: "+91 96XXXXXX43",
    city: "Amritsar",
    registered: "22 Apr 2026",
    consent: "Given",
    consentDate: "22 Apr",
    status: "Active",
    lastActive: "1h ago",
    posts: 13,
  },
  {
    id: 15,
    name: "Arjun Desai",
    role: "",
    userId: "MOT100718",
    mobile: "+91 82XXXXXX64",
    city: "Vadodara",
    registered: "26 Apr 2026",
    consent: "Pending",
    consentDate: "",
    status: "Inactive",
    lastActive: "14d ago",
    posts: 4,
  },
  {
    id: 16,
    name: "Kavya Reddy",
    role: "",
    userId: "MOT100730",
    mobile: "+91 87XXXXXX25",
    city: "Hyderabad",
    registered: "30 Apr 2026",
    consent: "Given",
    consentDate: "30 Apr",
    status: "Active",
    lastActive: "3h ago",
    posts: 22,
  },
  {
    id: 17,
    name: "Siddharth Jain",
    role: "MOD",
    userId: "MOT100742",
    mobile: "+91 73XXXXXX56",
    city: "Indore",
    registered: "04 May 2026",
    consent: "Given",
    consentDate: "04 May",
    status: "Active",
    lastActive: "6h ago",
    posts: 31,
  },
  {
    id: 18,
    name: "Nisha Thomas",
    role: "",
    userId: "MOT100759",
    mobile: "+91 94XXXXXX81",
    city: "Kochi",
    registered: "08 May 2026",
    consent: "Pending",
    consentDate: "",
    status: "Suspended",
    lastActive: "9d ago",
    posts: 10,
  },
  {
    id: 19,
    name: "Harsh Agarwal",
    role: "",
    userId: "MOT100771",
    mobile: "+91 80XXXXXX12",
    city: "Noida",
    registered: "12 May 2026",
    consent: "Given",
    consentDate: "12 May",
    status: "Active",
    lastActive: "20m ago",
    posts: 47,
  },
  {
    id: 20,
    name: "Ishita Bose",
    role: "",
    userId: "MOT100789",
    mobile: "+91 76XXXXXX50",
    city: "Kolkata",
    registered: "17 May 2026",
    consent: "Given",
    consentDate: "17 May",
    status: "Banned",
    lastActive: "40d ago",
    posts: 8,
  },
  {
    id: 21,
    name: "Yash Kulkarni",
    role: "",
    userId: "MOT100804",
    mobile: "+91 85XXXXXX33",
    city: "Nagpur",
    registered: "21 May 2026",
    consent: "Pending",
    consentDate: "",
    status: "Active",
    lastActive: "11h ago",
    posts: 16,
  },
  {
    id: 22,
    name: "Ritika Sinha",
    role: "",
    userId: "MOT100819",
    mobile: "+91 93XXXXXX61",
    city: "Patna",
    registered: "25 May 2026",
    consent: "Given",
    consentDate: "25 May",
    status: "Active",
    lastActive: "2d ago",
    posts: 25,
  },
  {
    id: 23,
    name: "Manish Chawla",
    role: "MOD",
    userId: "MOT100836",
    mobile: "+91 98XXXXXX14",
    city: "Ludhiana",
    registered: "29 May 2026",
    consent: "Given",
    consentDate: "29 May",
    status: "Active",
    lastActive: "4d ago",
    posts: 37,
  },
  {
    id: 24,
    name: "Tanvi Mishra",
    role: "",
    userId: "MOT100850",
    mobile: "+91 75XXXXXX29",
    city: "Bhopal",
    registered: "03 Jun 2026",
    consent: "Pending",
    consentDate: "",
    status: "Inactive",
    lastActive: "21d ago",
    posts: 2,
  },
  {
    id: 25,
    name: "Akash Yadav",
    role: "",
    userId: "MOT100867",
    mobile: "+91 92XXXXXX73",
    city: "Kanpur",
    registered: "08 Jun 2026",
    consent: "Given",
    consentDate: "08 Jun",
    status: "Active",
    lastActive: "45m ago",
    posts: 19,
  },
];

const getActionItems = (status) => {
  switch (status) {
    case "Active":
      return [
        {
          label: "View",
          action: "view",
          icon: FiEye,
        },
        {
          label: "Suspend",
          action: "suspend",
          icon: FiSlash,
        },
        {
          label: "Ban",
          action: "ban",
          icon: FiUserX,
          danger: true,
        },
      ];

    case "Inactive":
      return [
        {
          label: "View",
          action: "view",
          icon: FiEye,
        },
        {
          label: "Suspend",
          action: "suspend",
          icon: FiSlash,
        },
        {
          label: "Ban",
          action: "ban",
          icon: FiUserX,
          danger: true,
        },
      ];

    case "Suspended":
      return [
        {
          label: "View",
          action: "view",
          icon: FiEye,
        },
        {
          label: "Reinstate",
          action: "reinstate",
          icon: FiUserCheck,
        },
        {
          label: "Ban",
          action: "ban",
          icon: FiUserX,
          danger: true,
        },
      ];

    case "Banned":
      return [
        {
          label: "View",
          action: "view",
          icon: FiEye,
        },
        {
          label: "Reinstate",
          action: "reinstate",
          icon: FiUserCheck,
        },
      ];

    default:
      return [
        {
          label: "View",
          action: "view",
          icon: FiEye,
        },
      ];
  }
};

const AllUsersList = () => {
  const userColumns = [
    {
      name: "PHOTO",
      width: "80px",
      cell: () => <div className="w-10 h-10 rounded-full bg-gray-200"></div>,
    },

    {
      name: "NAME",
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{row.name}</span>

            {row.role && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-gray-200">
                {row.role}
              </span>
            )}
          </div>
        </div>
      ),
    },

    {
      name: "USER ID",
      selector: (row) => row.userId,
      sortable: true,
      width: "120px",
    },

    {
      name: "MOBILE",
      selector: (row) => row.mobile,
      width: "160px",
    },

    {
      name: "CITY",
      selector: (row) => row.city,
      sortable: true,
      width: "140px",
    },

    {
      name: "REGISTERED",
      selector: (row) => row.registered,
      sortable: true,
      width: "150px",
    },

    {
      name: "DPDP CONSENT",
      width: "180px",
      cell: (row) => (
        <ConsentBadge consent={row.consent} date={row.consentDate} />
      ),
    },

    {
      name: "STATUS",
      width: "140px",
      cell: (row) => <StatusBadge status={row.status} />,
    },

    {
      name: "LAST ACTIVE",
      selector: (row) => row.lastActive,
      width: "130px",
    },

    {
      name: "POSTS",
      selector: (row) => row.posts,
      center: true,
      width: "90px",
    },

    {
      name: "ACTIONS",
      center: true,
      width: "120px",
      cell: (row, index) => {
        const pageStart = (currentPage - 1) * rowsPerPage;
        const absoluteIndex = pageStart + index;

        const pageEnd = Math.min(pageStart + rowsPerPage, users.length);

        const isLastTwoRows = absoluteIndex >= pageEnd - 3;

        return (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-gray-100">
              <FiMoreVertical size={18} />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items
                className={`absolute right-0 w-44 rounded-lg border bg-white shadow-lg z-50 ${
                  isLastTwoRows
                    ? "bottom-full mb-2 origin-bottom-right"
                    : "top-full mt-2 origin-top-right"
                }`}
              >
                {getActionItems(row.status).map((item) => {
                  const Icon = item.icon;

                  if (item.action === "view") {
                    return (
                      <Menu.Item key={item.action}>
                        {({ active }) => (
                          <Link
                            to={`/user/${row.id}`} // your route
                            className={`border-b flex w-full items-center gap-3 px-4 py-2 text-sm transition
                            ${active ? "bg-gray-100" : ""}
                            text-gray-700`}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        )}
                      </Menu.Item>
                    );
                  }

                  return (
                    <Menu.Item key={item.action}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => console.log(item.action, row)}
                          className={`border-b flex w-full items-center gap-3 px-4 py-2 text-sm transition
                          ${active ? "bg-gray-100" : ""}
                          ${item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            </Transition>
          </Menu>
        );
      },
    },
  ];

  const [status, setStatus] = useState(null);
  const [consent, setConsent] = useState(null);
  const [city, setCity] = useState(null);
  const [role, setRole] = useState(null);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  return (
    <>
      <div>
        <div className="mb-5">
          <button className="ms-auto custom--btn">
            <FiDownload />
            <span>Export Users</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:gap-4 gap-2">
          <StatCard title="Active" value="4,210" />
          <StatCard title="Inactive" value="980" />
          <StatCard title="Suspended" value="36" />
          <StatCard title="Banned" value="58" />
          <StatCard title="Pending DPDP Consent" value="412" />
        </div>

        <div className="bg-white rounded-lg border p-4 mt-3">
          <div className="grid xl:grid-cols-6 lg:grid-cols-2 md:grid-cols-2 gap-3">
            <div className="">
              {/* Status */}
              <Select
                styles={customStyles}
                options={statusOptions}
                value={status}
                onChange={setStatus}
                isSearchable={false}
                placeholder="Select Status"
              />
            </div>
            <div className="">
              {/* DPDP */}
              <Select
                styles={customStyles}
                options={consentOptions}
                value={consent}
                onChange={setConsent}
                isSearchable={false}
                placeholder="Select Option"
              />
            </div>

            <div className="col-span-2">
              {/* Date Range */}
              <div className="custom--date relative w-full">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  className="w-full border rounded-lg px-3 h-[40px] text-sm"
                  placeholderText="Registered date range"
                  dateFormat="dd MMM yyyy"
                />
              </div>
            </div>

            <div className="">
              {/* City */}
              <Select
                styles={customStyles}
                options={cityOptions}
                value={city}
                onChange={setCity}
                isSearchable
                placeholder="Select City"
              />
            </div>

            <div className="">
              {/* Role */}
              <Select
                styles={customStyles}
                options={roleOptions}
                value={role}
                onChange={setRole}
                isSearchable={false}
                placeholder="Select Role"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 mt-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name / mobile / User ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="custom--input w-full"
          />
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={userColumns}
            data={users}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
    </>
  );
};

export default AllUsersList;
