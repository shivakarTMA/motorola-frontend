import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authAxios } from "../../Config/config";
import { formatText } from "../../Helper/helper";

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

const ActivityData = ({ id }) => {
  const [userActifityData, setUserActivityData] = useState([]);

  const fetchUserActivity = async () => {
    try {
      const response = await authAxios().get(`/user/activity/${id}`);
      const resData = response.data;

      if (resData?.success) {
        setUserActivityData(resData?.data?.items || []);
      }

      // console.log(resData,'resData')
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchUserActivity();
  }, [id]);

  console.log(userActifityData, "userActifityData");

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white">
      {userActifityData?.length > 0 ? (
        userActifityData.map((item, index) => (
          <div
            key={item.id}
            className="relative flex lg:flex-row flex-col lg:gap-2 gap-4 items-start justify-between border-b border-gray-100 px-5 py-4 last:border-none"
          >
            <div className="flex items-center">
              <div className="relative mr-4 flex ">
                <span className="z-10 h-3 w-3 rounded-full bg-gray-300" />
              </div>

              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{item.action}</span>{" "}
                  <span className="text-gray-500">in Circle:</span>{" "}
                  <span className="font-medium">{item.circle}</span>
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {timeAgo(item.created_at)}
                </p>
              </div>
            </div>

            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs capitalize text-gray-500 lg:ml-0 ml-6">
              {item.reference_type !== "CIRCLE"
                ? formatText(item.reference_type)
                : "Tribe"}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center p-5 text-gray-400">
          <p>No Activity found.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityData;
