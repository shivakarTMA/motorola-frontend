import { Tooltip as ReactTooltip } from "react-tooltip";
import React from "react";

const Tooltip = ({
  id,
  children,
  content,
  place = "top",
  html = false,
  bgColor = "#000",
  textColor = "#fff",
  width = "max-content"
}) => {
  return (
    <>
      <span data-tooltip-id={id} data-tooltip-html={html ? content : undefined} data-tooltip-content={!html ? content : undefined}>
        {children}
      </span>
      <ReactTooltip
        id={id}
        place={place}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          maxWidth: width,
          fontSize: "0.875rem", // text-sm
          padding: "0.5rem",
        }}
      />
    </>
  );
};

export default Tooltip;
