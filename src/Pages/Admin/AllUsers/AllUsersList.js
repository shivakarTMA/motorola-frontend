import React, { useState, useEffect } from "react"; // Import React hooks
import Select from "react-select"; // Import react-select for dropdowns
import { Link } from "react-router-dom";
import { LuUserPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import {
  customStyles,
  formatText,
  formatViewDate,
  formatWithTimeDate,
} from "../../../Helper/helper";
import { FiEye, FiSlash, FiUserCheck, FiUserX } from "react-icons/fi";
import Tooltip from "../../../Components/Common/Tooltip";
import { FaUserSlash, FaBan, FaUser, FaCircle, FaUsers } from "react-icons/fa";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
// Adjust this import path to wherever you save UserUpdateStatus.jsx
import UserUpdateStatus from "./UserUpdateStatus";

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

// FIX: colors now match the API's actual status enum ('ACTIVE','SUSPEND','BANNED','DEACTIVATED').
// Previously had 'INACTIVE'/'MUTED' which never match real data, leaving the badge unstyled.
const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: "bg-green-100 text-green-700",
    DEACTIVATED: "bg-gray-100 text-gray-600",
    SUSPEND: "bg-yellow-100 text-yellow-700",
    BANNED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatText(status)}
    </span>
  );
};

// FIX: 'SUSPENDED' -> 'SUSPEND' to match the API enum used for filtering.
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "DEACTIVATED", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
];

const actionStyles = {
  view: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  ACTIVE: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
  SUSPENDED:"text-yellow-600 bg-yellow-100 border-yellow-200 hover:bg-yellow-100",
  BANNED: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
};

