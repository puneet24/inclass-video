import React from "react";

const styles = {
  button: {
    color: "#fff",
    margin: "0 0 0 auto",
    fontSize: "12px",
    cursor: "pointer"
  },
  label: {
    margin: "0 12px 0 0"
  }
};

export const CloseRoom = ({ onClick }) => {
  return (
    <div style={styles.button} onClick={onClick}>
      <span style={styles.label}>Close</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0.847656 1L12.8477 13" stroke="white" strokeWidth="1.5" />
        <path d="M0.847656 13L12.8477 1" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
