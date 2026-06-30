export const customStyles = {
  control: (base, state) => {
    const isMobile = window.innerWidth < 640; // Example: Tailwind's sm breakpoint

    return {
      ...base,
      borderColor: state.isFocused ? "black" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      "&:hover": {
        borderColor: "black",
      },
      minHeight: isMobile ? "36px" : "40px",
      fontSize: isMobile ? "13px" : "14px",
      borderRadius: "5px",
      paddingLeft: isMobile ? "2px" : "3px",
      // zIndex: 2,
    };
  },
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#000000",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
    fontSize: window.innerWidth < 640 ? "12px" : "14px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#666",
    ":hover": {
      backgroundColor: "#000000",
      color: "black",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#000000" : "#ffffff",
    color: state.isFocused ? "#ffffff" : "#000000",
    cursor: "pointer",
    fontSize: window.innerWidth < 640 ? "13px" : "14px",
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 0, // Remove padding
    cursor: "pointer", // Make sure the clear button is clickable
    // "&:hover": {
    //   backgroundColor: "#e0e0e0", // Optional: Add a hover effect for the clear button
    // },
  }),
};

export const formatRole = (role) => {
  if (!role) return '';
  return role
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatCapitalText(status){
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export function formatStatus(status) {
  if (!status) return '';

  // Replace underscores with spaces, split into words
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatWithTimeDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const day = date.toLocaleString('en-GB', { day: '2-digit' });
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${day} ${month}, ${year}, ${time.toLowerCase()}`;
}