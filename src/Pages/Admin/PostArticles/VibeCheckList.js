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
  formatText,
  formatViewDate,
  formatWithTimeDate,
} from "../../../Helper/helper";
import { IoMdCloseCircle, IoMdEye } from "react-icons/io";
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import { format } from "date-fns";
import ViewPollDetails from "./ViewPollDetails";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import Select from "react-select";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { BiSortAlt2 } from "react-icons/bi";

const statusType = [
  { label: "Published", value: "PUBLISHED" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "Under Review", value: "UNDER_REVIEW" },
];

const VibeCheckList = (props) => {
  const { setLoading } = props;
  const [hotTakeList, setHotTakeList] = useState([]);
  const [viewPostDetails, setViewPostDetails] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [tribeList, setTribeList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [filterUserNameGroup, setFilterUserNameGroup] = useState(null);
  const [filterTribeGroup, setFilterTribeGroup] = useState(null);
  const [filterTribe, setFilterTribe] = useState(null);

  const [sortBy, setSortBy] = useState(null); // 'likes_count' | 'comments_count'
  const [sortOrder, setSortOrder] = useState("DESC"); // 'DESC' | 'ASC'

  const [tribeGroupOptions, setTribeGroupOptions] = useState([]);
  const [tribeOptions, setTribeOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHotTakeList = async (
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

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (filterUserNameGroup?.value) {
        params.user_id = filterUserNameGroup.value;
      }

      if (filterTribeGroup?.value) {
        params.circle_group_id = filterTribeGroup.value;
      }

      if (filterTribe?.value) {
        params.circle_id = filterTribe.value;
      }

      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_order = sortOrder;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      const response = await authAxios().get("/poll", {
        params,
      });

      const resData = response.data;

      if (resData.success) {
        setHotTakeList(resData.data.items);
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
    // If only one date is selected, do nothing.
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }

    fetchHotTakeList(debouncedSearch);
  }, [
    debouncedSearch,
    startDate,
    endDate,
    statusFilter,
    filterTribeGroup,
    filterTribe,
    filterUserNameGroup,
    sortBy,
    sortOrder,
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
  }, [startDate, endDate]);

  const fetchUsersList = async () => {
    try {
      const params = {
        limit: 5000,
      };
      const response = await authAxios().get("/user", {
        params,
      });
      const resData = response?.data;

      console.log(resData, "resData");

      if (resData?.success) {
        const options = (resData.data.items || []).map((group) => ({
          value: group.id,
          label: group.username,
        }));
        console.log(options, "options");
        setUserOptions(options);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load tribe groups",
      );
    }
  };

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
    fetchUsersList();
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

  const handleUserNameChange = (option) => {
    setFilterUserNameGroup(option);
    setPage(1);
  };

  const handleTribeChange = (option) => {
    setFilterTribe(option);
    setPage(1);
  };

  const handleSortToggle = (column) => {
    setPage(1);
    if (sortBy === column) {
      // same column clicked again -> flip order
      setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    } else {
      // new column -> default to DESC
      setSortBy(column);
      setSortOrder("DESC");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex lg:flex-row flex-col-reverse justify-between lg:gap-3 gap-2 w-full relative">
            <div className="flex lg:flex-nowrap flex-wrap gap-2 lg:items-center">
              <div className="md:min-w-[200px] w-full">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  defaultPreset="Today"
                  panelOffsetTop={100}
                  panelOffsetLeft={0}
                />
              </div>
              <div className="lg:min-w-[180px] lg:w-fit w-[48%]">
                <Select
                  placeholder="Filter by status"
                  value={
                    statusType.find((o) => o.value === statusFilter) || null
                  }
                  options={statusType}
                  onChange={handleStatusChange}
                  isClearable
                  styles={customStyles}
                />
              </div>
              <div className="lg:min-w-[180px] lg:w-fit w-[48%]">
                <Select
                  value={filterUserNameGroup}
                  options={userOptions}
                  onChange={handleUserNameChange}
                  styles={customStyles}
                  placeholder="Filter by Username"
                  isClearable
                />
              </div>
              <div className="lg:min-w-[180px] lg:w-fit w-[48%]">
                <Select
                  value={filterTribeGroup}
                  options={tribeGroupOptions}
                  onChange={handleTribeGroupChange}
                  styles={customStyles}
                  placeholder="Select Tribe Group"
                  isClearable
                />
              </div>
              <div className="lg:min-w-[170px] lg:w-fit w-[48%]">
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

            <div className="flex-1 flex lg:justify-end">
              {/* Search */}
              <div className="lg:max-w-[300px] w-full ">
                <input
                  type="text"
                  placeholder="Search by question..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="custom--input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[100px]">Content ID</th>
                    <th className="px-2 py-4 min-w-[150px]">Titile</th>
                    {/* <th className="px-2 py-4 ">Allow Multi. Votes</th> */}
                    <th className="px-2 py-4 min-w-[100px]">Created At</th>
                    <th className="px-2 py-4 min-w-[100px]">End Date</th>
                    <th className="px-2 py-4 min-w-[100px]">Username</th>
                    <th className="px-2 py-4 min-w-[100px]">Tribe Group</th>
                    <th className="px-2 py-4 min-w-[150px]">Tribe Name</th>

                    <th
                      className="px-2 py-4 min-w-[80px] text-center cursor-pointer select-none"
                      onClick={() => handleSortToggle("likes_count")}
                    >
                      <div className="flex gap-2 justify-center align-center">
                        <span>Likes</span>
                        <span>
                          {sortBy === "likes_count" ? (
                            sortOrder === "DESC" ? (
                              <TiArrowSortedDown size={15} />
                            ) : (
                              <TiArrowSortedUp size={15} />
                            )
                          ) : (
                            <BiSortAlt2 size={15} />
                          )}
                        </span>
                      </div>
                    </th>
                    <th
                      className="px-2 py-4 min-w-[100px] text-center cursor-pointer select-none"
                      onClick={() => handleSortToggle("comments_count")}
                    >
                      <div className="flex gap-2 justify-center align-center">
                        <span>Comments</span>
                        <span>
                          {sortBy === "comments_count" ? (
                            sortOrder === "DESC" ? (
                              <TiArrowSortedDown size={15} />
                            ) : (
                              <TiArrowSortedUp size={15} />
                            )
                          ) : (
                            <BiSortAlt2 size={15} />
                          )}
                        </span>
                      </div>
                    </th>
                    <th
                      className="px-2 py-4 min-w-[100px] text-center cursor-pointer select-none"
                      onClick={() => handleSortToggle("total_votes")}
                    >
                      <div className="flex gap-2 justify-center align-center">
                        <span>Votes</span>
                        <span>
                          {sortBy === "total_votes" ? (
                            sortOrder === "DESC" ? (
                              <TiArrowSortedDown size={15} />
                            ) : (
                              <TiArrowSortedUp size={15} />
                            )
                          ) : (
                            <BiSortAlt2 size={15} />
                          )}
                        </span>
                      </div>
                    </th>
                    <th className="px-2 py-4 text-center min-w-[150px]">
                      Status
                    </th>

                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {hotTakeList?.length > 0 ? (
                    hotTakeList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">{row.content_id || "--"}</td>
                        <td className="px-2 py-4">{row.question || "-"}</td>
                        {/* <td className="px-2 py-4">
                          {row.allows_multiple_votes ? "Yes" : "No"}
                        </td> */}
                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at)}
                        </td>
                        <td className="px-2 py-4">
                          {formatViewDate(row.poll_ends_at)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.user?.username || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.circle?.circleGroup?.name || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.circle?.name || "--"}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.likes_count || 0}
                        </td>
                        <td className="px-2 py-4 text-center">
                          {row.comments_count || 0}
                        </td>
                        <td className="px-2 py-4 text-center">
                          {row.total_votes || 0}
                        </td>
                        <td className="px-2 py-4 text-center">
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
              currentDataLength={hotTakeList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchHotTakeList(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <ViewPollDetails
        open={viewPostDetails}
        onClose={() => {
          setViewPostDetails(false);
          setEditPostId(null);
        }}
        editId={editPostId}
        onSuccess={() => fetchHotTakeList()}
      />
    </>
  );
};

export default IsLoadingHOC(VibeCheckList);
