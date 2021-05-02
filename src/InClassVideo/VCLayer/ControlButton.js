import React from "react";

const getStyle = background => ({
  width: "32px",
  height: "32px",
  borderRadius: "21px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  cursor: "pointer",
  color: "#333",
  margin: "0 2px",
  backgroundColor: background ? background : "rgba(255, 255, 255, 0.8)"
});

export const ControlButton = ({ children, onClick, background }) => {
  const style = getStyle(background);

  return (
    <div style={style} onClick={onClick}>
      {children}
    </div>
  );
};
