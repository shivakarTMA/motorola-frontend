import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import {
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

const VibeCheckList = (props) => {
  const { setLoading } = props;
  const [hotTakeList, setHotTakeList] = useState([]);
  const [viewPostDetails, setViewPostDetails] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    {
      name: "Post ID",
      selector: (row) => row.id || "-",
      sortable: true,
    },
    {
      name: "Question",
      selector: (row) => row.question || "-",
      // sortable: true,
    },
    {
      name: "Allow Multi. Votes",
      selector: (row) => (row.allows_multiple_votes ? "Yes" : "No"),
      // center: true,
      width: "150px",
    },

    {
      name: "End Date",
      selector: (row) => formatViewDate(row.poll_ends_at),
      //   sortable: true,
      center: true,
    },
    {
      name: "Status",
      center: true,
      cell: (row) => {
        const statusColors = {
          PUBLISHED: "bg-green-100 text-green-700",
          UNDER_REVIEW: "bg-blue-100 text-blue-700",
          HIDDEN: "bg-gray-200 text-gray-700",
          DELETED: "bg-red-100 text-red-700",
          BANNED: "bg-yellow-100 text-yellow-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[row.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {formatText(row.status)}
          </span>
        );
      },
      width: "140px",
    },
    {
      name: "Total Votes",
      selector: (row) => row.total_votes,
      center: true,
    },
    {
      name: "Created At",
      selector: (row) => formatViewDate(row.created_at),
      //   sortable: true,
      center: true,
    },
    {
      name: "Tribe Name",
      selector: (row) => row.circle?.name,
      center: true,
    },
    {
      name: "User",
      selector: (row) => row.user?.name || "-",
      //   sortable: true,
      center: true,
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-view-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => {
                setEditPostId(row.id);
                setViewPostDetails(true);
              }}
              className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
              title="View"
            >
              <IoMdEye size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

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
  }, [debouncedSearch, startDate, endDate]);

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

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex md:flex-row flex-col-reverse lg:gap-3 gap-2 lg:w-[65%] w-full relative">
            <div className="md:max-w-[200px] w-full">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
              />
            </div>
            <div className="flex-1">
              {/* Search */}
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

        {/* <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={hotTakeList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total}
          />
        </div> */}
        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 ">Post ID</th>
                    <th className="px-2 py-4 ">Question</th>
                    <th className="px-2 py-4 ">Allow Multi. Votes</th>
                    <th className="px-2 py-4 ">End Date</th>
                    <th className="px-2 py-4 ">Status</th>
                    <th className="px-2 py-4 ">Total Votes</th>
                    <th className="px-2 py-4 ">Created At</th>
                    <th className="px-2 py-4 ">Tribe Name</th>
                    <th className="px-2 py-4 ">User</th>
                    <th className="px-2 py-4 ">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {hotTakeList?.length > 0 ? (
                    hotTakeList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">{row.id || "-"}</td>
                        <td className="px-2 py-4">{row.question || "-"}</td>
                        <td className="px-2 py-4">
                          {row.allows_multiple_votes ? "Yes" : "No"}
                        </td>
                        <td className="px-2 py-4">
                          {formatViewDate(row.poll_ends_at)}
                        </td>
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

                        <td className="px-2 py-4">{row.total_votes || 0}</td>
                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at)}
                        </td>
                        <td className="px-2 py-4">
                          {row.circle?.name || "--"}
                        </td>
                        <td className="px-2 py-4">{row.user?.name || "--"}</td>

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
