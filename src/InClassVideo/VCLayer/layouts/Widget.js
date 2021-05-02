import React, { useState, Fragment } from "react";
import { DragMe } from "../DragMe";
import { FullScreenIcon } from "./FullScreenIcon";
import { MinimizeIcon } from "./MinimizeIcon";
import { getRoomName, mapWithIndex } from "../common";

const styles = {
  layout: {
    width: "166px",
    position: "fixed",
    right: "10px",
    top: "10px",
    zIndex: 99999999
  },
  hide: {
    width: "19px",
    height: "37px",
    background: "#000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderTopLeftRadius: "4px",
    borderBottomLeftRadius: "4px",
    top: "15px",
    right: "100%",
    cursor: "pointer"
  },
  header: {
    background: "#262626",
    display: "flex",
    alignItems: "center",
    padding: "7px 8px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    overflow: "hidden",
    cursor: "move"
  },
  fillSpace: {
    flex: 1
  },
  headerIcon: {
    cursor: "pointer",
    margin: "0 0 0 20px",
    display: "inline-block"
  },
  roomHeader: i => ({
    background: "#000000",
    borderRadius: "4px",
    overflow: "hidden",
    ...(i === 0 ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : {})
  }),
  roomName: {
    backgroundColor: "rgba(0,0,0,1)",
    padding: "3px 6px 2px 6px",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "14px"
  },
  roomContent: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,1)",
    padding: "0 5px 5px 5px"
  },
  scroller: {
    maxHeight: "500px",
    overflowX: "auto"
  }
};

export const Widget = ({
  rooms = [],
  participantCount = 0,
  getParticipant
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      <DragMe show={participantCount > 1} style={styles.layout}>
        <div style={styles.header}>
          <div style={styles.fillSpace} />
          <div style={styles.headerIcon}>
            {isMinimized ? (
              <FullScreenIcon
                onClick={() => {
                  setIsMinimized(false);
                }}
              />
            ) : (
              <MinimizeIcon
                onClick={() => {
                  setIsMinimized(true);
                }}
              />
            )}
          </div>
        </div>
        <div style={{ display: isMinimized ? "none" : "block" }}>
          <div style={styles.scroller}>
            {mapWithIndex(rooms).map(room => (
              <div key={room.i}>
                <div style={styles.roomHeader(room.i)}>
                  {rooms.length > 1 ? (
                    <div style={styles.roomName}>{getRoomName(room.i)}</div>
                  ) : (
                    <></>
                  )}
                  <div style={styles.roomContent}>
                    {room.participants.map(participant => (
                      <Fragment key={participant.identity}>
                        {getParticipant({
                          participant,
                          containerStyles: { height: "100px" },
                          usedForPin: false,
                          forceAllowUnpin: false
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragMe>
    </>
  );
};
