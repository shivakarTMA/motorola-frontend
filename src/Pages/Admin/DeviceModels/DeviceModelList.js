
import React, { useEffect, useRef, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import {
  filterActiveItems,
  formatViewDate,
} from "../../../Helper/helper";
import Pagination from "../../../Components/Common/Pagination";
import AddDeviceModel from "./AddDeviceModel";

const DeviceModelList = (props) => {
  const { setLoading } = props;

  const [banners, setBanners] = useState([]);
  const [editBannerId, setEditBannerId] = useState(null);
  const [addNewBanner, setAddNewBanner] = useState(false);

  const [brandGroupList, setBrandGroupList] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Track latest API request
  const requestIdRef = useRef(0);

  // Debounce search for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = search.trim();

      if (trimmedSearch !== debouncedSearch) {
        setPage(1);
        setDebouncedSearch(trimmedSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setDebouncedSearch("");
  };

  // Fetch device models
  const fetchBanners = async (
    currentPage = page,
    searchValue = debouncedSearch
  ) => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (searchValue) {
        params.search = searchValue;
      }

      const response = await authAxios().get("/device-model", {
        params,
      });

      // Ignore outdated API responses
      if (requestId !== requestIdRef.current) return;

      const resData = response.data;

      if (resData.success) {
        setBanners(resData?.data?.items || []);

        const paginationData = resData?.data?.pagination;

        setTotalPages(paginationData?.totalPages || 1);
        setTotalCount(paginationData?.total || 0);
      } else {
        toast.error(
          resData.message || "Failed to fetch device models"
        );
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Fetch device brands for Add/Edit modal
  const handleFetchBrandGroup = async () => {
    try {
      const response = await authAxios().get("/device-brand", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        const data = resData?.data?.items || [];
        const activeOnly = filterActiveItems(data);

        setBrandGroupList(activeOnly);
      } else {
        console.error(
          "Failed to fetch brand group data:",
          resData?.message
        );
      }
    } catch (error) {
      console.error("Error fetching brand group data:", error);
    }
  };

  // Fetch brands once
  useEffect(() => {
    handleFetchBrandGroup();
  }, []);

  // Fetch models when page or search changes
  useEffect(() => {
    fetchBanners(page, debouncedSearch);
  }, [page, debouncedSearch]);

  // Refresh after adding or editing
  const handleSuccess = () => {
    fetchBanners(page, debouncedSearch);
  };

  return (
    <>
      <div className="space-y-6">

        {/* Search and Add Model */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Search */}
          <div className="relative w-full sm:max-w-[300px]">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name..."
              aria-label="Search device models"
              className="w-full rounded-lg border border-gray-300
                bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800
                outline-none transition
                focus:border-black focus:ring-1 focus:ring-black"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Add Model */}
          <button
            type="button"
            className="custom--btn shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={() => {
              setEditBannerId(null);
              setAddNewBanner(true);
            }}
          >
            <FiPlus />
            <span>Add Model</span>
          </button>
        </div>

        {/* Table */}
        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">

                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[100px]">
                      Name
                    </th>

                    <th className="px-2 py-4 min-w-[120px]">
                      Device Brand
                    </th>

                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Position
                    </th>

                    <th className="px-2 py-4 min-w-[100px]">
                      Created at
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
                  {banners?.length > 0 ? (
                    banners.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        {/* Model Name */}
                        <td className="px-2 py-4">
                          {row.name || "-"}
                        </td>

                        {/* Device Brand */}
                        <td className="px-2 py-4">
                          {row.brand?.name || "-"}
                        </td>

                        {/* Position */}
                        <td className="px-2 py-4 text-center">
                          {row.position ?? "-"}
                        </td>

                        {/* Created Date */}
                        <td className="px-2 py-4">
                          {row.created_at
                            ? formatViewDate(row.created_at)
                            : "-"}
                        </td>

                        {/* Status */}
                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.status || "-"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-[1px]">
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Edit"
                              place="left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditBannerId(row.id);
                                  setAddNewBanner(true);
                                }}
                                className="text-black bg-gray-100
                                  w-[30px] h-[30px] flex items-center
                                  justify-center rounded-md"
                              >
                                <MdModeEdit size={18} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        {debouncedSearch
                          ? "No matching models found."
                          : "No records found."}
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
              currentDataLength={banners.length}
              onPageChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Device Model Modal */}
      <AddDeviceModel
        open={addNewBanner}
        groups={brandGroupList}
        onClose={() => {
          setAddNewBanner(false);
          setEditBannerId(null);
        }}
        editId={editBannerId}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default IsLoadingHOC(DeviceModelList);
