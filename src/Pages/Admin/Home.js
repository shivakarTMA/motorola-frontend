import React, { useState, useMemo, useEffect } from "react"; // Import React hooks
import Highcharts from "highcharts"; // Import Highcharts
import HighchartsReact from "highcharts-react-official"; // Import React wrapper for Highcharts
import "highcharts/modules/no-data-to-display";
import Select from "react-select"; // Import react-select for dropdowns
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import {
  customStyles,
  formatText,
  formatViewTime,
  formatViewDate,
  formatWithTimeDate,
} from "../../Helper/helper";
import { Link } from "react-router-dom";
import { LuCalendar, LuUserPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import { authAxios } from "../../Config/config";
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaBan,
  FaUserPlus,
  FaClipboardCheck,
  FaCircle,
  FaFlag,
} from "react-icons/fa";
import DateRangeFilter from "../../Components/Common/DateRangePickerField";
import { format } from "date-fns";
import IsLoadingHOC from "../../Components/Common/IsLoadingHOC";
import DateRangePicker from "../../Components/Common/DateRangePickerField";
import CustomDataTable from "../../Components/Common/CustomDataTable";
import Tooltip from "../../Components/Common/Tooltip";
import { FiEye, FiTrash2 } from "react-icons/fi";
import ModerationDetailModal from "./Moderation/ModerationDetailModal";
import PollModerationDetailModal from "./Moderation/PollModerationDetailModal";
import ArticleModerationDetailModal from "./Moderation/ArticleModerationDetailModal";
import PostModerationDetailModal from "./Moderation/PostModerationDetailModal";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  highlight = false,
}) => {
  return (
    <div
      className={`relative rounded-xl border p-3 shadow-sm transition-all duration-300 hover:shadow-md
      ${highlight ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}
    >
      {/* Icon */}
      {Icon && (
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${iconBg}`}
        >
          <Icon className={`text-xl ${iconColor}`} />
        </div>
      )}

      {/* Value */}
      <h3 className="text-2xl font-bold text-gray-800">{value || 0}</h3>

      {/* Title */}
      <p className="text-[13px] text-gray-500">{title}</p>

      {/* Subtitle */}
      {subtitle && <p className="mt-3 text-xs text-red-500">{subtitle}</p>}
    </div>
  );
};

const chartFilterOptions = [
  { value: "tribe_group", label: "Tribe Group" },
  { value: "tribes", label: "Tribes" },
];

