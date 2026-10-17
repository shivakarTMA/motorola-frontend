
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  FiDownload,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { authAxios } from "../../../Config/config";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import { customStyles, formatText } from "../../../Helper/helper";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";

const RetailerReport = ({setLoading}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [retailerList, setRetailerList] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const latestRequest = useRef(0);

  // ==========================================
  // FILTER STATES
  // ==========================================

  const [startDate, setStartDate] = useState(() => {
    const from = searchParams.get("date_from");
    return from ? new Date(`${from}T00:00:00`) : null;
  });

  const [endDate, setEndDate] = useState(() => {
    const to = searchParams.get("date_to");
    return to ? new Date(`${to}T00:00:00`) : null;
  });

  const [filterCity, setFilterCity] = useState(
    () => searchParams.get("city") || null
  );

  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [page, setPage] = useState(
    () => Number(searchParams.get("page")) || 1
  );

  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [cityOptions, setCityOptions] = useState([]);

  // ==========================================
  // FETCH CITY OPTIONS
  // ==========================================

  useEffect(() => {
    let active = true;

  
const fetchCityOptions = async () => {
  try {
    const response = await authAxios().get("/retailer/locations");

    if (!active || !response?.data?.success) return;

    const locations = response?.data?.data || [];

    const options = locations.map((location) => ({
      value: location,
      label: location,
    }));

    setCityOptions(options);
  } catch (error) {
    console.error("Error fetching city options:", error);
  }
};


    fetchCityOptions();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // SEARCH DEBOUNCE
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // FETCH RETAILER REPORT API
  // ==========================================

  useEffect(() => {
    const requestId = ++latestRequest.current;

    const fetchRetailerReport = async () => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: rowsPerPage,
        };

        if (filterCity) {
          params.location = filterCity;
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (startDate && endDate) {
          params.date_from = format(startDate, "yyyy-MM-dd");
          params.date_to = format(endDate, "yyyy-MM-dd");
        }

        const response = await authAxios().get("/retailer/report", {
          params,
        });

        if (requestId !== latestRequest.current) return;

        const resData = response?.data;

        if (resData?.success) {
          const items = resData?.data?.items || [];

          setRetailerList(items);

          const pagination = resData?.data?.pagination;

          setTotalPages(pagination?.totalPages ?? 1);
          setTotalCount(pagination?.total ?? 0);
        } else {
          setRetailerList([]);
          setTotalPages(1);
          setTotalCount(0);

          toast.error(
            resData?.message || "Failed to fetch retailers"
          );
        }
      } catch (error) {
        if (requestId !== latestRequest.current) return;

        console.error("Error fetching retailer report:", error);

        setRetailerList([]);
        setTotalPages(1);
        setTotalCount(0);

        toast.error(
          error?.response?.data?.message ||
            "Failed to fetch retailer report"
        );
      } finally {
        if (requestId === latestRequest.current) {
          setLoading(false);
        }
      }
    };

    fetchRetailerReport();

    return () => {
      latestRequest.current += 1;
    };
  }, [
    page,
    filterCity,
    debouncedSearch,
    startDate,
    endDate,
  ]);

  // ==========================================
  // SYNC FILTERS WITH URL
  // ==========================================

  useEffect(() => {
    const params = new URLSearchParams();

    if (filterCity) {
      params.set("city", filterCity);
    }

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (startDate && endDate) {
      params.set("date_from", format(startDate, "yyyy-MM-dd"));
      params.set("date_to", format(endDate, "yyyy-MM-dd"));
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    filterCity,
    debouncedSearch,
    startDate,
    endDate,
    page,
    searchParams,
    setSearchParams,
  ]);

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleDateRangeChange = ({
    startDate: newStart,
    endDate: newEnd,
  }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  const handleCityChange = (option) => {
    setFilterCity(option?.value || null);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  // ==========================================
  // DOWNLOAD REPORT
  // ==========================================

 
const handleDownloadReport = async () => {
  if (downloading) return;

  try {
    setDownloading(true);

    const params = {};

    if (filterCity) {
      params.location = filterCity;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    if (startDate && endDate) {
      params.date_from = format(startDate, "yyyy-MM-dd");
      params.date_to = format(endDate, "yyyy-MM-dd");
    }

    const response = await authAxios().get(
      "/retailer/report/excel",
      {
        params,
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
   
   let fileName = "Retailer Report";

if (startDate && endDate) {
  const fromDate = format(startDate, "yyyy-MM-dd");
  const toDate = format(endDate, "yyyy-MM-dd");

  fileName += ` ${fromDate} ${toDate}`;
}

link.download = `${fileName}.xlsx`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Report downloaded successfully");
  } catch (error) {
    console.error("Error downloading retailer report:", error);

    toast.error(
      "Failed to download retailer report"
    );
  } finally {
    setDownloading(false);
  }
};


  const handlePageChange = (newPage) => {
  if (
    newPage < 1 ||
    newPage > totalPages ||
    newPage === page
  ) {
    return;
  }

  setPage(newPage);
};

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getPageNumbers();

  const paginationButtonClass =
    "flex h-8 min-w-[30px] items-center justify-center " +
    "rounded-md border text-xs font-medium transition-colors";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">

      {/* Filters and Download */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 w-full min-w-0">

        {/* Left Side - Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full min-w-0 xl:flex-1">

          {/* Date Range */}
          <div className="relative w-full min-w-0 h-10 [&>div]:h-full [&_button]:h-full">
            <DateRangePicker
              onChange={handleDateRangeChange}
              defaultPreset="Today"
              panelOffsetTop={100}
              panelOffsetLeft={0}
              value={{ startDate, endDate }}
            />
          </div>

          {/* City */}
          <div className="w-full min-w-0">
  <Select
    placeholder="Filter by Location"
    value={
      cityOptions.find(
        (option) => option.value === filterCity
      ) || null
    }
    options={cityOptions}
    onChange={handleCityChange}
    styles={{
      ...customStyles,
      control: (provided, state) => ({
        ...customStyles.control?.(provided, state),
        minHeight: "40px",
        height: "40px",
      }),
      valueContainer: (provided) => ({
        ...provided,
        height: "40px",
        padding: "0 8px",
      }),
      indicatorsContainer: (provided) => ({
        ...provided,
        height: "40px",
      }),
    }}
    isClearable
  />
</div>

          {/* Search Retailer */}
          <div className="relative w-full min-w-0">
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name..."
              aria-label="Search retailers"
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
        </div>

        {/* Download Button */}
        <div className="w-full md:w-fit md:ml-auto xl:w-auto xl:shrink-0">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex w-full xl:w-auto items-center justify-center
              gap-2 bg-black text-white px-5 py-2.5 rounded-lg
              text-sm font-medium whitespace-nowrap transition-colors
              hover:bg-gray-800"
          >
            <FiDownload size={17} />
            Download Report
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="mt-3 w-full min-w-0 max-w-full">
        <div className="box--shadow bg-white rounded-[15px] p-3 sm:p-4 w-full min-w-0 max-w-full">

          {/* Table scrolls independently */}
          <div className="relative w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm text-left text-gray-500">

              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4 min-w-[70px]">
                    S.No
                  </th>

                  <th className="px-2 py-4 min-w-[180px]">
                    Retailer Name
                  </th>

                  <th className="px-2 py-4 min-w-[150px]">
                    Retailer Code
                  </th>

                  <th className="px-2 py-4 min-w-[200px]">
                    Address
                  </th>

                  <th className="px-2 py-4 min-w-[150px]">
                    Location
                  </th>
                  <th className="px-2 py-4 min-w-[130px] ">
                    Status
                  </th>
                  <th className="px-2 py-4 min-w-[130px] text-center">
                    Total Signups
                  </th>
                 
                </tr>
              </thead>

             <tbody>
  {retailerList.length > 0 ? (
    retailerList.map((row, index) => (
      <tr
        key={row.id || index}
        className="border-b hover:bg-gray-50 text-xs"
      >
        <td className="px-2 py-4">
          {(page - 1) * rowsPerPage + index + 1}
        </td>

        <td className="px-2 py-4">{row.name || "-"}</td>

        <td className="px-2 py-4">
          {row.referral_code || "-"}
        </td>
        <td className="px-2 py-4">{row.location || "-"}</td>

        <td className="px-2 py-4">{row.address || "-"}</td>
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


        <td className="px-2 py-4 text-center">
          {row.total_referred_count ?? 0}
        </td>
        
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={6}
        className="px-4 py-6 text-center text-gray-500"
      >
        No records found.
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>

          {/* ======================================
              RESPONSIVE PAGINATION
          ====================================== */}

          <div className="mt-4 flex w-full min-w-0 flex-col items-start gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Entries count */}
            <div className="w-full text-left text-xs text-gray-600 sm:w-auto sm:text-sm">
              {totalCount} entries found.
            </div>

            {/* Pagination buttons */}
           {totalCount > rowsPerPage && (
            <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-1 sm:w-auto sm:justify-end">

              {/* Previous */}
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 }
                className={`${paginationButtonClass} px-2 ${
                  page <= 1
                    ? "cursor-not-allowed text-gray-300 border-gray-200"
                    : "text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  // disabled={loading}
                  className={`${paginationButtonClass} ${
                    page === pageNumber
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Last Page */}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  <span className="px-1 text-xs text-gray-500">
                    ...
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages)}
                    // disabled={loading}
                    className={`${paginationButtonClass} bg-white text-gray-700 border-gray-200 hover:bg-gray-100`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next */}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages }
                className={`${paginationButtonClass} px-2 ${
                  page >= totalPages
                    ? "cursor-not-allowed text-gray-300 border-gray-200"
                    : "text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                <FiChevronRight size={16} />
              </button>

            </div>
)}
          </div>

        </div>
      </div>
    </div>
  );
};

export default IsLoadingHOC(RetailerReport);
