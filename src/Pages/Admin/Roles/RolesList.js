import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatViewDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import Pagination from "../../../Components/Common/Pagination";

const RolesList = (props) => {
  const { setLoading } = props;
  const [rolesList, setRolesList] = useState([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    {
      name: "Role Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      grow: 2,
    },
    {
      name: "Created At",
      selector: (row) => formatViewDate(row.created_at),
      center: true,
      sortable: true,
    },

    {
      name: "Actions",
      // width: "120px",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-view-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => handleEdit(row)}
              className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
              title="Edit"
            >
              <MdModeEdit size={18} />
            </button>
          </Tooltip>
          <Tooltip id={`tooltip-view-${row.id}`} content="Delete" place="left">
            <button
              onClick={() => handleDelete(row.id)}
              className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md "
              title="Delete"
            >
              <FiTrash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleFetchRoles = async (currentPage = page) => {
    try {
      setLoading(true);

      const response = await authAxios().get("/role", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        setRolesList(resData.data.items || []);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
      } else {
        console.error("Failed to fetch role data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRoles();
  }, []);

  const handleEdit = (row) => {
    console.log("Edit:", row);
    // Open edit modal
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      console.log("Delete:", id);
      // Call delete API
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-4">
          <Link to="/role" className="custom--btn">
            <FiPlus />
            <span>New Role</span>
          </Link>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[150px]">Role Name</th>
                    <th className="px-2 py-4 min-w-[80px]">Description</th>
                    <th className="px-2 py-4 min-w-[120px]">Created At</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rolesList?.length > 0 ? (
                    rolesList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">{row.name || "--"}</td>

                        <td className="px-2 py-4">{row.description || "--"}</td>

                        <td className="px-2 py-4 text-center">
                          {formatViewDate(row.created_at) || "--"}
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-[1px]">
                            <Tooltip
                              id={`tooltip-view-${row.id}`}
                              content="Edit"
                              place="left"
                            >
                              <button
                                onClick={() => handleEdit(row)}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
                                title="Edit"
                              >
                                <MdModeEdit size={18} />
                              </button>
                            </Tooltip>
                            <Tooltip
                              id={`tooltip-view-${row.id}`}
                              content="Delete"
                              place="left"
                            >
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md "
                                title="Delete"
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
                        colSpan={12}
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
              currentDataLength={rolesList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchRoles(newPage);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default IsLoadingHOC(RolesList);
