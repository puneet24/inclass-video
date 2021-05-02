import React from "react";

const styles = {
  button: {
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer"
  },
  label: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "16px",
    color: "#FFFFFF",
    margin: "0 10px 0 0"
  }
};

export const CreateBreakoutRoom = ({ onClick }) => {
  return (
    <div style={styles.button} onClick={onClick}>
      <span style={styles.label}>Create Breakout Room</span>
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12.8477" cy="12" r="12" fill="#FB7A27" />
        <path d="M12.8535 7V17" stroke="white" strokeWidth="1.5" />
        <path d="M7.84766 12H17.8477" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
