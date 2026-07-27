import React, { useEffect, useState } from "react";
import Pagination from "../Common/Pagination";
import {
  formatViewDate,
  formatViewTime,
  formatWithTimeDate,
} from "../../Helper/helper";
import IsLoadingHOC from "../Common/IsLoadingHOC";
import { authAxios } from "../../Config/config";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const UserTribeList = (props) => {
  const { setLoading } = props;
  const { id } = useParams();
  const [userTribeList, setUserTribeList] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUserTribeDataList = async (currentPage = page) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      const response = await authAxios().get(`/user/tribes/${id}`, {
        params,
      });
      const resData = response.data;

      if (resData.success) {
        const items = resData.data.items;
        const stats = resData.data.stats;
        setUserTribeList(items);
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
    if (!id) return;

    setPage(1);
    fetchUserTribeDataList(1);
  }, [id]);

  return (
    <div className="mt-5">
      {userTribeList?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {userTribeList.map((row, index) => (
            <div
              key={row.id || index}
              className="box--shadow bg-white rounded-[15px] p-3 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex lg:flex-row flex-col lg:items-center lg:gap-4 gap-2">
                {/* Image */}
                <img
                  src={row?.cover_image_url}
                  alt={row?.name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />

                <div className="flex flex-col gap-1 flex-1">
                  {/* Tribe */}
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs text-gray-600">Tribe:</span>
                    <span className="text-xs font-semibold text-gray-800 text-right">
                      {row?.name || "--"}
                    </span>
                  </div>

                  {/* Tribe Group */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Tribe Group:</span>
                    <span className="text-xs font-medium text-gray-700 text-right">
                      {row?.circleGroup?.name || "--"}
                    </span>
                  </div>

                  {/* Date of Following */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Date of Following:
                    </span>
                    <span className="text-xs text-gray-600 text-right">
                      {row.joined_at ? formatWithTimeDate(row.joined_at) : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="box--shadow bg-white rounded-[15px] p-10 flex flex-col items-center justify-center text-gray-400">
          <span>No records found.</span>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={userTribeList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchUserTribeDataList(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default IsLoadingHOC(UserTribeList);
