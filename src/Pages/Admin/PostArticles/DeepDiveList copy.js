import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import {
  customStyles,
  filterActiveItems,
  formatText,
  formatViewDate,
  formatWithTimeDate,
} from "../../../Helper/helper";
import { IoMdCloseCircle } from "react-icons/io";
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import Select from "react-select";
import ViewArticleDetails from "./ViewArticleDetails";

const statusType = [
  { label: "Published", value: "PUBLISHED" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "Under Review", value: "UNDER_REVIEW" },
];

const DeepDiveList = (props) => {
  const { setLoading } = props;
  const [deepDiveList, setDeepDiveList] = useState([]);
  const [viewPostDetails, setViewPostDetails] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [tribeList, setTribeList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [filterTribeGroup, setFilterTribeGroup] = useState(null);
  const [filterTribe, setFilterTribe] = useState(null);

  const [tribeGroupOptions, setTribeGroupOptions] = useState([]);
  const [tribeOptions, setTribeOptions] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDeepDiveList = async (currentPage = page) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: rowsPerPage,
        type: "ARTICLE",
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (filterTribeGroup?.value) {
        params.circle_group_id = filterTribeGroup.value;
      }

      if (filterTribe?.value) {
        params.circle_id = filterTribe.value;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      const response = await authAxios().get("/post", {
        params,
      });

      const resData = response.data;

      if (resData.success) {
        setDeepDiveList(resData.data.items);
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
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }

    fetchDeepDiveList(page);
  }, [page, startDate, endDate, statusFilter, filterTribeGroup, filterTribe]);

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
  }, []);

  const groupOptions = tribeList.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  const handleStatusChange = (option) => {
    setPage(1);
    setStatusFilter(option?.value || null);
  };

  const handleTribeGroupChange = (option) => {
    setFilterTribeGroup(option);
    setFilterTribe(null);
    setPage(1);
  };

  const handleTribeChange = (option) => {
    setFilterTribe(option);
    setPage(1);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 relative">
          <div className="flex lg:flex-row flex-col gap-2 flex-1">
            <div className="lg:min-w-[200px] w-fit">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
              />
            </div>

            <div className="min-w-[180px] w-fit">
              <Select
                placeholder="Filter by status"
                value={statusType.find((o) => o.value === statusFilter) || null}
                options={statusType}
                onChange={handleStatusChange}
                isClearable
                styles={customStyles}
              />
            </div>
            <div className="min-w-[180px] w-fit">
              <Select
                value={filterTribeGroup}
                options={tribeGroupOptions}
                onChange={handleTribeGroupChange}
                styles={customStyles}
                placeholder="Select Tribe Group"
                isClearable
              />
            </div>

            <div className="min-w-[170px] w-fit">
              <Select
                value={filterTribe}
                options={tribeOptions}
                onChange={handleTribeChange}
                styles={customStyles}
                placeholder="Select Tribe"
                isClearable
                isDisabled={!filterTribeGroup}
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
                    <th className="px-2 py-4 min-w-[120px]">Created Date</th>

                    {/* <th className="px-2 py-4 min-w-[80px] text-center">
                      Media
                    </th> */}
                    <th className="px-2 py-4 min-w-[100px]">Content ID</th>
                    <th className="px-2 py-4 min-w-[100px]">Username</th>
                    <th className="px-2 py-4 min-w-[150px]">Tribe Group</th>
                    <th className="px-2 py-4 min-w-[170px]">Tribe Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Title</th>
                    <th className="px-2 py-4 min-w-[120px]">Status</th>
                    {/* <th className="px-2 py-4 min-w-[100px] text-center">
                      Pinned
                    </th> */}
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Likes
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      Comments
                    </th>

                    {/* <th className="px-2 py-4 min-w-[100px]">
                      Created By
                    </th> */}

                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deepDiveList?.length > 0 ? (
                    deepDiveList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at)}
                        </td>

                        {/* <td className="px-2 py-4 text-center">
                          {row.media?.[0]?.media ? (
                            <img
                              src={row.media[0].media}
                              alt="Post"
                              className="w-8 h-8 object-cover rounded-full mx-auto"
                            />
                          ) : (
                            <span className="text-gray-400">No Media</span>
                          )}
                        </td> */}

                        <td className="px-2 py-4">{row.content_id || "-"}</td>
                        <td className="px-2 py-4">
                          {row.user?.username || "-"}
                        </td>
                        <td className="px-2 py-4">
                          {row.circle?.circleGroup?.name || "-"}
                        </td>
                        <td className="px-2 py-4">{row.circle?.name || "-"}</td>
                        <td className="px-2 py-4">{row.title || "-"}</td>

                        <td className="px-2 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              {
                                PUBLISHED: "bg-green-100 text-green-700",
                                UNDER_REVIEW: "bg-blue-100 text-blue-700",
                                HIDDEN: "bg-gray-200 text-gray-700",
                                DELETED: "bg-red-100 text-red-700",
                                BANNED: "bg-yellow-100 text-yellow-700",
                              }[row.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatText(row.status)}
                          </span>
                        </td>

                        {/* <td className="px-2 py-4 text-center">
                          {row.is_pinned ? "Yes" : "No"}
                        </td> */}

                        <td className="px-2 py-4 text-center">
                          {row.likes_count}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.comments_count}
                        </td>

                        {/* <td className="px-2 py-4">
                          {row.user?.name || "-"}
                        </td> */}

                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center">
                            <Tooltip
                              id={`tooltip-view-${row.id}`}
                              content="View"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setEditPostId(row.id);
                                  setViewPostDetails(true);
                                }}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-md"
                              >
                                <FiEye size={18} />
                              </button>
                            </Tooltip>
                          </div>
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
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={DeepDiveList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchDeepDiveList(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <ViewArticleDetails
        open={viewPostDetails}
        onClose={() => {
          setViewPostDetails(false);
          setEditPostId(null);
        }}
        editId={editPostId}
        onSuccess={() => fetchDeepDiveList()}
      />
    </>
  );
};

export default IsLoadingHOC(DeepDiveList);
