import React, { useEffect, useState } from "react";
import { MdBrandingWatermark, MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { formatText, formatViewDate, formatWithTimeDate } from "../../../Helper/helper";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";
import AddDeviceBrand from "./AddDeviceBrand";

const DeviceBrandsList = (props) => {
  const { setLoading } = props;
  const [banners, setBanners] = useState([]);
  const [editBannerId, setEditBannerId] = useState(null);
  const [addNewBanner, setAddNewBanner] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);


  const fetchBanners = async (currentPage = page) => {
    try {
      setLoading(true);
      const response = await authAxios().get("/device-brand", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
        },
      });
      const resData = response.data;
      if (resData.success) {
        setBanners(resData.data.items);
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

  useEffect(() => {
    fetchBanners();
  }, []);


  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end gap-4">
          <button className="custom--btn" onClick={() => setAddNewBanner(true)}>
            <FiPlus />
            <span>Add Brand</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    {/* <th className="px-2 py-4 min-w-[80px]">
                      Logo
                    </th> */}
                    <th className="px-2 py-4 min-w-[150px]">Name</th>
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
                        {/* <td className="px-2 py-4 text-center">
                          {row?.logo_url ? (
                            <div className="p-1">
                              <img
                                src={row.logo_url}
                                alt={row.name}
                                className="w-10 h-10 rounded-full object-contain object-center"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                <MdBrandingWatermark />
                              </span>
                            </div>
                          )}
                        </td> */}

                        <td className="px-2 py-4">{row.name || "-"}</td>
                        <td className="px-2 py-4">{formatViewDate(row.created_at) || "-"}</td>

                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.status}
                          </span>
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
                                  setEditBannerId(row.id);
                                  setAddNewBanner(true);
                                }}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-md"
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
                        colSpan={5}
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
              currentDataLength={banners.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchBanners(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <AddDeviceBrand
        open={addNewBanner}
        onClose={() => {
          setAddNewBanner(false);
          setEditBannerId(null);
        }}
        editId={editBannerId}
        onSuccess={() => fetchBanners()}
      />

    </>
  );
};

export default IsLoadingHOC(DeviceBrandsList);
