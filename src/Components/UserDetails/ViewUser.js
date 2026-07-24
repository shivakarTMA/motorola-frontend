import UserProfileCard from "./UserProfileCard";
import NeedsAttention from "./NeedsAttention";
import InfoCard from "./InfoCard";
import ModerationCard from "./ModerationCard";
import StatCard from "./StatCard";
import { useNavigate, useParams } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import ActivityData from "./ActivityData";
import ModerationHistory from "./ModerationHistory";
import { toast } from "react-toastify";
import IsLoadingHOC from "../Common/IsLoadingHOC";
import { authAxios } from "../../Config/config";
import { useEffect, useState } from "react";
import { formatText } from "../../Helper/helper";
import {
  FiImage,
  FiSlash,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiUserX,
} from "react-icons/fi";
import Tooltip from "../Common/Tooltip";
import UserUpdateStatus from "../../Pages/Admin/AllUsers/UserUpdateStatus";
import { FaBan, FaHeart, FaUserSlash } from "react-icons/fa";
import { PiWaveformBold } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const formatDOB = (dob) => {
  if (!dob) return "";

  return new Date(dob).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const timeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    y: 31536000,
    mo: 2592000,
    d: 86400,
    h: 3600,
    m: 60,
  };

  for (const key in intervals) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `${value}${key} ago`;
    }
  }

  return `${seconds}s ago`;
};

// Same status-driven action set used on the All Users list, so behavior stays
// consistent between the list view and this detail view.
const getActionItems = (status) => {
  switch (status) {
    case "ACTIVE":
      return [
        {
          label: "Suspend",
          action: "SUSPENDED",
          icon: FaUserSlash,
          className:
            "text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
        },
        {
          label: "Ban",
          action: "BANNED",
          icon: FaBan,
          className: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100",
        },
      ];

    case "SUSPENDED":
      return [
        {
          label: "Ban",
          action: "BANNED",
          icon: FaBan,
          className: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100",
        },
        {
          label: "Reinstate",
          action: "ACTIVE",
          icon: FiUserCheck,
          className:
            "text-green-700 bg-green-50 border-green-200 hover:bg-green-100",
        },
      ];

    case "BANNED":
      return [
        {
          label: "Unban",
          action: "ACTIVE",
          icon: FiUserCheck,
          className:
            "text-green-700 bg-green-50 border-green-200 hover:bg-green-100",
        },
      ];

    case "DEACTIVATED":
      return [
        {
          label: "Reactivate",
          action: "ACTIVE",
          icon: FiUserCheck,
          className:
            "text-green-700 bg-green-50 border-green-200 hover:bg-green-100",
        },
      ];

    default:
      return [];
  }
};

// Top row card: icon circle + big number + label, with left accent bar
const ActivityCard = ({ icon, iconBg, accentColor, value, label }) => (
  <div className="relative bg-white rounded-xl box--shadow p-4 flex items-center gap-4 overflow-hidden">
    <span
      className="absolute left-0 top-0 h-full w-1"
      style={{ backgroundColor: accentColor }}
    />
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: iconBg }}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {value ?? 0}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

// Bottom row card: icon circle + label (left), value (right)
const MetricCard = ({ icon, iconBg, label, value }) => (
  <div className="bg-white rounded-xl box--shadow p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-lg font-semibold text-gray-900">{value ?? 0}</span>
  </div>
);

