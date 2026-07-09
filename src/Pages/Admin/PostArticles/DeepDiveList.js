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
import { IoMdCloseCircle } from "react-icons/io";
import DatePicker from "react-datepicker"; // Import datepicker for custom date selection
import "react-datepicker/dist/react-datepicker.css"; // Import default datepicker styles
import { format } from "date-fns";
import ViewArticleDetails from "./ViewArticleDetails";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const DeepDiveList = (props) => {
  const { setLoading } = props;
  const [hotTakeList, setHotTakeList] = useState([]);
  const [viewPostDetails, setViewPostDetails] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Media",
      center: true,
      cell: (row) =>
        row.media?.[0]?.media ? (
          <img
            src={row.media[0].media}
            alt="Post"
            className="w-8 h-8 object-cover rounded-full"
          />
        ) : (
          <span className="text-gray-400">No Media</span>
        ),
    },
    {
      name: "Title",
      selector: (row) => row.title || "-",
      sortable: true,
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
      name: "Pinned",
      selector: (row) => (row.is_pinned ? "Yes" : "No"),
      center: true,
    },
    {
      name: "Likes",
      selector: (row) => row.likes_count,
      center: true,
    },
    {
      name: "Comments",
      selector: (row) => row.comments_count,
      center: true,
    },
    {
      name: "Tribe Name",
      selector: (row) => row.circle?.name || "-",
      //   sortable: true,
      center: true,
    },
    {
      name: "Created By",
      selector: (row) => row.user?.name || "-",
      //   sortable: true,
      center: true,
    },
    {
      name: "Username",
      selector: (row) => row.user?.username || "-",
      //   sortable: true,
      center: true,
    },
    {
      name: "Created At",
      selector: (row) => formatViewDate(row.created_at),
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
              title="Edit"
            >
              <MdModeEdit size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const fetchHotTakeList = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: rowsPerPage,
        type: "ARTICLE",
      };

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

    fetchHotTakeList(currentPage);
  }, [currentPage, startDate, endDate]);

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 relative">
          <div className="w-full max-w-[180px]">
            <div className="custom--date">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
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

      <ViewArticleDetails
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

export default IsLoadingHOC(DeepDiveList);
