
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { FiDownload, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

import { authAxios } from "../../../Config/config";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import { customStyles } from "../../../Helper/helper";

const RetailerReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [retailerList, setRetailerList] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Search input
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
        const response = await authAxios().get("/retailer", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        if (!active || !response?.data?.success) return;

        const items = response?.data?.data?.items || [];

        const cities = [
          ...new Set(
            items
              .map((item) => item.location)
              .filter(Boolean)
          ),
        ];

        const options = cities.map((city) => ({
          value: city,
          label: city,
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

        // City filter
        if (filterCity) {
          params.location = filterCity;
        }

        // Search retailer
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        // Date range filter
        if (startDate && endDate) {
          params.date_from = format(startDate, "yyyy-MM-dd");
          params.date_to = format(endDate, "yyyy-MM-dd");
        }

        const response = await authAxios().get("/retailer", {
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
      params.set(
        "date_from",
        format(startDate, "yyyy-MM-dd")
      );

      params.set(
        "date_to",
        format(endDate, "yyyy-MM-dd")
      );
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

  const handleDownloadReport = () => {
    toast.info("Download API is not configured yet.");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* Filters and Download */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">

        {/* Left Side - Filters */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-3 flex-1">

          {/* Date Range */}
          <div className="lg:min-w-[200px] lg:w-fit w-full relative">
            <DateRangePicker
              onChange={handleDateRangeChange}
              defaultPreset="Today"
              panelOffsetTop={100}
              panelOffsetLeft={0}
              value={{ startDate, endDate }}
            />
          </div>

          {/* City */}
          <div className="min-w-[180px] lg:w-fit w-full">
            <Select
              placeholder="Filter by City"
              value={
                cityOptions.find(
                  (option) => option.value === filterCity
                ) || null
              }
              options={cityOptions}
              onChange={handleCityChange}
              styles={customStyles}
              isClearable
            />
          </div>

          {/* Search Retailer */}
          <div className="relative w-full lg:w-[250px]">

            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
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

        {/* Right Side - Download Button */}
        <div className="flex items-start">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          >
            <FiDownload size={17} />
            Download Report
          </button>
        </div>

      </div>

      {/* Report Table */}
      <div className="mt-3">
        <div className="box--shadow bg-white rounded-[15px] p-4">

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">

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

                  <th className="px-2 py-4 min-w-[130px] text-center">
                    Total Signups
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading retailers...
                    </td>
                  </tr>
                ) : retailerList.length > 0 ? (
                  retailerList.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-b hover:bg-gray-50 text-xs"
                    >

                      <td className="px-2 py-4">
                        {(page - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="px-2 py-4">
                        {row.name || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.referral_code || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.address || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.location || "-"}
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

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            currentDataLength={retailerList.length}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
          />

        </div>
      </div>
    </div>
  );
};

export default RetailerReport;
