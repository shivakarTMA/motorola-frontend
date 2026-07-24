import React, { useEffect, useState } from "react";
import { MdImage, MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewTribesGroup from "./AddNewTribesGroup";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { customStyles, formatWithTimeDate } from "../../../Helper/helper";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import Select from "react-select";

const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const TribesGroupList = (props) => {
  const { setLoading } = props;
  const [tribeGroupList, setTribeGroupList] = useState([]);
  const [editTribeGroupId, setEditTribeGroupId] = useState(null);
  const [addNewTribeGroup, setAddNewTribeGroup] = useState(false);

  const [statusFilter, setStatusFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchTribesGroup = async (currentPage = page) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      // Fetch tribe-group data from API
      const response = await authAxios().get("/tribe-group", { params });
      const resData = response?.data;
      if (resData?.success) {
        setTribeGroupList(resData.data.items || []);
        // console.log("Fetched tribe group data:", resData.data.items);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
      } else {
        console.error("Failed to fetch tribe group data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe group data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribesGroup();
  }, [startDate, endDate, statusFilter]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tribe-group/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTribesGroup();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tribe group.");
    } finally {
      setLoading(false);
    }
  };

  // Called only when DateRangePicker's Apply or Clear button is clicked.
  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };
  const handleStatusChange = (option) => {
    setPage(1);
    setStatusFilter(option?.value || null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative flex lg:flex-row flex-col justify-between gap-2">
          <div className="flex lg:flex-row flex-col gap-2">
            <div className="lg:max-w-[200px] w-full">
              <DateRangePicker
                onChange={handleDateRangeChange}
                defaultPreset="Today"
                panelOffsetTop={100}
                panelOffsetLeft={0}
              />
            </div>

            <div className="w-full lg:max-w-[200px]">
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

          <button
            className="custom--btn"
            onClick={() => setAddNewTribeGroup(true)}
          >
            <FiPlus />
            <span>New Tribe Group</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[80px]">Photo</th>
                    <th className="px-2 py-4 min-w-[150px]">Created at</th>
                    <th className="px-2 py-4 min-w-[150px]">Created By</th>
                    <th className="px-2 py-4 min-w-[150px]">Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Status</th>
                    <th className="px-2 py-4 min-w-[100px]">Position</th>
                    <th className="px-2 py-4 min-w-[100px]">Tribes</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tribeGroupList?.length > 0 ? (
                    tribeGroupList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt={row.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <MdImage />
                            </div>
                          )}
                        </td>

                        <td className="px-2 py-4">
                          {formatWithTimeDate(row.created_at)}
                        </td>
                        <td className="px-2 py-4">{row.staff?.name}</td>

                        <td className="px-2 py-4">{row.name}</td>

                        <td className="px-2 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>

                        <td className="px-2 py-4">{row.position}</td>

                        <td className="px-2 py-4">{row.circles_count ?? 0}</td>

                        <td className="px-2 py-4">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditTribeGroupId(row.id);
                                setAddNewTribeGroup(true);
                              }}
                              className="text-black bg-gray-100 w-[30px] h-[30px] rounded-md flex items-center justify-center"
                            >
                              <MdModeEdit size={18} />
                            </button>

                            {/* <button
                              onClick={() => {
                                setDeleteId(row.id);
                                setDeleteModal(true);
                              }}
                              className="text-red-500 bg-red-100 w-[30px] h-[30px] rounded-r-md flex items-center justify-center"
                            >
                              <FiTrash2 size={18} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
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
              currentDataLength={tribeGroupList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchTribesGroup(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <AddNewTribesGroup
        open={addNewTribeGroup}
        onClose={() => {
          setAddNewTribeGroup(false);
          setEditTribeGroupId(null);
        }}
        editId={editTribeGroupId}
        onSuccess={() => handleFetchTribesGroup()}
      />

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
              Delete Tribe Group
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tribe group? This action
              cannot be undone.
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

export default IsLoadingHOC(TribesGroupList);
