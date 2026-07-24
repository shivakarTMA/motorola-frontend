import React, { useEffect, useState } from "react";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import { formatText, formatViewDate, formatViewTime, formatWithTimeDate } from "../../../Helper/helper";
import Tooltip from "../../../Components/Common/Tooltip";
import { FiEye } from "react-icons/fi";
import ModerationDetailModal from "./ModerationDetailModal";

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

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchModerationList = async (currentPage = page) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
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
        const items = resData.data.items;
        setModerationList(items);
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

    fetchModerationList();
  }, [startDate, endDate]);

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  const openReport = (row) => {
    setSelectedReport(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  // Called after the confirmation modal is confirmed
  const handleStatusUpdate = (payload) => {
    setModerationList((prev) =>
      prev.map((row) =>
        row.report_id === payload.report_id
          ? {
              ...row,
              status: payload.action === "APPROVE" ? "DISMISSED" : "ACTIONED",
              moderator_name: "You", // replace with the logged-in admin's name
              updated_time: new Date().toISOString(),
            }
          : row,
      ),
    );
    toast.success("Report status updated");
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
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    {/* <th className="px-2 py-4 min-w-[80px]">Report ID</th> */}
                    <th className="px-2 py-4 min-w-[120px]">Reported Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Reported Time</th>
                    <th className="px-2 py-4 min-w-[100px] ">
                      Item Type
                    </th>
                    <th className="px-2 py-4 min-w-[150px] ">
                      Reported (User)
                    </th>
                    <th className="px-2 py-4 min-w-[100px]">
                      Tribe
                    </th>
                    <th className="px-2 py-4 min-w-[100px]">
                      Moderator Name
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {moderationList?.length > 0 ? (
                    moderationList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        {/* <td className="px-2 py-4">
                          {row.report_id ? row.report_id : "--"}
                        </td> */}

                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          {formatViewTime(row.reported_time) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          {row.content_type ? row.content_type : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.user.name ? row.user.name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.tribe ? row.tribe : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.tribe ? row.tribe : "--"}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              {
                                WARNING: "bg-green-100 text-green-700",
                                HIDE_CONTENT: "bg-blue-100 text-blue-700",
                                SUSPEND_USER: "bg-blue-100 text-blue-700",
                                BAN_USER: "bg-red-100 text-red-700",
                                DEACTIVATE_USER: "bg-gray-200 text-gray-700",
                                PENDING: "bg-yellow-100 text-yellow-700",
                              }[row.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatText(row.status)}
                          </span>
                        </td>

                        <td className="px-2 py-4 ">
                          <Tooltip
                            id={`tooltip-view-${row.id}`}
                            content="View"
                            place="top"
                          >
                            <button
                              onClick={() => openReport(row)}
                              className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-md mx-auto"
                            >
                              <FiEye size={18} />
                            </button>
                          </Tooltip>
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
              currentDataLength={moderationList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchModerationList(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <ModerationDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        report={selectedReport}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default IsLoadingHOC(ModerationQueue);
