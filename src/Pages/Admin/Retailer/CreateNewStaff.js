import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { customStyles } from "../../../Helper/helper";
import {
  blockOnlyTextKeys,
  sanitizeOnlyText,
  blockOnlyNumericKeys,
  sanitizePositiveInteger,
  sanitizeFreeText,
  handleNumericPaste,
} from "../../../Helper/Inputhelpers";
import { RiImageAddLine } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAxios } from "../../../Config/config";
// import { authAxios } from "../../../config/config";
import { sanitizeInput } from "../../../Helper/helper";
import { locationOptions } from "./location";
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const CreateNewStaff = ({ open, onClose, onSuccess, roleOptions, editId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!editId;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      location: "",
      address: "",
      password: "",
      status: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),

      location: Yup.string()
        .required("location is required"),

      address: Yup.string()
        .required("address is required"),

      status: Yup.object().nullable().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {

      console.log(values,"dsfdsfd")
      try {
        const payload = {
          name: values.name,
          location: values.location.trim(),
          address: values.address,
          status: values.status.value,
          ...(values.password ? { password: values.password } : {}),
        };

        console.log(payload);
        if (isEdit) {
          // /api/crm/retailer/:id
          await authAxios().put(`/retailer/${editId}`, payload);
          toast.success("Retailer Updated Successfully");
        } else {
          await authAxios().post("/retailer", payload);
          toast.success("Retailer Created Successfully");
        }

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchStaffById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/retailer/${editId}`);
        const data = res?.data?.data;
        // console.log(data?.,"aysssssssssss")
        if (res?.data?.success && data) {
          formik.setValues({
            name: data.name || "",
            location: data.location || "",
            address: data.address || "",
              // roleOptions?.find((opt) => opt.value === data.value) || null,
            status: data.status
              ? { value: data.status, label: data.status }
              : null,
          });
        }
      } catch (err) {
        console.error("Failed to load staff:", err);
      }
    };

    fetchStaffById();
  }, [editId]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-5">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold">
                   {isEdit ? "Edit Retailer" : "Add Retailer"} 
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Name <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formik.values.name}
                       onChange={(e) => {
        const cleaned = e.target.value.replace(/[0-9]/g, "");
    formik.setFieldValue(e.target.name, cleaned);
  }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter Name"
                    />

                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  

<div>
  <label className="block mb-2 text-sm font-medium">
    Location <span className="text-red-600">*</span>
  </label>

  <Select
    name="location"
    styles={customStyles}
    options={locationOptions}
    placeholder="Select Location"
    value={
      locationOptions.find(
        (option) => option.value === formik.values.location
      ) || null
    }
    onChange={(option) =>
      formik.setFieldValue("location", option?.value || "")
    }
    onBlur={() =>
      formik.setFieldTouched("location", true)
    }
    isClearable
  />

  {formik.touched.location && formik.errors.location && (
    <p className="text-red-500 text-sm mt-1">
      {formik.errors.location}
    </p>
  )}
</div>



                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      address <span className="text-red-600">*</span>
                    </label>

                    <input
                     type="text"
                     name="address"
                     value={formik.values.address}
                     onChange={formik.handleChange}
                     onBlur={formik.handleBlur}
                     className="custom--input w-full"
                     placeholder="Enter address"
                   />

                    {formik.touched.address && formik.errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.address}
                      </p>
                    )}
                  </div>


                  {/* Status */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Status<span className="text-red-600">*</span>
                    </label>

                    <Select
                      name="status"
                      styles={customStyles}
                      options={statusOptions}
                      value={formik.values.status}
                      onChange={(option) =>
                        formik.setFieldValue("status", option)
                      }
                      onBlur={() => formik.setFieldTouched("status", true)}
                    />

                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="custom--btn !bg-white !border !border-black !text-black"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="custom--btn disabled:opacity-60"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateNewStaff;