const ViewUser = (props) => {
  const { setLoading } = props;
  const navigate = useNavigate();
  const { id } = useParams();

  const [basicInfoUser, setBasicInfoUser] = useState([]);

  // Modal state for suspend/ban/reinstate, mirroring AllUsersList
  const [statusModal, setStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const basicInfo = [
    ["Full Name", basicInfoUser?.name],
    [
      "Mobile Number",
      `+${basicInfoUser?.country_code} ${basicInfoUser?.mobile}`,
    ],
    ["Email", basicInfoUser?.email || "--"],
    ["Gender", formatText(basicInfoUser?.gender) || "--"],
    ["Date of Birth", formatDOB(basicInfoUser?.date_of_birth) || "--"],
    ["Device Brand", basicInfoUser?.device_brand || "--"],
    ["Device Model", basicInfoUser?.device_model || "--"],
  ];

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      const response = await authAxios().get(`/user/${id}`);
      const resData = response.data;

      if (resData?.success) {
        setBasicInfoUser(resData?.data || []);
      }

      // console.log(resData,'resData')
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  // console.log(basicInfoUser,'basicInfoUser')

  const openStatusModal = (targetStatus) => {
    setSelectedStatus(targetStatus);
    setStatusModal(true);
  };

  const closeStatusModal = () => {
    setStatusModal(false);
    setSelectedStatus(null);
  };

  // Called by UserUpdateStatus once the reason/dates are filled in and confirmed.
  // payload already has the right shape, e.g.:
  // { status: 'SUSPEND', suspend_start_date_time, suspend_end_date_time, reason }
  const handleStatusUpdate = async (payload) => {
    try {
      await authAxios().put(`/user/${id}`, payload);

      toast.success("User status updated successfully.");

      closeStatusModal();
      fetchUserDetails(); // refresh the page with the new status
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/all-users")}
          className="text-sm text-black hover:underline flex gap-2 items-center"
        >
          <MdOutlineKeyboardBackspace /> <span>Back to All Users</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-5">
          <UserProfileCard basicInfoUser={basicInfoUser} />
          {/* Suspend / Ban / Reinstate actions for this user */}
          <div className="flex items-center gap-2">
            {getActionItems(basicInfoUser?.status).map((item) => {
              const Icon = item.icon;

              return (
                <Tooltip
                  key={item.action}
                  id={`tooltip-view-user-${item.action}`}
                  content={item.label}
                  place="bottom"
                >
                  <button
                    type="button"
                    title={item.label}
                    onClick={() => openStatusModal(item.action)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition ${item.className}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          <TabGroup>
            <TabList className="mb-3 flex gap-3 border-b border-b-gray-300">
              <Tab className="rounded-t-lg lg:px-5 px-4 py-2 lg:text-sm text-[12px] font-medium transition outline-none data-[selected]:bg-black data-[selected]:text-white data-[hover]:bg-blue-50">
                Profile Details
              </Tab>

              <Tab className="rounded-t-lg lg:px-5 px-4 py-2 lg:text-sm text-[12px] font-medium transition outline-none data-[selected]:bg-black data-[selected]:text-white data-[hover]:bg-blue-50">
                Moderation History
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="space-y-4">
                  {/* <NeedsAttention /> */}
                  <InfoCard title="Basic Information" rows={basicInfo} />
                  {/* <div className="block">
                    <div>
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Community Activity
                      </h2>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatCard
                          title="Hot Takes"
                          value={basicInfoUser?.posts_count}
                        />
                        <StatCard title="Deep Dives" value={basicInfoUser?.articles_count} />
                        <StatCard title="Vibe Checks" value={basicInfoUser?.polls_count} />
                        <StatCard title="Like" value={basicInfoUser?.likes_count} />
                        <StatCard title="Comments" value={basicInfoUser?.comments_count} />
                        <StatCard title="Followed Tribes" value={basicInfoUser?.followed_tribes_count} />
                        <StatCard title="Followers" value={basicInfoUser?.followers_count} />
                        <StatCard title="Following" value={basicInfoUser?.following_count} />
                      </div>
                    </div>
                  </div> */}
                  <div className="block">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Activity
                    </h2>

                    {/* Top row - 3 stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <ActivityCard
                        icon={<FiImage size={20} className="text-indigo-500" />}
                        iconBg="#EEF2FF"
                        accentColor="#6366F1"
                        value={basicInfoUser?.posts_count}
                        label="Hot takes posted"
                      />
                      <ActivityCard
                        icon={
                          <HiOutlineDocumentText
                            size={20}
                            className="text-emerald-600"
                          />
                        }
                        iconBg="#D1FAE5"
                        accentColor="#059669"
                        value={basicInfoUser?.articles_count}
                        label="Deep Dives posted"
                      />
                      <ActivityCard
                        icon={
                          <PiWaveformBold
                            size={20}
                            className="text-purple-500"
                          />
                        }
                        iconBg="#EDE9FE"
                        accentColor="#7C3AED"
                        value={basicInfoUser?.polls_count}
                        label="Vibe Checks posted"
                      />
                    </div>

                    {/* Bottom row - 4 metric cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        icon={<FaHeart size={16} className="text-red-500" />}
                        iconBg="#FEE2E2"
                        label="Likes"
                        value={basicInfoUser?.likes_count}
                      />
                      <MetricCard
                        icon={
                          <HiOutlineChatBubbleLeftRight
                            size={16}
                            className="text-indigo-500"
                          />
                        }
                        iconBg="#EDE9FE"
                        label="Comment"
                        value={basicInfoUser?.comments_count}
                      />
                      <MetricCard
                        icon={
                          <FiUsers size={16} className="text-emerald-600" />
                        }
                        iconBg="#D1FAE5"
                        label="Followers"
                        value={basicInfoUser?.followers_count}
                      />
                      <MetricCard
                        icon={<FiUser size={16} className="text-yellow-600" />}
                        iconBg="#FEF3C7"
                        label="Followings"
                        value={basicInfoUser?.following_count}
                      />
                    </div>

                    {/* <ModerationCard /> */}
                  </div>
                </div>
              </TabPanel>
              {/* end Profile Details */}

              <TabPanel>
                <ModerationHistory />
              </TabPanel>
              {/* end Moderation History */}
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      <UserUpdateStatus
        isOpen={statusModal}
        onClose={closeStatusModal}
        user={basicInfoUser}
        action={selectedStatus}
        onSubmit={handleStatusUpdate}
      />
    </div>
  );
};

export default IsLoadingHOC(ViewUser);
