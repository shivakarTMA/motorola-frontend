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
import { GrTransaction } from "react-icons/gr";
import { VscSymbolKeyword } from "react-icons/vsc";
import CommentArticleDetails from "../../Pages/Admin/Moderation/CommentModeration/CommentArticleDetails";
import CommentPostDetails from "../../Pages/Admin/Moderation/CommentModeration/CommentPostDetails";
import CommentPollDetails from "../../Pages/Admin/Moderation/CommentModeration/CommentPollDetails";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  resolved: "bg-green-100 text-green-700 boder border-green-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  actioned: "bg-green-100 text-green-700 boder border-green-200",
};

const getStatusStyle = (status) =>
  statusStyles[status?.toLowerCase()] ||
  "bg-gray-100 text-gray-600 border border-gray-200";

const ModerationHistory = (props) => {
  const { setLoading } = props;
  const { id } = useParams();
  const [moderationList, setModerationList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moderationStats, setModerationStats] = useState({})

  const [editPostId, setEditPostId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalCommentType, setModalCommentType] = useState(null);
  const [modalCommentParentType, setModalCommentParentType] = useState(null);

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

  console.log(moderationStats,'moderationStats')

  useEffect(() => {
    if (!id) return;

    setPage(1);
    fetchModerationList(1);
  }, [id]);

  const openReport = (row) => {
    setSelectedReport(row);
    setModalType(row?.post?.type ? row?.post?.type : row?.content_type);
    setModalCommentType(row?.content_type);
    setModalCommentParentType(row?.content_parent_type);
    setEditPostId(row.id);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setModalType(null);
    setEditPostId(null);
    setModalCommentType(null);
    setModalCommentParentType(null);
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
            <span className="text-[13px] font-semibold">{moderationStats?.total_approved_posts}</span>
          </div>
        </div>
        <div className="w-fit flex items-center gap-2 lg:pl-2">
          <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
            <FaCircle className="text-[10px] text-[#ff9900]" />
            <span>Total Rejected Posts</span>
          </div>
          <div className="pr-2 flex">
            <span className="text-[13px] font-semibold">{moderationStats?.total_rejected_posts}</span>
          </div>
        </div>
        <div className="w-fit flex items-center gap-2 lg:pl-2">
          <div className="text-[13px] font-medium text-gray-600 flex gap-2 items-center">
            <FaCircle className="text-[10px] text-[#ff9900]" />
            <span>Total Warnings</span>
          </div>
          <div className="pr-2 flex">
            <span className="text-[13px] font-semibold">{moderationStats?.total_warnings}</span>
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
              <div className="text-sm font-semibold">Reported Date & Time</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>{formatViewDate(row.reported_at) || "--"}</span>
                </div>
                <div>
                /
                </div>
                <div className="flex items-center gap-1.5">
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
                          : row?.content_type === "COMMENT"
                          ? "Comment"
                          : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <PiSignpost className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Tribe Group:</span>
                  </span>
                  <span className="font-medium">
                    {row.post?.circle?.circleGroup?.name ||
                          row.poll?.circle?.circleGroup?.name ||
                          row.comment?.poll?.circle?.circleGroup?.name ||
                          row.comment?.post?.circle?.circleGroup?.name ||
                          "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <PiSignpost className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Tribe Name:</span>
                  </span>
                  <span className="font-medium">
                    {row.post?.circle?.name ||
                          row.poll?.circle?.name ||
                          row.comment?.poll?.circle?.name ||
                          row.comment?.post?.circle?.name ||
                          "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Moderator Name:</span>
                  </span>
                  <span className="font-medium">
                    {row.reviewer?.name ? row.reviewer?.name : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Updated Time:</span>
                  </span>
                  <span className="font-medium">
                    {row.reviewed_time ? formatViewTime(row.reviewed_time) : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <VscSymbolKeyword className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Flagged Keywords:</span>
                  </span>
                  <span className="font-medium">
                    {row.matchedKeyword?.keyword ? row.matchedKeyword?.keyword : "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <GrTransaction className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Action Taken:</span>
                  </span>
                  <span className="font-medium">
                    {row.action ? row.action : "--"}
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
          onSubmit={handleModerationUpdate}
        />
      )}

      {(modalCommentParentType === "ARTICLE" && modalCommentType === "COMMENT") && (
        <CommentArticleDetails
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {(modalCommentParentType === "POST" && modalCommentType === "COMMENT") && (
        <CommentPostDetails
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}

      {(modalCommentParentType === "POLL" && modalCommentType === "COMMENT") && (
        <CommentPollDetails
          isOpen={true}
          onClose={closeModal}
          report={selectedReport}
          editId={editPostId}
          onSubmit={handleModerationUpdate}
        />
      )}
    </div>
  );
};

export default IsLoadingHOC(ModerationHistory);