const getActionItems = (status) => {
  switch (status) {
    case "ACTIVE":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Suspend", action: "SUSPENDED", icon: FaUserSlash },
        { label: "Ban", action: "BANNED", icon: FaBan, danger: true },
      ];

    case "SUSPENDED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Ban", action: "BANNED", icon: FaBan, danger: true },
        { label: "Reinstate", action: "ACTIVE", icon: FiUserCheck },
      ];

    case "BANNED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Unban", action: "ACTIVE", icon: FiUserCheck },
      ];

    case "DEACTIVATED":
      return [
        { label: "View", action: "view", icon: FiEye },
        { label: "Reactivate", action: "ACTIVE", icon: FiUserCheck },
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

  const [statusModal, setStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // These now only change when the DateRangePicker's Apply/Clear fires,
  // so no fetch happens mid-selection anymore.
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lastStartDate, setLastStartDate] = useState(null);
  const [lastEndDate, setLastEndDate] = useState(null);
  const [dateFilterField, setDateFilterField] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-[1px]">
      {getActionItems(row.status).map((item) => {
        const Icon = item.icon;

        if (item.action === "view") {
          return (
            <Tooltip
              key={item.action}
              id={`tooltip-view-${row.id}`}
              content={item.label}
              place="left"
            >
              <Link
                to={`/user/${row.id}`}
                title={item.label}
                className={`p-2 rounded-md border transition block ${
                  actionStyles[item.action] ||
                  "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
              </Link>
            </Tooltip>
          );
        }

        return (
          <Tooltip
            key={item.action}
            id={`tooltip-view-${row.id}`}
            content={item.label}
            place="left"
          >
            <button
              type="button"
              title={item.label}
              // FIX: item.action is now the literal target status, so we can pass it straight
              // through instead of the old switch that silently dropped "Unsuspend"/"Unban".
              onClick={() => openStatusModal(row, item.action)}
              className={`p-2 rounded-md border transition ${
                actionStyles[item.action] ||
                "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );

  const fetchAllUsers = async (
    currentPage = page,
    searchText = debouncedSearch,
  ) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
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

      if (dateFilterField === "created_at" && startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      if (
        dateFilterField === "last_active_at" &&
        lastStartDate &&
        lastEndDate
      ) {
        params.date_from = format(lastStartDate, "yyyy-MM-dd");
        params.date_to = format(lastEndDate, "yyyy-MM-dd");
        params.date_filter_field = "last_active_at";
      }

      const response = await authAxios().get("/user", {
        params,
      });

      const resData = response.data;

      if (resData.success) {
        setAllUsersData(resData.data.items);
        setAllUserCount(resData.data.counts);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
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
    // FIX: was fetchAllUsers(debouncedSearch) — passing the search string into the
    // "currentPage" argument slot, which set params.page to a string instead of a number.
    fetchAllUsers(1, debouncedSearch);
  }, [
    debouncedSearch,
    startDate,
    endDate,
    lastStartDate,
    lastEndDate,
    status,
    consent,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, lastStartDate, lastEndDate]);

  // Called only when DateRangePicker's Apply or Clear button is clicked.
  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setDateFilterField("created_at");
  };

  const handleLastActiveDate = ({ startDate: newStart, endDate: newEnd }) => {
    setLastStartDate(newStart);
    setLastEndDate(newEnd);
    setDateFilterField("last_active_at");
  };

  // FIX: now receives the fully-built payload (status + reason + suspend dates, as applicable)
  // from UserUpdateStatus, instead of only ever sending { status }.
  const handleStatusUpdate = async (payload) => {
    try {
      await authAxios().put(`/user/${selectedUser.id}`, payload);

      toast.success("User status updated successfully.");

      setStatusModal(false);
      setSelectedUser(null);
      setSelectedStatus(null);

      fetchAllUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const openStatusModal = (user, targetStatus) => {
    setSelectedUser(user);
    setSelectedStatus(targetStatus);
    setStatusModal(true);
  };

  const closeStatusModal = () => {
    setStatusModal(false);
    setSelectedUser(null);
    setSelectedStatus(null);
  };

  return (
    <>
      <div>
        <div className="mb-5 flex gap-2 items-center justify-end">
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
            icon={FaUsers}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
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
            icon={LuUserPlus}
            iconBg="bg-green-100"
            iconColor="text-green-600"
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

            <div className="relative">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
                align="left"
                placeholder="Filter by Registered on"
              />
            </div>
            <div className="relative">
              <DateRangePicker
                onChange={handleLastActiveDate}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetRight={0}
                align="right"
                placeholder="Filter by Last Active"
              />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[70px]">Photo</th>
                    <th className="px-2 py-4 min-w-[120px]">Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Username</th>
                    <th className="px-2 py-4 min-w-[120px]">Registered on</th>
                    <th className="px-2 py-4 min-w-[100px]">Last Active</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      No. of posts
                    </th>
                    <th className="px-2 py-4 min-w-[140px] text-center">
                      No. of Interactions
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {allUsersData?.length > 0 ? (
                    allUsersData.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">
                          {row?.profile_picture ? (
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
                          )}
                        </td>

                        <td className="px-2 py-4">
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
                        </td>

                        <td className="px-2 py-4">
                          {row.username ? row.username : "--"}
                        </td>

                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          {formatViewDate(row.last_login_at) || "--"}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.posts_count == null && row.polls_count == null
                            ? "--"
                            : (row.posts_count ?? 0) + (row.polls_count ?? 0)}
                        </td>
                        <td className="px-2 py-4 text-center">
                          {row?.total_interactions}
                        </td>

                        <td className="px-2 py-4 text-center">
                          <StatusBadge status={row.status} />
                        </td>

                        <td className="px-2 py-4">{renderActions(row)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={allUsersData.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchAllUsers(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {/* FIX: modal was never rendered before — Suspend/Ban buttons did nothing. */}
      <UserUpdateStatus
        isOpen={statusModal}
        onClose={closeStatusModal}
        user={selectedUser}
        action={selectedStatus}
        onSubmit={handleStatusUpdate}
      />
    </>
  );
};

export default IsLoadingHOC(AllUsersList);
