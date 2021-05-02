import { OptionsSVGIcon } from "./OptionsSVGIcon";
import React, { useState } from "react";

export const ParticipantMenu = ({
  onMoveToRoom,
  currentRoomIndex,
  virtualRoomCount
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 3 }}>
      {opened ? (
        <>
          <div
            style={{
              boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
              background: "#fff",
              position: "absolute",
              top: "100%",
              right: 0,
              fontSize: "14px",
              userSelect: "none"
            }}
          >
            {new Array(virtualRoomCount)
              .fill(null)
              .map((v, i) => i)
              .filter(i => i !== currentRoomIndex)
              .map(i => {
                return (
                  <div
                    key={i}
                    style={{
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      onMoveToRoom(i - 1);
                    }}
                  >
                    {i === 0 ? "Move to main" : ""}
                    {i === 1 ? "Move to breakout" : ""}
                    {i > 1 ? `Move to ${i + 1} room` : ""}
                  </div>
                );
              })}
          </div>
        </>
      ) : (
        <></>
      )}
      <div
        onClick={() => {
          setOpened(!opened);
        }}
        style={{
          background: "rgba(73,73,73,0.3)",
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          cursor: "pointer"
        }}
      >
        <OptionsSVGIcon />
      </div>
    </div>
  );
};
