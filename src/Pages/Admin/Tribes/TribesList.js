import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewTribes from "./AddNewTribes";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import {
  customStyles,
  filterActiveItems,
  formatText,
  formatViewDate,
} from "../../../Helper/helper";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import Select from "react-select";

const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const TribesList = (props) => {
  const { setLoading } = props;
  const [tribeList, setTribeList] = useState([]);
  const [editTribeId, setEditTribeId] = useState(null);
  const [addNewTribe, setAddNewTribe] = useState(false);
  const [tribeGroupList, setTribeGroupList] = useState([]);
  const [parentTribeList, setParentTribeList] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [statusFilter, setStatusFilter] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // const [pagination, setPagination] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  // const rowsPerPage = 10;

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchTribes = async (currentPage = page) => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (groupFilter) {
        params.circle_group_id = groupFilter;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      // Fetch tribe data from API
      const response = await authAxios().get("/tribe", { params });
      const resData = response?.data;
      if (resData?.success) {
        setTribeList(resData.data.items || []);
        // console.log("Fetched tribe data:", resData.data.items);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
      } else {
        console.error("Failed to fetch tribe data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribes();
  }, [startDate, endDate, statusFilter, groupFilter]);

  const handleFetchTribesGroup = async () => {
    try {
      setLoading(true);

      // Fetch tribe-group data from API
      const response = await authAxios().get("/tribe-group");
      const resData = response?.data;
      if (resData?.success) {
        let data = resData.data.items || [];
        const activeOnly = filterActiveItems(data);
        setTribeGroupList(activeOnly);
        console.log("Fetched tribe group data:", activeOnly);
      } else {
        console.error("Failed to fetch tribe group data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe group data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchParentTribes = async () => {
    try {
      setLoading(true);

      // Fetch tribe parents data from API
      const response = await authAxios().get("/tribe/parents");
      const resData = response?.data;
      if (resData?.success) {
        setParentTribeList(resData.data || []);
        console.log("Fetched parent tribe parents data:", resData.data);
      } else {
        console.error(
          "Failed to fetch parent tribe parents data:",
          resData?.message,
        );
      }
    } catch (error) {
      console.error("Error fetching parent tribe parents data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribesGroup();
    handleFetchParentTribes();
  }, []);

  const groupOptions = tribeGroupList.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tribe/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTribes();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tribe.");
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

  const handleGroupChange = (option) => {
    setPage(1);
    setGroupFilter(option?.value || null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative flex justify-between gap-4">
          <div className="flex lg:flex-row flex-col gap-2 flex-1">
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
            <div className="w-full lg:max-w-[200px]">
              <Select
                placeholder="Filter by group"
                value={
                  groupOptions.find((o) => o.value === groupFilter) || null
                }
                options={groupOptions}
                onChange={handleGroupChange}
                isClearable
                styles={customStyles}
              />
            </div>
          </div>
          <button className="custom--btn" onClick={() => setAddNewTribe(true)}>
            <FiPlus />
            <span>New Tribes</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[80px]">Photo</th>
                    <th className="px-2 py-4 min-w-[120px]">Created At</th>
                    <th className="px-2 py-4 min-w-[120px]">Created By</th>
                    <th className="px-2 py-4 min-w-[200px]">Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Tribe Group</th>
                    <th className="px-2 py-4 min-w-[120px]">Parent</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Members
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      interactions
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      posts
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      moderators
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Position
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tribeList?.length > 0 ? (
                    tribeList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">
                          <img
                            src={row.icon_url}
                            alt={row.name}
                            className="w-7 h-7 rounded-full object-cover object-center"
                          />
                        </td>

                        <td className="px-2 py-4">
                          {formatViewDate(row.created_at)}
                        </td>
                        <td className="px-2 py-4">{row.staff?.name}</td>

                        <td className="px-2 py-4">
                          <div className="whitespace-normal break-words">
                            {row.name}
                          </div>
                        </td>

                        <td className="px-2 py-4">
                          {row.circleGroup?.name ?? "--"}
                        </td>

                        <td className="px-2 py-4">
                          {row.parent?.name ?? "--"}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.users_count}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.interactions_count}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.posts_count}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.moderators ?? 0}
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatText(row.status)}
                          </span>
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.position}
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
                                  setEditTribeId(row.id);
                                  setAddNewTribe(true);
                                }}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-md"
                              >
                                <MdModeEdit size={18} />
                              </button>
                            </Tooltip>

                            {/* <Tooltip
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
                            </Tooltip> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={13}
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
              currentDataLength={tribeList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchTribes(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <AddNewTribes
        open={addNewTribe}
        groups={tribeGroupList}
        tribeParents={parentTribeList}
        onClose={() => {
          setAddNewTribe(false);
          setEditTribeId(null);
        }}
        editId={editTribeId}
        onSuccess={() => handleFetchTribes()}
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
              Delete Tribe
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tribe?
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

export default IsLoadingHOC(TribesList);
