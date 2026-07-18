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
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const activitiData = [
  {
    report_id: "Mod0001",
    reported_date: "03/07/2026",
    reported_time: "12:05",
    item_type: "Comment",
    reported_user: "@user_x",
    tribe: "Gaming",
    post_title: "bvghebqljihq",
    source: "Keyword auto-flag",
    reason: "Abuse",
    action: "Removed",
    actioned_by: "@nikhil.tma",
    resolution_time: "12:20",
    status: "Resolved",
  },
  {
    report_id: "Mod0002",
    reported_date: "04/07/2026",
    reported_time: "13:05",
    item_type: "Hot Take",
    reported_user: "@nitin.tma",
    tribe: "Tech",
    post_title: "bvghebqljihq",
    source: "User report",
    reason: "Spam",
    action: "Approved",
    actioned_by: "@sara.tma",
    resolution_time: "13:20",
    status: "Resolved",
  },
  {
    report_id: "Mod0003",
    reported_date: "06/07/2026",
    reported_time: "14:05",
    item_type: "Vibe Check",
    reported_user: "@sara.tma",
    tribe: "Gaming",
    post_title: "bvghebqljihq",
    source: "Keyword auto-flag",
    reason: "Misinformation",
    action: "Warned",
    actioned_by: "@nikhil.tma",
    resolution_time: "14:20",
    status: "Resolved",
  },
  {
    report_id: "Mod0004",
    reported_date: "06/07/2026",
    reported_time: "15:05",
    item_type: "Comment",
    reported_user: "@user_y",
    tribe: "Tech",
    post_title: "bvghebqljihq",
    source: "User report",
    reason: "Abuse",
    action: "Suspended",
    actioned_by: "@sara.tma",
    resolution_time: "15:20",
    status: "Pending",
  },
  {
    report_id: "Mod0005",
    reported_date: "07/07/2026",
    reported_time: "16:05",
    item_type: "Deep Dive",
    reported_user: "@arjun.tma",
    tribe: "Tech",
    post_title: "bvghebqljihq",
    source: "User report",
    reason: "Spam",
    action: "Dismissed",
    actioned_by: "@sara.tma",
    resolution_time: "16:20",
    status: "Resolved",
  },
];

const ModerationQueue = (props) => {
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
      name: "Report ID",
      selector: (row) => row.report_id,
      // sortable: true,
      width: "110px",
    },
    {
      name: "Reported Date",
      selector: (row) => row.reported_date,
      center: true,
      width: "150px",
    },
    {
      name: "Reported Time",
      selector: (row) => row.reported_time,
      center: true,
      width: "150px",
    },
    {
      name: "Item Type",
      selector: (row) => row.item_type,
      center: true,
      width: "110px",
    },
    {
      name: "Reported",
      selector: (row) => row.reported_user,
      center: true,
      width: "110px",
    },
    {
      name: "Tribe",
      selector: (row) => row.tribe,
      center: true,
      width: "110px",
    },
    {
      name: "Post Title",
      selector: (row) => row.post_title,
      center: true,
      width: "150px",
    },
    {
      name: "Source",
      selector: (row) => row.source,
      center: true,
      width: "150px",
    },
    {
      name: "Reason",
      selector: (row) => row.reason,
      center: true,
      width: "110px",
    },
    {
      name: "Action",
      selector: (row) => row.action,
      center: true,
      width: "110px",
    },
    {
      name: "Actioned By",
      selector: (row) => row.actioned_by,
      center: true,
      width: "110px",
    },
    {
      name: "Resolution Time",
      selector: (row) => row.resolution_time,
      center: true,
      width: "150px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      center: true,
      width: "110px",
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
            data={activitiData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total}
          />
        </div>
      </div>
    </>
  );
};

export default IsLoadingHOC(ModerationQueue);
