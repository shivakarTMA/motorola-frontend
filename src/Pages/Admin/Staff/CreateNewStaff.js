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

const roleOptions = [
  { value: 1, label: "Administrator" },
  { value: 2, label: "Manager" },
  { value: 3, label: "Support Executive" },
  { value: 4, label: "Content Editor" },
  { value: 5, label: "Viewer" },
];

const CreateNewStaff = ({ open, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      role_id: null,
      status: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),

      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),

      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Mobile must be 10 digits")
        .required("Mobile is required"),

      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),

      role_id: Yup.object().nullable().required("Role is required"),

      status: Yup.object().nullable().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name,
          email: values.email.trim(),
          mobile: values.mobile,
          password: values.password,
          role_id: values.role_id.value,
          status: values.status.value,
        };

        console.log(payload);

        // await authAxios().post("/staff/create", payload);

        toast.success("Staff Created Successfully");

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
                    Add New Staff
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
                      Email <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter Email"
                    />

                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Mobile <span className="text-red-600">*</span>
                    </label>

                    <input
                      type="text"
                      name="mobile"
                      maxLength={10}
                      value={formik.values.mobile}
                      onKeyDown={blockOnlyNumericKeys}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "mobile",
                          sanitizePositiveInteger(e.target.value),
                        )
                      }
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter Mobile"
                    />

                    {formik.touched.mobile && formik.errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Password <span className="text-red-600">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full pr-12"
                        placeholder="Enter Password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>

                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Role <span className="text-red-600">*</span>
                    </label>

                    <Select
                      styles={customStyles}
                      options={roleOptions}
                      value={formik.values.role_id}
                      onChange={(option) =>
                        formik.setFieldValue("role_id", option)
                      }
                      onBlur={() => formik.setFieldTouched("role_id", true)}
                    />

                    {formik.touched.role_id && formik.errors.role_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.role_id}
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

export default CreateNewStaff;
