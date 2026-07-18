import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
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

const VibeCheckList = (props) => {
  const { setLoading } = props;
  const [hotTakeList, setHotTakeList] = useState([]);
  const [viewPostDetails, setViewPostDetails] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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
      width:"150px"
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

  const fetchHotTakeList = async (page = 1, searchText = debouncedSearch) => {
    try {
      setLoading(true);

      const params = {
        page,
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
        setPagination(resData.data.pagination);
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

    fetchHotTakeList(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
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

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={hotTakeList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total}
          />
        </div>
      </div>

      <ViewPollDetails
        open={viewPostDetails}
        onClose={() => {
          setViewPostDetails(false);
          setEditPostId(null);
        }}
        editId={editPostId}
        onSuccess={() => fetchHotTakeList(currentPage)}
      />
    </>
  );
};

export default IsLoadingHOC(VibeCheckList);
