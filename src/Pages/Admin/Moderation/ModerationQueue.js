import React, { useEffect, useState } from "react";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const ACTION_LABELS = {
  WARNING: "Warned",
  HIDE_CONTENT: "Removed",
  SUSPEND_USER: "Suspended",
  BAN_USER: "Banned",
  DEACTIVATE_USER: "Deactivated",
};

const SOURCE_LABELS = {
  KEYWORD: "Keyword auto-flag",
  USER_REPORT: "User report",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  ACTIONED: "Resolved",
  DISMISSED: "Dismissed",
};

const CONTENT_TYPE_LABELS = {
  POST: "Post",
  POLL: "Poll",
  COMMENT: "Comment",
};

const ModerationQueue = (props) => {
  const { setLoading } = props;

  const [moderationList, setModerationList] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Report ID",
      selector: (row) => row.report_id,
    },
    {
      name: "Reported Date",
      selector: (row) => row.reported_date,
      center: true,
    },
    {
      name: "Reported Time",
      selector: (row) => row.reported_time,
      center: true,
    },
    {
      name: "Item Type",
      selector: (row) => row.item_type,
      center: true,
    },
    {
      name: "Reported",
      selector: (row) => row.reported_user,
      center: true,
    },
    {
      name: "Tribe",
      selector: (row) => row.tribe,
      center: true,
    },
    {
      name: "Post Title",
      selector: (row) => row.post_title,
      center: true,
    },
    {
      name: "Source",
      selector: (row) => row.source,
      center: true,
    },
    {
      name: "Reason",
      selector: (row) => row.reason,
      center: true,
    },
    {
      name: "Action",
      selector: (row) => row.action,
      center: true,
    },
    {
      name: "Actioned By",
      selector: (row) => row.actioned_by,
      center: true,
    },
    {
      name: "Resolution Time",
      selector: (row) => row.resolution_time,
      center: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      center: true,
    },
  ];

  const fetchModerationList = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: rowsPerPage,
      };

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      const response = await authAxios().get("/moderation", { params });
      const resData = response.data;

      if (resData.success) {
        const items = (resData.data.items || []).map((item) => {
          // Latest non-revoked action from the moderationActions array
          const activeAction =
            (item.moderationActions || [])
              .filter((ma) => !ma.is_revoked)
              .sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
              )[0] || null;

          const [datePart, timePart] = (item.created_at || "").split(" ");

          return {
            report_id: item.report_id || "-",
            reported_date: datePart
              ? datePart.split("-").reverse().join("/")
              : "-",
            reported_time: timePart?.slice(0, 5) || "-",
            item_type:
              CONTENT_TYPE_LABELS[item.content_type] ||
              item.content_type ||
              "-",
            reported_user: item.user?.name || "-",
            tribe: item.tribe || "-",
            post_title:
              item.post?.title ||
              item.poll?.question ||
              item.comment?.content?.slice(0, 40) ||
              "-",
            source:
              SOURCE_LABELS[item.flag_source] || item.flag_source || "-",
            reason: activeAction?.reason || item.reason || "-",
            action: activeAction
              ? ACTION_LABELS[activeAction.action] || activeAction.action
              : "-",
            actioned_by: activeAction?.moderator?.name || "-",
            resolution_time:
              item.reviewed_at?.split(" ")[1]?.slice(0, 5) || "-",
            status: STATUS_LABELS[item.status] || item.status || "-",
          };
        });

        setModerationList(items);
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

    fetchModerationList(currentPage);
  }, [currentPage, startDate, endDate]);

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setCurrentPage(1); // reset to first page when the date range changes
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
            data={moderationList}
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