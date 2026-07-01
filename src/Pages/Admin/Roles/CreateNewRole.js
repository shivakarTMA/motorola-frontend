import { useState } from "react";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  blockOnlyTextKeys,
  sanitizeOnlyText,
} from "../../../Helper/Inputhelpers";

const permissionsData = [
  {
    module: "Dashboard",
    children: ["SSBP Dashboard", "Loan Disbursed Dashboard"],
  },
  {
    module: "Sales",
    children: ["Add Payments"],
  },
  {
    module: "Leads",
    children: ["My Follow-ups"],
  },
];

const permissionTypes = ["create", "view", "update", "delete"];

const CreateNewRole = () => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {};

    permissionsData.forEach((module) => {
      initialPermissions[module.module] = {
        checked: false,
        create: false,
        view: false,
        update: false,
        delete: false,
      };

      module.children.forEach((child) => {
        initialPermissions[child] = {
          checked: false,
          create: false,
          view: false,
          update: false,
          delete: false,
        };
      });
    });

    return initialPermissions;
  });

  const handleParentCheck = (moduleName, children, checked) => {
    setPermissions((previousPermissions) => {
      const updatedPermissions = {
        ...previousPermissions,
      };

      updatedPermissions[moduleName] = {
        checked,
        create: checked,
        view: checked,
        update: checked,
        delete: checked,
      };

      children.forEach((child) => {
        updatedPermissions[child] = {
          checked,
          create: checked,
          view: checked,
          update: checked,
          delete: checked,
        };
      });

      return updatedPermissions;
    });
  };

  const handleChildCheck = (moduleName, childName, children, checked) => {
    setPermissions((previousPermissions) => {
      const updatedPermissions = {
        ...previousPermissions,
      };

      updatedPermissions[childName] = {
        checked,
        create: checked,
        view: checked,
        update: checked,
        delete: checked,
      };

      const everyChildChecked = children.every((child) =>
        child === childName ? checked : updatedPermissions[child].checked,
      );

      updatedPermissions[moduleName] = {
        checked: everyChildChecked,
        create: everyChildChecked,
        view: everyChildChecked,
        update: everyChildChecked,
        delete: everyChildChecked,
      };

      return updatedPermissions;
    });
  };

  const handlePermissionChange = (itemName, permission, checked) => {
    setPermissions((previousPermissions) => {
      const updatedPermissions = {
        ...previousPermissions,
      };

      updatedPermissions[itemName] = {
        ...updatedPermissions[itemName],
        [permission]: checked,
      };

      updatedPermissions[itemName].checked = permissionTypes.every(
        (permissionType) => updatedPermissions[itemName][permissionType],
      );

      const module = permissionsData.find(
        (module) => module.module === itemName,
      );

      if (module) {
        module.children.forEach((child) => {
          updatedPermissions[child] = {
            ...updatedPermissions[child],
            [permission]: checked,
          };

          updatedPermissions[child].checked = permissionTypes.every(
            (permissionType) => updatedPermissions[child][permissionType],
          );
        });
      }

      permissionsData.forEach((module) => {
        if (module.children.includes(itemName)) {
          const everyChildChecked = module.children.every(
            (child) => updatedPermissions[child].checked,
          );

          updatedPermissions[module.module] = {
            checked: everyChildChecked,
            create: everyChildChecked,
            view: everyChildChecked,
            update: everyChildChecked,
            delete: everyChildChecked,
          };
        }
      });

      return updatedPermissions;
    });
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!roleName.trim()) {
      validationErrors.roleName = "Role Name is required.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const preparePayload = () => {
    return {
      roleName,
      description,
      permissions,
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = preparePayload();

      console.log(payload);

      // Replace with your API call
      /*
    const response = await axios.post(
      "/api/roles",
      payload
    );
    */

      alert("Role created successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="custom--btn ms-auto"
        >
          <MdOutlineKeyboardBackspace /> <span>Back</span>
        </button>
      </div>

      {/* Details Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Details</h2>
          <p className="mt-1 text-sm text-gray-500">
            Authors can manage and publish the content they created
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Role Name <span className="text-red-500">*</span>
            </label>

            <input
              value={roleName}
              onKeyDown={blockOnlyTextKeys}
              onChange={(e) => {
                const value = sanitizeOnlyText(e.target.value);

                setRoleName(value);

                if (errors.roleName) {
                  setErrors((prev) => ({
                    ...prev,
                    roleName: "",
                  }));
                }
              }}
              placeholder="Role Name"
              className="custom--input w-full"
            />

            {errors.roleName && (
              <p className="mt-1 text-sm text-red-500">{errors.roleName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <input
              value={description}
              onKeyDown={blockOnlyTextKeys}
              onChange={(e) => setDescription(sanitizeOnlyText(e.target.value))}
              placeholder="Description"
              className="custom--input w-full"
            />
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <div className="pb-6">
          <h2 className="text-lg font-semibold">Permissions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define actions users are allowed to perform
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-80 border px-4 py-4 text-left font-semibold">
                  Module
                </th>

                <th className="w-32 border px-4 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <FiPlus /> <span>Create</span>
                  </div>
                </th>

                <th className="w-32 border px-4 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <FiEye /> <span>View</span>
                  </div>
                </th>

                <th className="w-32 border px-4 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <FiEdit /> <span>Update</span>
                  </div>
                </th>

                <th className="w-32 border px-4 py-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <FiTrash2 /> <span>Delete</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {permissionsData.map((item, index) => (
                <>
                  {/* Parent Module */}
                  <tr
                    key={item.module}
                    className="border-b bg-white hover:bg-gray-50"
                  >
                    <td className="border px-4 py-4 font-semibold">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={permissions[item.module].checked}
                          onChange={(event) =>
                            handleParentCheck(
                              item.module,
                              item.children,
                              event.target.checked,
                            )
                          }
                        />
                        {item.module}
                      </div>
                    </td>

                    {["create", "view", "update", "delete"].map(
                      (permission) => (
                        <td
                          key={permission}
                          className="border px-4 py-4 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[item.module][permission]}
                            onChange={(event) =>
                              handlePermissionChange(
                                item.module,
                                permission,
                                event.target.checked,
                              )
                            }
                          />
                        </td>
                      ),
                    )}
                  </tr>

                  {/* Child Modules */}
                  {item.children.map((child) => (
                    <tr key={child} className="border-b hover:bg-gray-50">
                      <td className="border px-2 py-3">
                        <div className="ml-5 flex items-center gap-3 text-gray-600">
                          <input
                            type="checkbox"
                            checked={permissions[child].checked}
                            onChange={(event) =>
                              handleChildCheck(
                                item.module,
                                child,
                                item.children,
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-sm">{child}</span>
                        </div>
                      </td>

                      {["create", "view", "update", "delete"].map(
                        (permission) => (
                          <td
                            key={permission}
                            className="border px-4 py-4 text-center"
                          >
                            <input
                              type="checkbox"
                              checked={permissions[child][permission]}
                              onChange={(event) =>
                                handlePermissionChange(
                                  child,
                                  permission,
                                  event.target.checked,
                                )
                              }
                            />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="custom--btn"
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default CreateNewRole;
