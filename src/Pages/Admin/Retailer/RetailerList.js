import React, { useEffect, useState, useRef } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import {
  customStyles,
  formatText,
  formatViewDate,
} from "../../../Helper/helper";
import CreateNewStaff from "./CreateNewStaff";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";
import { QRCodeSVG } from "qrcode.react";
import { FiDownload, FiX, FiSearch } from "react-icons/fi";
const StaffList = (props) => {
  const { setLoading } = props;
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [role, setRole] = useState(null);
  const [editStaffId, setEditStaffId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [createStaff, setCreateStaff] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedQR, setSelectedQR] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const latestRequest = useRef(0);

  const [sortDir, setSortDir] = useState("");
  const [sortBy, setSortBy] = useState("total_referred_count");

  const handleFetchStaff = async (
    currentPage = page,
    searchValue = debouncedSearch,
    currentSortBy = sortBy,
    currentSortDir = sortDir
  ) => {
    const requestId = ++latestRequest.current;

    try {
      setLoading(true);

      const response = await authAxios().get("/retailer", {
        params: {
            page: currentPage,
            limit: rowsPerPage,
            ...(searchValue.trim()
              ? { search: searchValue.trim() }
              : {}),
            ...(currentSortBy
              ? {
                  sort_by: currentSortBy,
                  sort_dir: currentSortDir,
                }
              : {}),
          },
        });

      if (requestId !== latestRequest.current) return;

      const resData = response?.data;

      if (resData?.success) {
        setUsers(resData?.data?.items || []);

        const paginationData = resData?.data?.pagination;

        setPage(paginationData?.page ?? currentPage);
        setTotalPages(paginationData?.totalPages ?? 1);
        setTotalCount(paginationData?.total ?? 0);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalCount(0);
        console.error(resData?.message);
      }
    } catch (error) {
      if (requestId !== latestRequest.current) return;

      console.error("Error fetching retailers:", error);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  };
  const handleFetchRoles = async () => {
    try {
      const response = await authAxios().get("/role", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        const options = resData.data.items.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setRoleOptions(options);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    handleFetchRoles();
  }, []);

  useEffect(() => {
    handleFetchStaff();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/retailer/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchStaff();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralUrl = (referralCode) => {
    if (!referralCode) return "";

    const referrer = new URLSearchParams({
      refer_code: referralCode,
      refer_type: "RETAIL",
    });

    const playStoreUrl = new URL("https://play.google.com/store/apps/details");

    playStoreUrl.searchParams.set("id", "com.motorollers.app");
    playStoreUrl.searchParams.set("referrer", referrer.toString());

    return playStoreUrl.toString();
  };

  const handleDownloadQR = () => {
    if (!selectedQR?.referral_code) return;

    const svg = document.getElementById("retailer-download-qr");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = 600;
    const canvasHeight = 720;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // QR code
      const qrSize = 480;

      ctx.drawImage(img, (canvasWidth - qrSize) / 2, 45, qrSize, qrSize);

      // Retailer name
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const name = String(selectedQR.name || "Retailer").trim();

      const maxTextWidth = canvasWidth - 80;
      const maxLines = 4;
      const textAreaTop = 555;
      const textAreaHeight = 140;

      // Break long names into multiple lines
      const wrapText = (text, maxWidth) => {
        const lines = [];
        const words = text.split(/\s+/).filter(Boolean);
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;

          if (ctx.measureText(testLine).width <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = "";
            }

            // Handle very long words without spaces
            let chunk = "";

            for (const char of word) {
              if (chunk && ctx.measureText(chunk + char).width > maxWidth) {
                lines.push(chunk);
                chunk = char;
              } else {
                chunk += char;
              }
            }

            currentLine = chunk;
          }
        }

        if (currentLine) {
          lines.push(currentLine);
        }

        return lines;
      };

      let fontSize = 36;
      let lines = [];
      let lineHeight = 0;

      // Adjust font size until text fits
      while (fontSize >= 14) {
        ctx.font = `bold ${fontSize}px Arial`;

        lines = wrapText(name, maxTextWidth);
        lineHeight = fontSize * 1.2;

        if (
          lines.length <= maxLines &&
          lines.length * lineHeight <= textAreaHeight
        ) {
          break;
        }

        fontSize -= 2;
      }

      // Final fallback for extremely long names
      if (
        lines.length > maxLines ||
        lines.length * lineHeight > textAreaHeight
      ) {
        fontSize = 14;
        ctx.font = `bold ${fontSize}px Arial`;
        lines = wrapText(name, maxTextWidth);
        lineHeight = fontSize * 1.2;
      }

      // Center all lines vertically
      const totalTextHeight = lines.length * lineHeight;
      const startY =
        textAreaTop + (textAreaHeight - totalTextHeight) / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          canvasWidth / 2,
          startY + index * lineHeight,
          maxTextWidth,
        );
      });

      // Download image
      canvas.toBlob((blob) => {
        if (!blob) {
          URL.revokeObjectURL(svgUrl);
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = `${name.replace(/[\\/:*?"<>|]/g, "_")}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 1000);

        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      console.error("Failed to generate QR image");
    };

    img.src = svgUrl;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    handleFetchStaff(1, debouncedSearch, sortBy, sortDir);
  }, [debouncedSearch, sortBy, sortDir]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="relative w-full sm:w-[350px]">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search retailers..."
              aria-label="Search retailers"
              className="w-full rounded-lg border border-gray-300
            bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800
            outline-none transition
            focus:border-black focus:ring-1 focus:ring-black"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2
        -translate-y-1/2 text-gray-400
        hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="custom--btn"
            onClick={() => setCreateStaff(true)}
          >
            <FiPlus />
            <span>Add Retailer</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 whitespace-nowrap text-center">
                      Retail ID
                    </th>
                    <th className="px-2 py-4 whitespace-nowrap">name</th>
                    <th className="px-2 py-4 whitespace-nowrap">location</th>
                    <th className="px-2 py-4 whitespace-nowrap">address</th>
                    <th className="px-2 py-4 whitespace-nowrap">status</th>
                    <th className="px-2 py-4 whitespace-nowrap">Created At</th>
                    <th
                      className="px-2 py-4 whitespace-nowrap cursor-pointer select-none"
                      onClick={() => {
                        const nextDir = sortDir === "ASC" ? "DESC" : "ASC";

                        setSortBy("total_referred_count");
                        setSortDir(nextDir);
                        setPage(1);

                        handleFetchStaff(1, debouncedSearch, "total_referred_count", nextDir);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>Total Signups</span>

                        <span className="flex flex-col text-[10px] leading-[10px]">
                          <span className={sortDir === "ASC" ? "text-black" : "text-gray-400"}>
                            ▲
                          </span>
                          <span className={sortDir === "DESC" ? "text-black" : "text-gray-400"}>
                            ▼
                          </span>
                        </span>
                      </div>
                    </th>
                    <th className="px-2 py-4 text-center whitespace-nowrap">
                      QR Code
                    </th>

                    <th className="px-2 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users?.length > 0 ? (
                    users.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4 text-center">
                          {row.id || "-"}
                        </td>
                        <td className="px-2 py-4">{row.name || "-"}</td>
                        <td className="px-2 py-4">{row.location || "--"}</td>
                        <td className="px-2 py-4">{row.address || "--"}</td>
                        <td className="px-2 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {formatText(row.status)}
                          </span>
                        </td>
                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at) || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.total_referred_count || 0}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center">
                            {row.referral_code ? (
                              <button
                                type="button"
                                onClick={() => setSelectedQR(row)}
                                className="cursor-pointer rounded-md border border-gray-200 bg-white p-1.5 transition hover:border-blue-400 hover:shadow-md"
                                title="Click to view QR Code"
                              >
                                <QRCodeSVG
                                  value={generateReferralUrl(row.referral_code)}
                                  size={65}
                                  level="H"
                                  bgColor="#FFFFFF"
                                  fgColor="#000000"
                                  marginSize={1}
                                />
                              </button>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-[1px]">
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Edit"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setEditStaffId(row.id);
                                  setCreateStaff(true);
                                }}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
                              >
                                <MdModeEdit size={18} />
                              </button>
                            </Tooltip>

                            <Tooltip
                              id={`tooltip-delete-${row.id}`}
                              content="Delete"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setDeleteId(row.id);
                                  setDeleteModal(true);
                                }}
                                className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
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
              currentDataLength={users.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchStaff(newPage, debouncedSearch);
              }}
            />
          </div>
        </div>
      </div>
      <CreateNewStaff
        open={createStaff}
        onClose={() => {
          setCreateStaff(false);
          setEditStaffId(null);
        }}
        editId={editStaffId}
        roleOptions={roleOptions}
        onSuccess={() => handleFetchStaff()}
      />
      {/* QR Code Preview Modal */}
      <Dialog
        open={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
          <DialogPanel className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Retailer QR Code
              </DialogTitle>

              <button
                type="button"
                onClick={() => setSelectedQR(null)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {selectedQR?.referral_code && (
              <>
                {/* QR Preview */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="flex w-full flex-col items-center rounded-xl border border-gray-100 bg-white px-4 py-7">
                    <QRCodeSVG
                      id="retailer-download-qr"
                      value={generateReferralUrl(selectedQR.referral_code)}
                      size={260}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      marginSize={2}
                      className="h-auto max-w-full"
                    />

                    {/* Name below QR */}
                    <h2 className="mt-5 max-w-full break-words text-center text-2xl font-bold text-black">
                      {selectedQR.name || "Retailer"}
                    </h2>
                  </div>

                  {/* Referral Code */}
                  <div className="mt-5 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Referral Code
                    </p>

                    <p className="mt-1 text-base font-semibold text-gray-800">
                      {selectedQR.referral_code}
                    </p>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-700"
                >
                  <FiDownload size={18} />
                  Download QR Code
                </button>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete Retailer
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this retailer?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteId(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default IsLoadingHOC(StaffList);
