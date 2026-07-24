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
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
  FiUsers,
  FiEye,
  FiInbox,
} from "react-icons/fi";
import { PiSignpost } from "react-icons/pi";
import { FaCircle } from "react-icons/fa6";
import ModerationDetailModal from "../../Pages/Admin/Moderation/ModerationDetailModal";
import { useParams } from "react-router-dom";
import PollModerationDetailModal from "../../Pages/Admin/Moderation/PollModerationDetailModal";
import ArticleModerationDetailModal from "../../Pages/Admin/Moderation/ArticleModerationDetailModal";
import PostModerationDetailModal from "../../Pages/Admin/Moderation/PostModerationDetailModal";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  resolved: "bg-green-100 text-green-700 boder border-green-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  actioned: "bg-green-100 text-green-700 boder border-green-200",
};

const getStatusStyle = (status) =>
  statusStyles[status?.toLowerCase()] ||
  "bg-gray-100 text-gray-600 border border-gray-200";

// const dummyModerationList = [
//   {
//     id: 1,
//     post_title: "ABC tiuo mljnkjsce",
//     post_description: "I got a new app",
//     report_id: "RPT-1001",
//     reported_date: "2026-07-15",
//     reported_time: "2026-07-15T09:24:00",
//     item_type: "Post",
//     reported_user: "john.doe",
//     tribe: "Tech Talk",
//     status: "PENDING",
//     moderator_name: "Ankit Gupta",
//   },
//   {
//     id: 2,
//     report_id: "RPT-1002",
//     reported_date: "2026-07-14",
//     reported_time: "2026-07-14T14:10:00",
//     item_type: "Comment",
//     reported_user: "sarah_k",
//     tribe: "Foodies",
//     status: "resolved",
//   },
//   {
//     id: 3,
//     report_id: "RPT-1003",
//     reported_date: "2026-07-13",
//     reported_time: "2026-07-13T18:45:00",
//     item_type: "Profile",
//     reported_user: "mike_lee",
//     tribe: "Travel Buddies",
//     status: "reviewing",
//   },
//   {
//     id: 4,
//     report_id: "RPT-1004",
//     reported_date: "2026-07-12",
//     reported_time: "2026-07-12T11:05:00",
//     item_type: "Post",
//     reported_user: "anna_r",
//     tribe: "Fitness Freaks",
//     status: "rejected",
//   },
//   {
//     id: 5,
//     report_id: "RPT-1005",
//     reported_date: "2026-07-11",
//     reported_time: "2026-07-11T20:30:00",
//     item_type: "Message",
//     reported_user: "chris99",
//     tribe: "Book Club",
//     status: "PENDING",
//   },
//   {
//     id: 6,
//     report_id: "RPT-1006",
//     reported_date: "2026-07-10",
//     reported_time: "2026-07-10T08:15:00",
//     item_type: "Comment",
//     reported_user: "priya_s",
//     tribe: "Gamers United",
//     status: "resolved",
//   },
// ];

const ModerationHistory = (props) => {
  const { setLoading } = props;
  const { id } = useParams();
  const [moderationList, setModerationList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editPostId, setEditPostId] = useState(null);
  const [modalType, setModalType] = useState(null);

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

      const response = await authAxios().get(`/moderation?user_id=${id}`, {
        params,
      });
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
    fetchModerationList();
  }, []);

  const openReport = (row) => {
    setSelectedReport(row);
        setModalType(
      row?.post?.type ? row?.post?.type : row?.content_type
    );
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

  return (
    <div className="mt-3">
      <div className="flex lg:flex-row flex-col lg:items-center py-3">
        <div className="w-fit flex items-center gap-2 lg:border-r lg:pl-2">
          <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
            <FaCircle className="text-[10px] text-[#1F9254]" />
            <span>Total Approved Posts</span>
          </div>
          <div className="pr-2 flex">
            <span className="text-[13px] font-semibold">0</span>
          </div>
        </div>
        <div className="w-fit flex items-center gap-2 lg:pl-2">
          <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
            <FaCircle className="text-[10px] text-[#ff9900]" />
            <span>Total Rejected Posts</span>
          </div>
          <div className="pr-2 flex">
            <span className="text-[13px] font-semibold">0</span>
          </div>
        </div>
        <div className="w-fit flex items-center gap-2 lg:pl-2">
          <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
            <FaCircle className="text-[10px] text-[#ff9900]" />
            <span>Total Warnings</span>
          </div>
          <div className="pr-2 flex">
            <span className="text-[13px] font-semibold">0</span>
          </div>
        </div>
      </div>
      {moderationList?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {moderationList.map((row, index) => (
            <div
              key={row.id || index}
              className="box--shadow bg-white rounded-[15px] p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Header: report id + status */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${getStatusStyle(
                    row.status,
                  )}`}
                >
                  {row.status === "ACTIONED" ? "Resolved" : row.status}
                </span>
              </div>

              {/* Date / Time */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Reported Date:</span>
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>{formatViewDate(row.reported_at) || "--"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Reported Time:</span>
                  <FiClock className="w-3.5 h-3.5" />
                  <span>{formatViewTime(row.reported_time) || "--"}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Details */}
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Item Type:</span>
                  </span>
                  <span className="font-medium">
                    {row?.post?.type === "POST"
                      ? "Hot Take"
                      : row?.post?.type === "ARTICLE"
                        ? "Deep Dive"
                        : row?.content_type === "POLL"
                          ? "Vibe Check"
                          : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <PiSignpost className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Tribe:</span>
                  </span>
                  <span className="font-medium">
                    {row.post?.circle?.name ? row.post?.circle?.name : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Moderator Name:</span>
                  </span>
                  <span className="font-medium">
                    {row.moderator_name ? row.moderator_name : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Updated Time:</span>
                  </span>
                  <span className="font-medium">
                    {row.updated_time ? row.updated_time : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Flagged Keywords:</span>
                  </span>
                  <span className="font-medium">
                    {row.matchedKeyword?.keyword ? row.matchedKeyword?.keyword : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Action Taken:</span>
                  </span>
                  <span className="font-medium">
                    {row.action_taken ? row.action_taken : "--"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={() => openReport(row)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
              >
                <FiEye className="w-3.5 h-3.5" />
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="box--shadow bg-white rounded-[15px] p-10 flex flex-col items-center justify-center text-gray-400">
          <FiInbox className="w-8 h-8 mb-2" />
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
          currentDataLength={moderationList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchModerationList(newPage);
          }}
        />
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
    </div>
  );
};

export default IsLoadingHOC(ModerationHistory);
