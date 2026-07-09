import React, { useState, useEffect } from "react"; // Import React hooks
import Select from "react-select"; // Import react-select for dropdowns
import { Link } from "react-router-dom";
import { LuCalendar } from "react-icons/lu";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import {
  customStyles,
  formatText,
  formatViewDate,
  formatWithTimeDate,
} from "../../../Helper/helper";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { FiEye, FiSlash, FiUserCheck, FiUserX } from "react-icons/fi";
import Tooltip from "../../../Components/Common/Tooltip";
import {
  FaUserCheck,
  FaUserTimes,
  FaUserSlash,
  FaBan,
  FaClipboardCheck,
  FaUser,
} from "react-icons/fa";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const StatCard = ({
  title,
  value,
  highlight = false,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
}) => {
  return (
    <div
      className={`rounded-lg border p-3 bg-white min-h-[95px]
      ${highlight ? "border-red-200 bg-red-50" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-2xl font-semibold text-gray-800">{value || "-"}</h3>

        {Icon && (
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center ${iconBg}`}
          >
            <Icon className={`text-lg ${iconColor}`} />
          </div>
        )}
      </div>

      <p className="text-[14px] text-gray-500 mt-1">{title}</p>

      {subtitle && <p className="text-xs text-red-500 mt-2">{subtitle}</p>}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    MUTED: "bg-yellow-100 text-yellow-700",
    BANNED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}>
      {formatText(status)}
    </span>
  );
};

const ConsentBadge = ({ consent }) =>
  consent ? (
    <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">
      Given
    </span>
  ) : (
    <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs">
      Pending
    </span>
  );

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVATED", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
];

const consentOptions = [
  {
    value: true,
    label: "Given",
  },
  {
    value: false,
    label: "Pending",
  },
];

const getActionItems = (status) => {
  switch (status) {
    case "ACTIVE":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Suspend", action: "suspend", icon: FiSlash },
        { label: "Ban", action: "ban", icon: FiUserX, danger: true },
      ];

    case "MUTED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Suspend", action: "suspend", icon: FiSlash },
        { label: "Ban", action: "ban", icon: FiUserX, danger: true },
      ];

    case "Suspended":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Reinstate", action: "reinstate", icon: FiUserCheck },
        { label: "Ban", action: "ban", icon: FiUserX, danger: true },
      ];

    case "BANNED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Reinstate", action: "reinstate", icon: FiUserCheck },
      ];

    default:
      return [{ label: "View", action: "view", icon: FiEye }];
  }
};

const AllUsersList = (props) => {
  const { setLoading } = props;

  const [allUsersData, setAllUsersData] = useState([]);
  const [status, setStatus] = useState(null);
  const [consent, setConsent] = useState(null);
  const [moderatorFilter, setModeratorFilter] = useState(null);

  // These now only change when the DateRangePicker's Apply/Clear fires,
  // so no fetch happens mid-selection anymore.
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const userColumns = [
    {
      name: "PHOTO",
      width: "80px",
      cell: (row) =>
        row?.profile_picture ? (
          <div className="p-1">
            <img
              src={row.profile_picture}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <FaUser />
            </span>
          </div>
        ),
    },

    {
      name: "NAME",
      sortable: true,
      minWidth: "220px",
      cell: (row) =>
        row.name ? (
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
        ) : (
          "--"
        ),
    },

    {
      name: "USER ID",
      selector: (row) => (row.username ? row.username : "--"),
      sortable: true,
      width: "120px",
    },

    {
      name: "MOBILE",
      selector: (row) => (
        <div>
          +{row.country_code} {row.mobile}
        </div>
      ),
      width: "160px",
    },

    {
      name: "CITY",
      selector: (row) => (row.city ? row.city : "--"),
      sortable: true,
      width: "140px",
    },

    {
      name: "REGISTERED",
      selector: (row) => formatViewDate(row.created_at),
      sortable: true,
      width: "150px",
    },

    {
      name: "DPDP CONSENT",
      width: "180px",
      cell: (row) => <ConsentBadge consent={row.has_consent} />,
    },

    {
      name: "STATUS",
      width: "140px",
      cell: (row) => <StatusBadge status={row.status} />,
    },

    {
      name: "LAST ACTIVE",
      selector: (row) =>
        row.last_login_at ? formatWithTimeDate(row.last_login_at) : "--",
      width: "160px",
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
      width: "160px",
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          {getActionItems(row.status).map((item) => {
            const Icon = item.icon;

            if (item.action === "view") {
              return (
                <Tooltip
                  id={`tooltip-view-${row.id}`}
                  content={item.label}
                  place="left"
                >
                  <Link
                    key={item.action}
                    to={`/user/${row.id}`}
                    title={item.label}
                    className="p-2 rounded-md border text-gray-600 hover:bg-gray-100 transition block"
                  >
                    <Icon size={16} />
                  </Link>
                </Tooltip>
              );
            }

            return (
              <Tooltip
                id={`tooltip-view-${row.id}`}
                content={item.label}
                place="left"
              >
                <button
                  key={item.action}
                  type="button"
                  title={item.label}
                  onClick={() => console.log(item.action, row)}
                  className={`p-2 rounded-md border transition ${
                    item.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                </button>
              </Tooltip>
            );
          })}
        </div>
      ),
    },
  ];

  const fetchAllUsers = async (page = 1, searchText = debouncedSearch) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: rowsPerPage,
      };

      if (searchText) {
        params.search = searchText;
      }

      if (status?.value) {
        params.status = status?.value;
      }

      if (consent !== null) {
        params.user_consent = consent.value;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      const response = await authAxios().get("/user", {
        params,
      });

      const resData = response.data;

      if (resData.success) {
        setAllUsersData(resData.data.items);
        setPagination(resData.data.pagination);
      } else {
        toast.error(resData.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, startDate, endDate, status, consent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // Called only when DateRangePicker's Apply or Clear button is clicked.
  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

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
          <StatCard
            title="Active"
            value="4,210"
            icon={FaUserCheck}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />

          <StatCard
            title="Inactive"
            value="980"
            icon={FaUserTimes}
            iconColor="text-gray-600"
            iconBg="bg-gray-100"
          />

          <StatCard
            title="Suspended"
            value="36"
            icon={FaUserSlash}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
          />

          <StatCard
            title="Banned"
            value="58"
            icon={FaBan}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />

          <StatCard
            title="Pending DPDP Consent"
            value="412"
            icon={FaClipboardCheck}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </div>

        <div className="bg-white rounded-lg border p-4 mt-3">
          <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 gap-3 relative">
            <div className="">
              {/* Status */}
              <Select
                styles={customStyles}
                options={statusOptions}
                value={status}
                onChange={setStatus}
                isSearchable={false}
                placeholder="Select Status"
                isClearable
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
                placeholder="Select Consent"
                isClearable
              />
            </div>

            <div className="col-span-2">
              {/* Registered date range — replaces the two react-datepicker fields */}
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetRight={0}
                align="right"
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
            data={allUsersData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total}
          />
        </div>
      </div>
    </>
  );
};

export default IsLoadingHOC(AllUsersList);
