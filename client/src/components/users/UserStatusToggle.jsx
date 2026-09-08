import React from "react";

function UserStatusToggle({
  isActive,
  onChange,
  disabled = false,
}) {
  const active = isActive === true;

  const trackStyle = {
    position: "relative",
    display: "inline-block",
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    padding: 0,
    cursor: disabled
      ? "not-allowed"
      : "pointer",
    backgroundColor: active
      ? "#22c55e"
      : "#c82014",
    opacity: disabled ? 0.6 : 1,
    transition:
      "background-color 0.2s ease",
    boxSizing: "border-box",
    verticalAlign: "middle",
    flexShrink: 0,
  };

  const thumbStyle = {
    position: "absolute",
    top: "2px",
    left: active
      ? "22px"
      : "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 1px 3px rgba(0, 0, 0, 0.3)",
    transition: "left 0.2s ease",
    display: "block",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={
        active
          ? "Deactivate user"
          : "Activate user"
      }
      disabled={disabled}
      onClick={onChange}
      style={trackStyle}
      title={
        active
          ? "Deactivate user"
          : "Activate user"
      }
    >
      <span style={thumbStyle} />
    </button>
  );
}

export default UserStatusToggle;