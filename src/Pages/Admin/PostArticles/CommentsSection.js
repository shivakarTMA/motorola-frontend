import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import {
  FiHeart,
  FiMessageSquare,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { authAxios } from "../../../Config/config";

const PAGE_LIMIT = 20;

// After this depth we stop indenting further so deep threads don't get squeezed
// out of the narrow right-hand column. Lines/borders still show the nesting.
const MAX_INDENT_DEPTH = 3;

const statusColors = {
  PUBLISHED: "bg-green-100 text-green-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  HIDDEN: "bg-gray-200 text-gray-700",
  DELETED: "bg-red-100 text-red-700",
  BANNED: "bg-yellow-100 text-yellow-700",
};

/* ----------------------------- helpers ----------------------------- */

// API sends "2026-11-01 10:15:00" (no "T"), which Safari can't parse natively.
const parseDate = (value) => {
  if (!value) return null;
  const d = parseISO(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
};

const timeAgo = (value) => {
  const d = parseDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : "--";
};

const fullDate = (value) => {
  const d = parseDate(value);
  return d ? format(d, "dd MMM yyyy, hh:mm a") : "";
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

// Total nodes in a comment subtree (the comment + every nested reply).
const countNodes = (comment) =>
  1 + (comment.replies || []).reduce((sum, r) => sum + countNodes(r), 0);

// Removes a comment (and its subtree) from the tree, returns the new tree and
// how many comments disappeared in total.
const removeFromTree = (list, id) => {
  let removed = 0;

  const walk = (items) =>
    items
      .filter((item) => {
        if (item.id === id) {
          removed += countNodes(item);
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        replies: item.replies ? walk(item.replies) : [],
      }));

  return { tree: walk(list), removed };
};


/* ------------------- Quill delta content (comments) ------------------- */

const safeJson = (value) => {
  if (typeof value !== "string") return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Comment content arrives as a stringified Quill delta, e.g.
// '[{"insert":"Nice!\n"}]'. Returns the ops array, or null for plain text.
const parseOps = (content) => {
  if (typeof content !== "string") return null;
  const ops = safeJson(content);
  return Array.isArray(ops) ? ops : null;
};

// Turns custom embeds into plain styled text the converter understands.
const normalizeOps = (ops) =>
  ops.flatMap((op) => {
    const ins = op?.insert;

    if (ins && typeof ins === "object") {
      if (ins.mention !== undefined) {
        const mention = safeJson(ins.mention);
        return [
          {
            insert: `@${mention?.name || "user"}`,
            attributes: { bold: true, color: "#2563eb" },
          },
        ];
      }

      if (ins.atomicLink !== undefined) {
        const link = safeJson(ins.atomicLink);
        return link?.text
          ? [{ insert: link.text, attributes: { link: link.url } }]
          : [];
      }
    }

    return [op];
  });

const commentToHtml = (content) => {
  const ops = parseOps(content);
  if (!ops) return null;

  try {
    const html = new QuillDeltaToHtmlConverter(normalizeOps(ops), {}).convert();
    return html.replace(/<[^>]*>/g, "").trim() ? html : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Plain-text version, used where HTML isn't wanted (e.g. delete preview).
const commentToPlainText = (content) => {
  const ops = parseOps(content);
  if (!ops) return (content || "").trim();

  return ops
    .map((op) => {
      const ins = op?.insert;
      if (typeof ins === "string") return ins;
      if (ins?.mention !== undefined)
        return `@${safeJson(ins.mention)?.name || "user"}`;
      if (ins?.atomicLink !== undefined)
        return safeJson(ins.atomicLink)?.text || "";
      return "";
    })
    .join("")
    .trim();
};

const CommentBody = ({ content, isDeleted }) => {
  const html = useMemo(() => commentToHtml(content), [content]);

  const base = `mt-1 break-words ${
    isDeleted ? "text-gray-400 italic" : "text-gray-800"
  }`;

  if (html) {
    return (
      <div
        className={`${base} [&_p]:m-0 [&_a]:text-blue-600 [&_a]:underline`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p className={`${base} whitespace-pre-wrap`}>
      {commentToPlainText(content) || "--"}
    </p>
  );
};

/* ------------------------------ avatar ----------------------------- */

const Avatar = ({ user, size = 36 }) => {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (user?.profile_picture && !failed) {
    return (
      <img
        src={user.profile_picture}
        alt={user?.name || "User"}
        style={style}
        className="rounded-full object-cover shrink-0 bg-gray-100"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      style={style}
      className="rounded-full shrink-0 bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center"
    >
      {getInitials(user?.name)}
    </div>
  );
};

/* --------------------------- comment item -------------------------- */

const CommentItem = ({ comment, depth = 0, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const isDeleted = comment.status === "DELETED";
  const showStatusBadge = comment.status && comment.status !== "PUBLISHED";

  return (
    <div className="text-sm">
      <div className="flex gap-3">
        <Avatar user={comment.user} size={depth === 0 ? 36 : 28} />

        <div className="min-w-0 flex-1">
          {/* header: name, username, time, badges */}
            <div className="flex gap-2 justify-content-between">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-black">
                    {comment.user?.name || "--"}
                    </span>
                    {comment.user?.username && (
                    <span className="text-xs text-gray-500">
                        @{comment.user.username}
                    </span>
                    )}
                    <span
                    className="text-xs text-gray-400"
                    title={fullDate(comment.created_at)}
                    >
                    {timeAgo(comment.created_at)}
                    </span>
                    {comment.is_edited && (
                    <span
                        className="text-xs text-gray-400 italic"
                        title={`Edited ${fullDate(comment.updated_at)}`}
                    >
                        edited
                    </span>
                    )}
                    {showStatusBadge && (
                    <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusColors[comment.status] || "bg-gray-100 text-black"
                        }`}
                    >
                        {comment.status.replaceAll("_", " ")}
                    </span>
                    )}
                </div>

                {!isDeleted && (
                <button
                    type="button"
                    onClick={() => onDelete(comment)}
                    aria-label="Delete comment"
                    className="ml-auto flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                    <FiTrash2 size={14} />
                </button>
                )}
            </div>

          {/* content */}
          <CommentBody content={comment.content} isDeleted={isDeleted} />

          {/* footer: counts + actions */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <FiHeart size={14} />
              {comment.likes_count ?? 0}
            </span>

            <span className="flex items-center gap-1.5">
              <FiMessageSquare size={14} />
              {comment.comments_count ?? replies.length}
            </span>

            {hasReplies && (
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                aria-expanded={showReplies}
              >
                {showReplies ? (
                  <FiChevronUp size={14} />
                ) : (
                  <FiChevronDown size={14} />
                )}
                {showReplies
                  ? "Hide replies"
                  : `View ${replies.length} ${
                      replies.length === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}

            
          </div>
        </div>
      </div>

      {/* nested replies (recursive) */}
      {hasReplies && showReplies && (
        <div
          className={`mt-3 space-y-4 border-l border-gray-200 ${
            depth < MAX_INDENT_DEPTH ? "ml-4 pl-4" : "ml-0 pl-3"
          }`}
        >
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* --------------------------- main section -------------------------- */

const CommentsSection = ({
  postId,
  open = true,
  onDeleted,
  showHeader = true,
  listClassName = "max-h-[40vh]",
  postType,
}) => {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = useCallback(
    async (page = 1) => {
      if (!postId) return;

      const isFirstPage = page === 1;

      const isPoll = String(postType || "").toLowerCase() === "poll";

      try {
        isFirstPage ? setLoading(true) : setLoadingMore(true);
        setError("");

        const res = await authAxios().get("/comment", {
          params: { 
            page, limit: PAGE_LIMIT,
            // poll comments use poll_id, everything else uses post_id
            ...(isPoll ? { poll_id: postId } : { post_id: postId }),
         },
        });

        if (res.data.success) {
          const { items = [], pagination: pg } = res.data.data || {};

          setComments((prev) => (isFirstPage ? items : [...prev, ...items]));
          setPagination({
            total: pg?.total ?? items.length,
            page: pg?.page ?? page,
            totalPages: pg?.totalPages ?? 1,
          });
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch comments";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [postId, postType],
  );

  // (Re)load whenever the modal opens or the post changes.
  useEffect(() => {
    if (!open || !postId) return;
    setComments([]);
    setPagination({ total: 0, page: 1, totalPages: 1 });
    fetchComments(1);
  }, [open, postId, postType, fetchComments]);

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      setDeleting(true);

      const res = await authAxios().delete(`/comment/${commentToDelete.id}`);

      if (res.data.success) {
        const { tree, removed } = removeFromTree(comments, commentToDelete.id);

        setComments(tree);
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - (removed > 0 ? 1 : 0)),
        }));

        toast.success(res.data.message || "Comment deleted successfully");
        onDeleted?.(removed);
        setCommentToDelete(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setCommentToDelete(null);
  };

  const hasReplies = commentToDelete?.replies?.length > 0;
  const hasMore = pagination.page < pagination.totalPages;

  return (
    <div className="flex flex-col min-h-0">
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            Comments
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.total})
              </span>
            )}
          </h3>
        </div>
      )}

      <div className={`${listClassName} overflow-y-auto pr-1`}>
        {loading ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error && comments.length === 0 ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchComments(1)}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="h-24 rounded-lg border flex items-center justify-center text-sm text-gray-400">
            No comments yet
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={setCommentToDelete}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => fetchComments(pagination.page + 1)}
                  disabled={loadingMore}
                  className="custom--btn !bg-white !text-black border !border-black disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load more comments"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation: delete comment */}
      <Transition appear show={!!commentToDelete} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          onClose={handleCancelDelete}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2">
                    Delete comment?
                  </Dialog.Title>

                  <p className="text-xs text-gray-500 mb-3">
                    Are you sure you want to delete this comment?
                    {hasReplies &&
                      ` Its ${commentToDelete.replies.length} ${
                        commentToDelete.replies.length === 1
                          ? "reply"
                          : "replies"
                      } will be removed from the thread too.`}
                  </p>

                  {commentToDelete?.content && (
                    <p className="mb-5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-700 line-clamp-3 break-words">
                      {commentToPlainText(commentToDelete.content) || "--"}
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      disabled={deleting}
                      className="custom--btn !bg-white !text-black border !border-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={deleting}
                      className="custom--btn disabled:opacity-60"
                    >
                      {deleting ? "Please wait..." : "Delete"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CommentsSection;