const AdminDashboard = (props) => {
  const { setLoading } = props;
  const [allDashboardData, setAllDashboardData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [editPostId, setEditPostId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [filterTribeGroup, setFilterTribeGroup] = useState(null);
  const [filterTribe, setFilterTribe] = useState(null);

  const [tribeGroupOptions, setTribeGroupOptions] = useState([]);
  const [tribeOptions, setTribeOptions] = useState([]);

  const [moderationStats, setModerationStats] = useState({
    totalFlagged: 0,
    actionsPending: 0,
    actionsTaken: 0,
  });
  const [recentActions, setRecentActions] = useState([]);

  // Static dummy data for the charts - no API call

  const [contentChartData, setContentChartData] = useState({
    hot_takes: 0,
    deep_dives: 0,
    vibe_checks: 0,
  });
  const [engagementChartData, setEngagementChartData] = useState({
    likes: 0,
    comments: 0,
    followers: 0,
  });

  const hasContentData =
    (contentChartData.hot_takes || 0) +
      (contentChartData.deep_dives || 0) +
      (contentChartData.vibe_checks || 0) >
    0;

  const hasEngagementData =
    (engagementChartData.likes || 0) +
      (engagementChartData.comments || 0) +
      (engagementChartData.followers || 0) >
    0;

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchDashboardList = async () => {
    try {
      setLoading(true);

      const params = {};

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
      }

      const response = await authAxios().get("/dashboard", {
        params,
      });

      const resData = response.data?.data;

      if (response.data?.success) {
        setAllDashboardData(resData[0] || {});
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartAnalytics = async () => {
    try {
      const params = {};

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
      }

      if (filterTribeGroup?.value) {
        params.tribe_group_id = filterTribeGroup.value;
      }

      if (filterTribe?.value) {
        params.tribe_id = filterTribe.value;
      }

      const response = await authAxios().get("/dashboard/analytics", {
        params,
      });
      const resData = response?.data;

      if (resData?.success) {
        const analytics = resData.data?.[0] || {};
        const posts = analytics.posts || {};
        const interactions = analytics.interactions || {};

        setContentChartData({
          hot_takes: posts.posts_count || 0,
          deep_dives: posts.articles_count || 0,
          vibe_checks: posts.polls_count || 0,
        });

        setEngagementChartData({
          likes: interactions.likes_count || 0,
          comments: interactions.comments_count || 0,
          followers: interactions.followers_count || 0,
        });
      } else {
        toast.error(resData?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load chart analytics",
      );
    }
  };

  useEffect(() => {
    fetchDashboardList();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchChartAnalytics();
  }, [startDate, endDate, filterTribeGroup, filterTribe]);

  // ---- Tribe Group list API (populates filter2 when filter1 = "Tribe Group") ----
  const fetchTribeGroupList = async () => {
    try {
      const response = await authAxios().get("/tribe-group");
      const resData = response?.data;

      if (resData?.success) {
        const options = (resData.data.items || []).map((group) => ({
          value: group.id,
          label: group.name,
        }));
        console.log(options, "options");
        setTribeGroupOptions(options);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load tribe groups",
      );
    }
  };

  // ---- Tribe list API (populates filter2 when filter1 = "Tribes") ----
  const fetchTribeList = async (circleGroupId) => {
    try {
      const response = await authAxios().get("/tribe", {
        params: {
          circle_group_id: circleGroupId,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        const options = (resData.data.items || []).map((tribe) => ({
          value: tribe.id,
          label: tribe.name,
        }));

        setTribeOptions(options);
      } else {
        toast.error(resData?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load tribes");
    }
  };

  const CONTENT_TYPE_LABELS = {
    POST: "Post",
    POLL: "Poll",
    COMMENT: "Comment",
  };

  const fetchRecentModerationActivities = async () => {
    try {
      const response = await authAxios().get("/moderation/recent");
      const resData = response?.data;

      if (resData?.success) {
        const {
          total_posts_flagged,
          total_actions_pending,
          total_actions_taken,
          recent_actions,
        } = resData.data;

        setModerationStats({
          totalFlagged: total_posts_flagged,
          actionsPending: total_actions_pending,
          actionsTaken: total_actions_taken,
        });

        setRecentActions(resData?.data?.recent_actions);
      } else {
        toast.error(resData?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load recent activity",
      );
    }
  };

  // Whenever filter1 changes, refresh filter2's option list from the right API
  useEffect(() => {
    if (filterTribeGroup?.value) {
      fetchTribeList(filterTribeGroup.value);
      setFilterTribe(null); // Clear previous selection
    } else {
      setTribeOptions([]);
      setFilterTribe(null);
    }
  }, [filterTribeGroup]);

  useEffect(() => {
    fetchTribeGroupList();
    fetchRecentModerationActivities();
  }, []);

  const contentChartOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        height: "300px",
      },
      title: {
        text: "",
      },
      credits: {
        enabled: false,
      },
      lang: {
        noData: "No content data for the selected filters",
      },
      noData: {
        style: {
          fontWeight: "500",
          fontSize: "13px",
          color: "#9ca3af",
        },
      },
      xAxis: {
        categories: ["Hot Takes", "Deep Dives", "Vibe Checks"],
      },
      yAxis: {
        min: 0,
        title: {
          // text: "Count",
          text: null,
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: filterTribe?.label || filterTribeGroup?.label || "Content",
          color: "#3774d0",
          data: hasContentData
            ? [
                contentChartData?.hot_takes || 0,
                contentChartData?.deep_dives || 0,
                contentChartData?.vibe_checks || 0,
              ]
            : [],
        },
      ],
    }),
    [contentChartData, filterTribeGroup, filterTribe, hasContentData],
  );

  const engagementChartOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        height: "300px",
      },
      title: {
        text: "",
      },
      lang: {
        noData: "No content data for the selected filters",
      },
      noData: {
        style: {
          fontWeight: "500",
          fontSize: "13px",
          color: "#9ca3af",
        },
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: ["Likes", "Comments", "Followers"],
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: filterTribe?.label || filterTribeGroup?.label || "Engagement",
          color: "#00A870",
          data: hasEngagementData
            ? [
                engagementChartData?.likes || 0,
                engagementChartData?.comments || 0,
                engagementChartData?.followers || 0,
              ]
            : [],
        },
      ],
    }),
    [engagementChartData, filterTribeGroup, filterTribe, hasEngagementData],
  );

  // Called only when DateRangePicker's Apply or Clear button is clicked.
  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const openReport = (row) => {
    setSelectedReport(row);
    setModalType(
      row?.post?.type ? row?.post?.type : row?.content_type
    );
    setEditPostId(row.id);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setModalType(null);
    setEditPostId(null);
  };

  // Called after the confirmation modal is confirmed
  const handleModerationUpdate = async (payload) => {
    try {
      await authAxios().post(`/moderation/action`, payload);

      toast.success("Moderation updated successfully.");

      setIsModalOpen(false);
      setSelectedReport(null);
      setModalType(null);

      fetchRecentModerationActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <>
      <div>
        <div className="space-y-6">
          <div className="w-full relative flex gap-2 items-center justify-between">
            <div className="max-w-[200px] w-full">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
              />
            </div>
            <div className="border px-2 py-1 rounded-lg">
              <div className="w-fit flex items-center gap-2">
                <div className="text-[13px] font-medium text-gray-500 flex gap-2 items-center">
                  <FaCircle className="text-[10px] text-[#3774d0]" />
                  <span className="leading-1">Total Users</span>
                </div>
                <div className="flex">
                  <span className="text-[13px] font-semibold leading-1">
                    {allDashboardData?.total_users_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-2">
            <StatCard
              title="Active Users"
              value={allDashboardData?.total_active_users}
              icon={FaUsers}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Suspended Users"
              value={allDashboardData?.total_suspended_users_count}
              icon={FaUserSlash}
              iconColor="text-yellow-600"
              iconBg="bg-yellow-100"
            />

            <StatCard
              title="Banned Users"
              value={allDashboardData?.total_banned_users_count}
              icon={FaBan}
              iconColor="text-red-600"
              iconBg="bg-red-100"
            />

            <StatCard
              title="New Users"
              value={allDashboardData?.total_new_users}
              icon={LuUserPlus}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Pending Flags"
              value={allDashboardData?.pending_flags}
              icon={FaFlag}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Posts Reviewed"
              value={allDashboardData?.posts_reviewed}
              icon={FaClipboardCheck}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
          </div>

          <div className="flex lg:flex-row flex-col justify-between lg:items-center lg:!mt-10  gap-2">
            <div className="flex lg:justify-end gap-2 mb-4">
              <div className="min-w-[180px] w-full">
                <Select
                  value={filterTribeGroup}
                  options={tribeGroupOptions}
                  onChange={setFilterTribeGroup}
                  styles={customStyles}
                  placeholder="Select Tribe Group"
                  isClearable
                />
              </div>

              <div className="max-w-[210px] lg:min-w-[300px] w-full">
                <Select
                  value={filterTribe}
                  options={tribeOptions}
                  onChange={setFilterTribe}
                  styles={customStyles}
                  placeholder="Select Tribe"
                  isClearable
                  isDisabled={!filterTribeGroup}
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-2 !mt-0">
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-5">Posts</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={contentChartOptions}
              />
            </div>

            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-5">Interactions</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={engagementChartOptions}
              />
            </div>
          </div>

          {/* Activity Table */}
          <div className="!mt-10">
            <div className="flex lg:flex-row flex-col justify-between lg:items-center mb-3  gap-2">
              <h2 className="lg:text-lg text-md font-semibold uppercase">
                Recent Moderation Activity
              </h2>

              <div className="flex lg:flex-row flex-col lg:items-center pr-2">
                {/* <div className="w-fit flex items-center gap-2 lg:border-r">
                  <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
                    <FaCircle className="text-[10px] text-[#009EB2]" />
                    <span>Total Posts Flagged</span>
                  </div>
                  <div className="pr-2 flex">
                    <span className="text-[13px] font-semibold">
                      {moderationStats.totalFlagged ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
                  <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
                    <FaCircle className="text-[10px] text-[#1F9254]" />
                    <span>Total Actions Pending</span>
                  </div>
                  <div className="pr-2 flex">
                    <span className="text-[13px] font-semibold">
                      {moderationStats.actionsPending ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="w-fit flex items-center gap-2 lg:pl-2">
                  <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
                    <FaCircle className="text-[10px] text-[#ff9900]" />
                    <span>Total Actions Taken</span>
                  </div>
                  <div className="pr-2 flex">
                    <span className="text-[13px] font-semibold">
                      {moderationStats.actionsTaken ?? "—"}
                    </span>
                  </div>
                </div> */}
                <div className="w-fit flex items-center gap-2 lg:pl-8">
                  <Link to="/moderation-queue" className="custom--btn">
                    <FiEye size={15} />{" "}
                    <span className="text-[12px]">View All</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="box--shadow bg-white rounded-[15px] p-4">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        {/* <th className="px-2 py-4 min-w-[80px]">Report ID</th> */}
                        <th className="px-2 py-4 min-w-[120px]">
                          Reported Date
                        </th>
                        <th className="px-2 py-4 min-w-[120px]">
                          Reported Time
                        </th>
                        <th className="px-2 py-4 min-w-[100px] ">Item Type</th>
                        <th className="px-2 py-4 min-w-[150px] ">
                          Flagged Keyword
                        </th>
                        <th className="px-2 py-4 min-w-[150px] ">
                          Reported (User)
                        </th>
                        <th className="px-2 py-4 min-w-[150px]">Tribe</th>
                        <th className="px-2 py-4 min-w-[150px]">
                          Moderator Name
                        </th>
                        <th className="px-2 py-4 min-w-[130px]">
                          Updated Time
                        </th>
                        <th className="px-2 py-4 min-w-[120px]">
                          Action Taken
                        </th>
                        <th className="px-2 py-4 min-w-[120px] text-center">
                          Status
                        </th>
                        <th className="px-2 py-4 min-w-[100px] text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentActions?.length > 0 ? (
                        recentActions.map((row, index) => (
                          <tr
                            key={row.id || index}
                            className="border-b hover:bg-gray-50 text-xs"
                          >
                            <td className="px-2 py-4">
                              {formatViewDate(row.created_at) || "--"}
                            </td>

                            <td className="px-2 py-4">
                              {formatViewTime(row.reported_time) || "--"}
                            </td>

                            <td className="px-2 py-4">
                              {row?.post?.type === "POST"
                                ? "Hot Take"
                                : row?.post?.type === "ARTICLE"
                                  ? "Deep Dive"
                                  : row?.content_type === "POLL"
                                    ? "Vibe Check"
                                    : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row?.matchedKeyword?.keyword
                            ? row.matchedKeyword?.keyword
                            : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row.user.name ? row.user.name : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row.tribe ? row.tribe : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row?.moderator_name ? row.moderator_name : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row?.updated_time ? row.updated_time : "--"}
                            </td>
                            <td className="px-2 py-4">
                              {row?.action_taken ? row.action_taken : "--"}
                            </td>
                            <td className="px-2 py-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  {
                                    ACTIONED: "bg-green-100 text-green-700",
                                    PENDING: "bg-yellow-100 text-yellow-700",
                                  }[row.status] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {formatText(
                                  row?.status === "ACTIONED"
                                    ? "Resolved"
                                    : row?.status,
                                )}
                              </span>
                            </td>

                            <td className="px-2 py-4 ">
                              <Tooltip
                                id={`tooltip-view-${row.id}`}
                                content="View"
                                place="top"
                              >
                                <button
                                  onClick={() => openReport(row)}
                                  className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-md mx-auto"
                                >
                                  <FiEye size={18} />
                                </button>
                              </Tooltip>
                            </td>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalType === "POST" && (
        <PostModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {modalType === "ARTICLE" && (
        <ArticleModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {modalType === "POLL" && (
        <PollModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
        />
      )}
    </>
  );
};

export default IsLoadingHOC(AdminDashboard);
