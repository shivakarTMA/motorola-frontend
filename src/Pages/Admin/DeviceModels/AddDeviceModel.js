import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles } from "../../../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  blockOnlyTextKeys,
  sanitizeOnlyText,
  blockOnlyNumericKeys,
  sanitizePositiveInteger,
  sanitizeFreeText,
} from "../../../Helper/Inputhelpers";
import { RiImageAddLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { authAxios } from "../../../Config/config";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const AddDeviceModel = ({ open, onClose, onSuccess, editId, groups = [] }) => {
  const isEdit = !!editId;

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  const formik = useFormik({
    initialValues: {
      name: "",
      status: "",
      device_brand_id: null,
      position: "",
    },

    validationSchema: Yup.object({
      name: Yup.string().trim().required("Brand name is required"),
      device_brand_id: Yup.object()
        .nullable()
        .required("Device Brand is required"),
      status: Yup.string().required("Status is required"),
      position: Yup.number()
        .typeError("Position must be a number")
        .positive("Position must be greater than 0")
        .required("Position is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name,
          device_brand_id: values.device_brand_id.value,
          status: values.status,
          position: values.position,
        };

        if (isEdit) {
          await authAxios().put(`/device-model/${editId}`, payload);
          toast.success("Model updated successfully");
        } else {
          await authAxios().post("/device-model", payload);
          toast.success("Model created successfully");
        }

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchTribesGroupById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/device-model/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            name: data.name || "",
            status: data.status || "",
            device_brand_id: data.device_brand_id
              ? {
                  value: data.device_brand_id,
                  label:
                    groups.find((item) => item.id === data.device_brand_id)
                      ?.name || "",
                }
              : null,
            // model_number: data.model_number ?? "",
            position: data.position ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load banner:", err);
      }
    };

    fetchTribesGroupById();
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
                    {editId ? "Update" : "Add New"} Model
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Model Name<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        // onKeyDown={blockOnlyTextKeys}
                        // onChange={(e) => {
                        //   const cleaned = sanitizeOnlyText(e.target.value);
                        //   formik.setFieldValue("name", cleaned);
                        // }}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="Name"
                      />

                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>

                    {/* Device Brand */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Device Brand<span className="text-red-600">*</span>
                      </label>
                      <Select
                        name="device_brand_id"
                        styles={customStyles}
                        options={groupOptions}
                        value={formik.values.device_brand_id}
                        onChange={(option) =>
                          formik.setFieldValue("device_brand_id", option)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("device_brand_id", true)
                        }
                        placeholder="Device Brand"
                      />

                      {formik.touched.device_brand_id &&
                        formik.errors.device_brand_id && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.device_brand_id}
                          </p>
                        )}
                    </div>

                    {/* Model Number */}
                    {/* <div>
                      <label className="block mb-2 text-sm font-medium">
                        Model Number<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="model_number"
                        value={formik.values.model_number}
                        onKeyDown={blockOnlyNumericKeys}
                        onChange={(e) => {
                          const cleaned = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("model_number", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="0"
                      />

                      {formik.touched.model_number &&
                        formik.errors.model_number && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.model_number}
                          </p>
                        )}
                    </div> */}

                    {/* Position */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Position<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onKeyDown={blockOnlyNumericKeys}
                        onChange={(e) => {
                          const cleaned = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("position", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="0"
                      />

                      {formik.touched.position && formik.errors.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.position}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Status<span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={statusOptions}
                        value={statusOptions.find(
                          (item) => item.value === formik.values.status,
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                      />

                      {formik.touched.status && formik.errors.status && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.status}
                        </p>
                      )}
                    </div>
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

export default AddDeviceModel;
