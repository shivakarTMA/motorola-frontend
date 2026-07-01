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
} from "../../../Helper/Inputhelpers";
import { RiImageAddLine } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
// import { authAxios } from "../../../config/config";


const menuOptions = [
  { value: 1, label: "Settings" },
  { value: 2, label: "Dashboard" },
  { value: 3, label: "Users" },
];

const CreateNewModule = ({ open, onClose, onSuccess }) => {
    
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      position: "",
      menu_id: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      description: Yup.string().trim().required("Description is required"),

      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),

      menu_id: Yup.object().nullable().required("Menu is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name,
          description: values.description,
          position: Number(values.position),
          menu_id: values.menu_id.value,
        };

        console.log(payload);

        // await authAxios().post("/module/create", payload);

        toast.success("Module Created Successfully");

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

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
                    Add New Module
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
                      onKeyDown={blockOnlyTextKeys}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "name",
                          sanitizeOnlyText(e.target.value),
                        )
                      }
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter Module Name"
                    />

                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Description <span className="text-red-600">*</span>
                    </label>

                    <textarea
                      name="description"
                      rows={3}
                      value={formik.values.description}
                      onChange={(e) => {
                        const cleaned = sanitizeFreeText(e.target.value);
                        formik.setFieldValue("description", cleaned);
                      }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full resize-none"
                      placeholder="Enter Description"
                    />

                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Position <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="number"
                      name="position"
                      value={formik.values.position}
                      onKeyDown={blockOnlyNumericKeys}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "position",
                          sanitizePositiveInteger(e.target.value),
                        )
                      }
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
                      Menu <span className="text-red-600">*</span>
                    </label>

                    <Select
                      styles={customStyles}
                      options={menuOptions}
                      value={formik.values.menu_id}
                      onChange={(option) =>
                        formik.setFieldValue("menu_id", option)
                      }
                      onBlur={() => formik.setFieldTouched("menu_id", true)}
                    />

                    {formik.touched.menu_id && formik.errors.menu_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.menu_id}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 rounded-lg border"
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

export default CreateNewModule;
