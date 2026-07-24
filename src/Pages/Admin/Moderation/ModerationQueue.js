import React, { useEffect, useState } from "react";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import {
  customStyles,
  formatText,
  formatViewDate,
  formatViewTime,
  formatWithTimeDate,
} from "../../../Helper/helper";
import Tooltip from "../../../Components/Common/Tooltip";
import { FiEye } from "react-icons/fi";
import ModerationDetailModal from "./ModerationDetailModal";
import PostModerationDetailModal from "./PostModerationDetailModal";
import ArticleModerationDetailModal from "./ArticleModerationDetailModal";
import PollModerationDetailModal from "./PollModerationDetailModal";
import Select from "react-select";
import { useSearchParams } from "react-router-dom";
import { FaCircle } from "react-icons/fa6";

const statusType = [
  { label: "Resolved", value: "ACTIONED" },
  { label: "Pending", value: "PENDING" },
];

const itemType = [
  { label: "Hot Take", value: "POST" },
  { label: "Deep Dive", value: "ARTICLE" },
  { label: "Vibe Check", value: "POLL" },
];

const ModerationQueue = (props) => {
  const { setLoading } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const [moderationList, setModerationList] = useState([]);
  const [moderationStats, setModerationStats] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editPostId, setEditPostId] = useState(null);

  // const [statusFilter, setStatusFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || null,
  );
  const [itemTypeFilter, setItemTypeFilter] = useState(null);
  const [filterTribe, setFilterTribe] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [tribeOptions, setTribeOptions] = useState([]);

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

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (itemTypeFilter) {
        params.item_type = itemTypeFilter;
      }

      if (filterTribe?.value) {
        params.circle_id = filterTribe.value;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      const response = await authAxios().get("/moderation", { params });
      const resData = response.data;

      if (resData.success) {
        const items = resData.data.items;
        const stats = resData.data.stats;
        setModerationList(items);
        setModerationStats(stats);
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
  }, [startDate, endDate, filterTribe, itemTypeFilter, statusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (statusFilter) {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchTribeList = async () => {
    try {
      const response = await authAxios().get("/tribe");

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

  useEffect(() => {
    fetchTribeList();
  }, []);

  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  const openReport = (row) => {
    setSelectedReport(row);
    setModalType(row?.post?.type ? row?.post?.type : row?.content_type);
    setEditPostId(row.id);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setModalType(null);
    setEditPostId(null);
  };

  // Called after the confirmation modal is confirmed
  const handleModerationUpdate = async (payload) => {
    try {
      await authAxios().post(`/moderation/action`, payload);

      toast.success("Moderation updated successfully.");

      setIsModalOpen(false);
      setSelectedReport(null);
      setModalType(null);

      fetchModerationList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleTribeChange = (option) => {
    setFilterTribe(option);
    setPage(1);
  };

  const handleStatusChange = (option) => {
    setPage(1);
    setStatusFilter(option?.value || null);
  };

  const handleItemTypeChange = (option) => {
    setPage(1);
    setItemTypeFilter(option?.value || null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 relative">
          <div className="lg:flex lg:flex-row grid grid-cols-2 gap-2 flex-1">
            <div className="lg:min-w-[200px] lg:w-fit w-full col-span-2">
              <div className="custom--date">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  defaultPreset="Today"
                  panelOffsetTop={100}
                  panelOffsetLeft={0}
                />
              </div>
            </div>
            <div className="lg:min-w-[250px] lg:w-fit w-full">
              <Select
                value={filterTribe}
                options={tribeOptions}
                onChange={handleTribeChange}
                styles={customStyles}
                placeholder="Filter by Tribe"
                isClearable
              />
            </div>
            <div className="lg:min-w-[180px] lg:w-fit w-full">
              <Select
                placeholder="Filter by Item Type"
                value={itemType.find((o) => o.value === itemTypeFilter) || null}
                options={itemType}
                onChange={handleItemTypeChange}
                isClearable
                styles={customStyles}
              />
            </div>
            <div className="lg:min-w-[180px] lg:w-fit w-full">
              <Select
                placeholder="Filter by status"
                value={statusType.find((o) => o.value === statusFilter) || null}
                options={statusType}
                onChange={handleStatusChange}
                isClearable
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        <div className="flex lg:flex-row flex-col lg:items-center py-3">
          <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#F59E0B]" />
              <span>Total Flagged Posts</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_flaggged_posts}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#1F9254]" />
              <span>Total Approved Posts</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_approved_posts}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#ff9900]" />
              <span>Total Rejected Posts</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_rejected_posts}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#ff9900]" />
              <span>Total Warnings</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_warnings}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#EF4444]" />
              <span>Total Suspended users</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_suspended_users}
              </span>
            </div>
          </div>
          <div className="w-fit flex items-center gap-2 lg:pl-2">
            <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#B91C1C]" />
              <span>Total Banned Users</span>
            </div>
            <div className="pr-2 flex">
              <span className="text-[13px] font-semibold">
                {moderationStats?.total_banned_users}
              </span>
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
                    <th className="px-2 py-4 min-w-[100px] ">Item Type</th>
                    <th className="px-2 py-4 min-w-[150px] ">
                      Flagged Keyword
                    </th>
                    <th className="px-2 py-4 min-w-[150px] ">
                      Reported (User)
                    </th>
                    <th className="px-2 py-4 min-w-[150px]">Tribe</th>
                    <th className="px-2 py-4 min-w-[150px]">Moderator Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Updated Time</th>
                    <th className="px-2 py-4 min-w-[120px]">Action Taken</th>
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
                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          {formatViewTime(row.reported_time) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          {row?.post?.type === "POST"
                            ? "Hot Take"
                            : row?.post?.type === "ARTICLE"
                              ? "Deep Dive"
                              : row?.content_type === "POLL"
                                ? "Vibe Check"
                                : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.matchedKeyword?.keyword
                            ? row.matchedKeyword?.keyword
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.user.name ? row.user.name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.tribe ? row.tribe : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.moderator_name ? row.moderator_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.updated_time ? row.updated_time : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.action_taken ? row.action_taken : "--"}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              {
                                ACTIONED: "bg-green-100 text-green-700",
                                PENDING: "bg-yellow-100 text-yellow-700",
                              }[row.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatText(
                              row?.status === "ACTIONED"
                                ? "Resolved"
                                : row?.status,
                            )}
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

      {modalType === "POST" && (
        <PostModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {modalType === "ARTICLE" && (
        <ArticleModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {modalType === "POLL" && (
        <PollModerationDetailModal
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
        />
      )}
    </>
  );
};

export default IsLoadingHOC(ModerationQueue);
