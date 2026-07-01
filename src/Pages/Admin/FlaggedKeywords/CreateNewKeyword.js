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

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const matchTypeOptions = [
  { value: "EXACT", label: "Exact" },
  { value: "CONTAINS", label: "Contains" },
  { value: "REGEX", label: "Regex" },
];

const severityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const autoActionOptions = [
  { value: "FLAG_FOR_REVIEW", label: "Flag For Review" },
  { value: "AUTO_HIDE", label: "Auto Hide" },
];

const CreateNewKeyword = ({ open, onClose, onSuccess }) => {
  const [badgePreview, setBadgePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      keyword: "",
      match_type: null,
      severity: null,
      auto_action: null,
      status: null,
    },
    validationSchema: Yup.object({
      keyword: Yup.string().trim().required("Keyword is required"),

      match_type: Yup.object().nullable().required("Match Type is required"),

      severity: Yup.object().nullable().required("Severity is required"),

      auto_action: Yup.object().nullable().required("Auto Action is required"),

      status: Yup.object().nullable().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          keyword: values.keyword,
          match_type: values.match_type.value,
          severity: values.severity.value,
          auto_action: values.auto_action.value,
          status: values.status.value,
        };

        console.log(payload);

        // await authAxios().post("/keywords/create", payload);

        toast.success("Keyword Created Successfully");

        resetForm();
        onSuccess?.();
        onClose();
      } catch (err) {
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
                    Add New Keyword
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  <div className="grid lg:grid-cols-2 gap-3 grid-cols-1">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Keyword <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="text"
                        name="keyword"
                        value={formik.values.keyword}
                        onKeyDown={blockOnlyTextKeys}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "keyword",
                            sanitizeOnlyText(e.target.value),
                          )
                        }
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="Enter Keyword"
                      />

                      {formik.touched.keyword && formik.errors.keyword && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.keyword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Match Type <span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={matchTypeOptions}
                        value={formik.values.match_type}
                        onChange={(option) =>
                          formik.setFieldValue("match_type", option)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("match_type", true)
                        }
                      />

                      {formik.touched.match_type &&
                        formik.errors.match_type && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.match_type}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Severity <span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={severityOptions}
                        value={formik.values.severity}
                        onChange={(option) =>
                          formik.setFieldValue("severity", option)
                        }
                        onBlur={() => formik.setFieldTouched("severity", true)}
                      />

                      {formik.touched.severity && formik.errors.severity && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.severity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Auto Action <span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={autoActionOptions}
                        value={formik.values.auto_action}
                        onChange={(option) =>
                          formik.setFieldValue("auto_action", option)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("auto_action", true)
                        }
                      />

                      {formik.touched.auto_action &&
                        formik.errors.auto_action && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.auto_action}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Status <span className="text-red-600">*</span>
                      </label>

                      <Select
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
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="custom--btn !bg-white !text-black border !border-black"
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

export default CreateNewKeyword;
