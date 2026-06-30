import UserProfileCard from "./UserProfileCard";
import NeedsAttention from "./NeedsAttention";
import InfoCard from "./InfoCard";
import ModerationCard from "./ModerationCard";
import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import ActivityData from "./ActivityData";
import ModerationHistory from "./ModerationHistory";

const ViewUser = () => {
  const navigate = useNavigate();
  const basicInfo = [
    ["Full Name", "Aarav Sharma"],
    ["Mobile Number", "+91 98XXXXXX21"],
    ["Email", "Not Set"],
    ["Gender", "Male"],
    ["Date of Birth", "05 Aug 1995"],
    ["City / Pincode", "Mumbai / 400001"],
  ];

  const accountInfo = [
    ["User ID", "MOT100482"],
    ["Registered On", "12 Jan 2026"],
    ["DPDP Consent", "Pending"],
    ["Account Status", "Active"],
  ];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-black hover:underline flex gap-2 items-center"
        >
          <MdOutlineKeyboardBackspace /> <span>Back to All Users</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-5">
          <UserProfileCard />
        </div>

        <div className="lg:col-span-3">
          <TabGroup>
            <TabList className="mb-3 flex gap-3 border-b border-b-gray-300">
              <Tab className="rounded-t-lg lg:px-5 px-4 py-2 lg:text-sm text-[12px] font-medium transition outline-none data-[selected]:bg-black data-[selected]:text-white data-[hover]:bg-blue-50">
                Profile Details
              </Tab>

              <Tab className="rounded-t-lg lg:px-5 px-4 py-2 lg:text-sm text-[12px] font-medium transition outline-none data-[selected]:bg-black data-[selected]:text-white data-[hover]:bg-blue-50">
                Activity
              </Tab>

              <Tab className="rounded-t-lg lg:px-5 px-4 py-2 lg:text-sm text-[12px] font-medium transition outline-none data-[selected]:bg-black data-[selected]:text-white data-[hover]:bg-blue-50">
                Moderation History
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="space-y-4">
                  <NeedsAttention />
                  <InfoCard title="Basic Information" rows={basicInfo} />
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <InfoCard title="Account & Consent" rows={accountInfo} />
                    </div>
                    <ModerationCard />
                  </div>
                  <div>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Community Activity
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <StatCard title="Posts" value="34" />
                      <StatCard title="Replies" value="88" />
                      <StatCard title="Reactions" value="210" />
                      <StatCard title="Last Active" value="2h ago" />
                    </div>
                  </div>
                </div>
              </TabPanel>
              {/* end Profile Details */}

              <TabPanel>
                <ActivityData />
              </TabPanel>
              {/* end Activity Data */}

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

export default ViewUser;
