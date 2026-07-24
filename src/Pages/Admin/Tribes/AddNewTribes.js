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
import { authAxios } from "../../../Config/config";
// import { authAxios } from "../../../config/config";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const AddNewCircle = ({
  open,
  onClose,
  editId,
  groups = [],
  onSuccess,
  tribeParents = [],
}) => {
  const isEdit = !!editId;

  // console.log("groups in AddNewCircle:", groups);
  // console.log("tribeParents in AddNewCircle:", tribeParents);

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  const parentOptions = [
    { value: 0, label: "-- No Parent --" },
    ...tribeParents
      .filter((tribe) => tribe.id !== editId)
      .map((tribe) => ({
        value: tribe.id,
        label: tribe.name,
      })),
  ];

  // Object URLs for live image previews. Kept in separate state (not
  // formik) since these are derived/display-only and must be revoked
  // on change/unmount to avoid leaking memory.
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      circle_group_id: null,
      bio: "",
      cover_image: null,
      icon_image: null,
      position: "",
      status: "",
      is_featured: false,
      parent_id: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      circle_group_id: Yup.object().nullable().required("Tribes is required"),
      bio: Yup.string().required("Bio is required"),
      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),
      cover_image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      icon_image: Yup.mixed()
        .required("Icon is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      // icon_image: Yup.mixed()
      //   .nullable()
      //   .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
      //     if (!value || typeof value === "string") return true;
      //     return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
      //   }),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("circle_group_id", values.circle_group_id.value);
        formData.append("parent_id", values.parent_id?.value ?? 0);
        formData.append("bio", values.bio);
        formData.append("position", values.position);
        formData.append("status", values.status);
        formData.append("is_featured", values.is_featured);

        if (values.cover_image instanceof File) {
          formData.append("cover_image", values.cover_image);
        }

        if (values.icon_image instanceof File) {
          formData.append("icon_image", values.icon_image);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/tribe/${editId}`, formData, config);
          toast.success("Tribe updated successfully");
        } else {
          await authAxios().post("/tribe", formData, config);
          toast.success("Tribe created successfully");
        }

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        console.error(err.response?.data || err.message);
        toast.error(err.response?.data?.errors || "Something went wrong");
      }
    },
  });

  // Build/revoke the cover image preview URL whenever the file changes
  useEffect(() => {
    if (!formik.values.cover_image) {
      setCoverPreview(null);
      return;
    }

    if (typeof formik.values.cover_image === "string") {
      setCoverPreview(formik.values.cover_image);
      return;
    }

    const url = URL.createObjectURL(formik.values.cover_image);
    setCoverPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [formik.values.cover_image]);

  // Build/revoke the icon image preview URL whenever the file changes
  useEffect(() => {
    if (!formik.values.icon_image) {
      setIconPreview(null);
      return;
    }

    if (typeof formik.values.icon_image === "string") {
      setIconPreview(formik.values.icon_image);
      return;
    }

    const url = URL.createObjectURL(formik.values.icon_image);
    setIconPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [formik.values.icon_image]);

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchTribesGroupById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/tribe/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            name: data.name || "",
            circle_group_id: data.circle_group_id
              ? {
                  value: data.circle_group_id,
                  label:
                    groups.find((item) => item.id === data.circle_group_id)
                      ?.name || "",
                }
              : null,
            parent_id:
              data.parent_id === 0
                ? {
                    value: 0,
                    label: "-- No Parent --",
                  }
                : {
                    value: data.parent_id,
                    label:
                      tribeParents.find((item) => item.id === data.parent_id)
                        ?.name || "",
                  },
            bio: data.bio || "",
            cover_image: data.cover_image_url || null,
            icon_image: data.icon_url || null,
            position: data.position ?? "",
            status: data.status || "",
            is_featured: data.is_featured ?? false,
          });

          // Existing image preview
          setCoverPreview(data.cover_image_url || null);
          setIconPreview(data.icon_url || null);
        }
      } catch (err) {
        console.error("Failed to load tribe:", err);
      }
    };

    fetchTribesGroupById();
  }, [editId, groups]);

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
                    Add New Tribes
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Name<span className="text-red-600">*</span>
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

                  {/* Tribe Group */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Tribe Group<span className="text-red-600">*</span>
                    </label>
                    <Select
                      name="circle_group_id"
                      styles={customStyles}
                      options={groupOptions}
                      value={formik.values.circle_group_id}
                      onChange={(option) =>
                        formik.setFieldValue("circle_group_id", option)
                      }
                      onBlur={() =>
                        formik.setFieldTouched("circle_group_id", true)
                      }
                      placeholder="Tribe Group"
                    />

                    {formik.touched.circle_group_id &&
                      formik.errors.circle_group_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.circle_group_id}
                        </p>
                      )}
                  </div>

                  {/* Parent Tribe */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Parent Tribe
                    </label>
                    <Select
                      name="parent_id"
                      styles={customStyles}
                      options={parentOptions}
                      value={formik.values.parent_id}
                      onChange={(option) =>
                        formik.setFieldValue("parent_id", option)
                      }
                      onBlur={() => formik.setFieldTouched("parent_id", true)}
                      placeholder="Parent Tribe"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Bio<span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formik.values.bio}
                      onChange={(e) => {
                        const cleaned = sanitizeFreeText(e.target.value);
                        formik.setFieldValue("bio", cleaned);
                      }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full resize-none"
                      placeholder="Bio"
                    />

                    {formik.touched.bio && formik.errors.bio && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.bio}
                      </p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Cover Image<span className="text-red-600">*</span>
                    </label>

                    {coverPreview && (
                      <div className="mb-2 relative w-full h-32 rounded overflow-hidden border">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <label
                      htmlFor="cover_image"
                      className="block text-center cursor-pointer border border-gray-400 text-gray-400 rounded py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <RiImageAddLine />{" "}
                        {coverPreview
                          ? "REPLACE COVER IMAGE"
                          : "UPLOAD COVER IMAGE"}
                      </span>
                    </label>
                    <input
                      id="cover_image"
                      name="cover_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden "
                      onChange={(e) =>
                        formik.setFieldValue(
                          "cover_image",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("cover_image", true)}
                    />

                    {formik.values.cover_image && (
                      <p className="text-xs text-black mt-1 truncate">
                        {formik.values.cover_image.name}
                      </p>
                    )}

                    {formik.touched.cover_image &&
                      formik.errors.cover_image && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.cover_image}
                        </p>
                      )}
                  </div>

                  {/* Icon Image */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Icon Image<span className="text-red-600">*</span>
                    </label>

                    {iconPreview && (
                      <div className="mb-2 relative w-16 h-16 rounded-full overflow-hidden border">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <label
                      htmlFor="icon_image"
                      className="block text-center cursor-pointer border border-gray-400 text-gray-400 rounded py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <RiImageAddLine />{" "}
                        {iconPreview
                          ? "REPLACE ICON IMAGE"
                          : "UPLOAD ICON IMAGE"}
                      </span>
                    </label>
                    <input
                      id="icon_image"
                      name="icon_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "icon_image",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("icon_image", true)}
                    />

                    {formik.values.icon_image && (
                      <p className="text-xs text-black mt-1 truncate">
                        {formik.values.icon_image.name}
                      </p>
                    )}

                    {formik.touched.icon_image && formik.errors.icon_image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.icon_image}
                      </p>
                    )}
                  </div>

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
                        const cleaned = sanitizePositiveInteger(e.target.value);
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

                  {/* Status */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Status<span className="text-red-600">*</span>
                    </label>

                    <Select
                      name="status"
                      styles={customStyles}
                      options={statusOptions}
                      value={statusOptions.find(
                        (item) => item.value === formik.values.status,
                      )}
                      onChange={(option) =>
                        formik.setFieldValue("status", option.value)
                      }
                      onBlur={() => formik.setFieldTouched("status", true)}
                    />

                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="is_featured"
                      name="is_featured"
                      type="checkbox"
                      checked={formik.values.is_featured}
                      onChange={(e) =>
                        formik.setFieldValue("is_featured", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <label
                      htmlFor="is_featured"
                      className="text-sm font-medium text-gray-700"
                    >
                      Feature Tribe
                    </label>
                  </div>

                  {formik.touched.is_featured && formik.errors.is_featured && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.is_featured}
                    </p>
                  )}

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

export default AddNewCircle;
