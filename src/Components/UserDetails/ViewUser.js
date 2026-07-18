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

const ViewUser = (props) => {
  const { setLoading } = props;
  const navigate = useNavigate();
  const { id } = useParams();

  const [basicInfoUser, setBasicInfoUser] = useState([]);

  const basicInfo = [
    ["Full Name", basicInfoUser?.name],
    ["Mobile Number", `+${basicInfoUser?.country_code} ${basicInfoUser?.mobile}`],
    ["Email", basicInfoUser?.email],
    ["Gender", formatText(basicInfoUser?.gender)],
    ["Date of Birth", formatDOB(basicInfoUser?.date_of_birth)],
  ];

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      const response = await authAxios().get(`/user/${id}`);
      const resData = response.data;

      if(resData?.success){
          setBasicInfoUser(resData?.data || [])
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

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/all-users')}
          className="text-sm text-black hover:underline flex gap-2 items-center"
        >
          <MdOutlineKeyboardBackspace /> <span>Back to All Users</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-5">
          <UserProfileCard basicInfoUser={basicInfoUser} />
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
                  <div className="block">
                    <div>
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Community Activity
                      </h2>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatCard title="Hot Takes" value={basicInfoUser?.posts_count} />
                        <StatCard title="Deep Dives" value="88" />
                        <StatCard title="Vibe Checks" value="210" />
                        <StatCard title="Like" value="210" />
                        <StatCard title="Comments" value="210" />
                        <StatCard title="Followed Tribes" value="210" />
                        <StatCard title="Followers" value="210" />
                        <StatCard title="Following" value="210" />
                      </div>
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
    </div>
  );
};

export default IsLoadingHOC(ViewUser);
