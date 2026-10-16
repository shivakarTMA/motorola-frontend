
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import { customStyles } from "../../../Helper/helper";

const RetailerReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [retailerList, setRetailerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const from = searchParams.get("date_from");
    return from ? new Date(`${from}T00:00:00`) : null;
  });

  const [endDate, setEndDate] = useState(() => {
    const to = searchParams.get("date_to");
    return to ? new Date(`${to}T00:00:00`) : null;
  });

  // City and retailer filters
  const [filterCity, setFilterCity] = useState(() =>
    searchParams.get("city") || null
  );

  const [filterRetailer, setFilterRetailer] = useState(() =>
    searchParams.get("retailer_id") || null
  );

  // Pagination
  const [page, setPage] = useState(() =>
    Number(searchParams.get("page")) || 1
  );

  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [cityOptions, setCityOptions] = useState([]);
  const [retailerOptions, setRetailerOptions] = useState([]);

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filterCity) {
      params.set("city", filterCity);
    }

    if (filterRetailer) {
      params.set("retailer_id", filterRetailer);
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
    filterRetailer,
    startDate,
    endDate,
    page,
    setSearchParams,
  ]);

  // Filter handlers
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
    setFilterRetailer(null);
    setPage(1);
  };

  const handleRetailerChange = (option) => {
    setFilterRetailer(option?.value || null);
    setPage(1);
  };

  // Excel download
 

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

    {/* Retailer */}
    <div className="min-w-[200px] lg:w-fit w-full">
      <Select
        placeholder="Filter by Retailer"
        value={
          retailerOptions.find(
            (option) => option.value === filterRetailer
          ) || null
        }
        options={retailerOptions}
        onChange={handleRetailerChange}
        styles={customStyles}
        isClearable
      />
    </div>
  </div>

  {/* Right Side - Download Button */}
  <div className="flex items-start">
    <button
      type="button"
      className="flex items-center justify-center gap-2 bg-black  text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
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
                {retailerList.length > 0 ? (
                  retailerList.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 text-xs"
                    >
                      <td className="px-2 py-4">
                        {(page - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="px-2 py-4">
                        {row.retailer_name || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.retailer_code || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.address || "-"}
                      </td>

                      <td className="px-2 py-4">
                        {row.city || "-"}
                      </td>

                      <td className="px-2 py-4 text-center">
                        {row.total_signups ?? 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      {loading ? "Loading..." : "No records found."}
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
