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
  FaUserPlus,
  FaCircle,
} from "react-icons/fa";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

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
        <h3 className="text-2xl font-semibold text-gray-800">{value || 0}</h3>

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

    case "SUSPEND":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Ban", action: "ban", icon: FiUserX, danger: true },
        { label: "Unsuspend", action: "Unsuspend", icon: FiUserCheck },
      ];

    case "BANNED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Unban", action: "Unban", icon: FiUserCheck },
      ];

    default:
      return [{ label: "View", action: "view", icon: FiEye }];
  }
};

const AllUsersList = (props) => {
  const { setLoading } = props;

  const [allUsersData, setAllUsersData] = useState([]);
  const [allUserCount, setAllUserCount] = useState({});
  const [status, setStatus] = useState(null);
  const [consent, setConsent] = useState(null);
  const [moderatorFilter, setModeratorFilter] = useState(null);

  const [statusModal, setStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

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
      name: "Photo",
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
      name: "Name",
      sortable: true,
      // width: "150px",
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
      name: "Username",
      selector: (row) => (row.username ? row.username : "--"),
      sortable: true,
      // width: "120px",
    },

    {
      name: "Registered on",
      selector: (row) => formatViewDate(row.created_at),
      sortable: true,
      // width: "150px",
    },

    {
      name: "Last Active",
      selector: (row) =>
        row.last_login_at ? formatWithTimeDate(row.last_login_at) : "--",
      // width: "160px",
    },

    {
      name: "Posts",
      selector: (row) => row.posts ? row.posts : "--",
      center: true,
      // width: "90px",
    },

    {
      name: "Status",
      // width: "100px",
      center: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },

    {
      name: "Actions",
      center: true,
      // width: "140px",
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
                  onClick={() => {
                    switch (item.action) {
                      case "suspend":
                        openStatusModal(row, "MUTED");
                        break;

                      case "ban":
                        openStatusModal(row, "BANNED");
                        break;

                      case "reinstate":
                        openStatusModal(row, "ACTIVE");
                        break;

                      default:
                        break;
                    }
                  }}
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
        setAllUserCount(resData.data.counts);
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

  const getStatusActionLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "reinstate";

      case "SUSPEND":
        return "suspend";

      case "BANNED":
        return "ban";

      default:
        return "update";
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await authAxios().put(`/user/${selectedUser.id}`, {
        status: selectedStatus,
      });

      toast.success("User status updated successfully.");

      setStatusModal(false);
      setSelectedUser(null);
      setSelectedStatus(null);

      fetchAllUsers(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const openStatusModal = (user, status) => {
    setSelectedUser(user);
    setSelectedStatus(status);
    setStatusModal(true);
  };

  return (
    <>
      <div>
        <div className="mb-5 flex gap-2 items-center justify-end">
          {/* <button className="ms-auto custom--btn">
            <FiDownload />
            <span>Export Users</span>
          </button> */}
          <div className="border px-2 py-1 rounded-lg">
            <div className="w-fit flex items-center gap-2">
              <div className="text-[13px] font-medium text-gray-500 flex gap-2 items-center">
                <FaCircle className="text-[10px] text-[#3774d0]" />
                <span className="leading-1">Total Users</span>
              </div>
              <div className="flex">
                <span className="text-[13px] font-semibold leading-1">
                  {allUserCount?.total_users_count}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-4 gap-2">
          <StatCard
            title="Active"
            value={allUserCount?.total_active_users_count}
            icon={FaUserCheck}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />

          <StatCard
            title="Suspended"
            value={allUserCount?.total_suspended_users_count}
            icon={FaUserSlash}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-100"
          />

          <StatCard
            title="Banned"
            value={allUserCount?.total_banned_users_count}
            icon={FaBan}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />

          <StatCard
            title="New Users"
            value={allUserCount?.total_new_users_count}
            icon={FaUserPlus}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </div>

        <div className="bg-white rounded-lg border p-4 mt-3">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-3 relative">
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

            <div>
              {/* Registered date range — replaces the two react-datepicker fields */}
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetRight={0}
                align="right"
              />
            </div>
            <div>
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

      <Dialog
        open={statusModal}
        onClose={() => setStatusModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold">
              Confirm Status Update
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to{" "}
              <strong>{getStatusActionLabel(selectedStatus)}</strong>{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setStatusModal(false);
                  setSelectedUser(null);
                  setSelectedStatus(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusUpdate}
                className={`rounded-md px-4 py-2 text-white ${
                  selectedStatus === "BANNED"
                    ? "bg-red-600 hover:bg-red-700"
                    : selectedStatus === "MUTED"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default IsLoadingHOC(AllUsersList);
