import React, { Fragment } from "react";
import { getRoomName, mapWithIndex } from "../common";
import { CreateBreakoutRoom } from "./CreateBreakoutRoom";
import { CloseRoom } from "./CloseRoom";

const styles = {
  layout: {
    background: "#000000",
    width: "100%",
    height: "100%",
    position: "relative",
    overflowY: "auto",
    padding: "23px"
  },
  addRoom: {
    border: "none",
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  room: {
    margin: "0 0 32px 0"
  },
  header: {
    backgroundColor: "rgba(0,0,0,1)",
    padding: "0 10px",
    fontWeight: "bold",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    margin: "0 0 13px 0"
  },
  roomName: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "16px"
  },
  roomContent: {
    minHeight: "200px",
    width: "100%",
    backgroundColor: "rgba(0,0,0,1)",
    flexWrap: "wrap",
    display: "flex"
  }
};

export const LayoutOne = ({
  rooms = [],
  videoCountPerRow = 2,
  removeRoom,
  addRoom,
  disableBreakout = false,
  getParticipant
}) => {
  const closeRoom = i => {
    i && removeRoom(i - 1);
  };

  return (
    <>
      <div style={styles.layout}>
        {disableBreakout || rooms.length > 1 ? (
          <div style={{ height: "44px" }} />
        ) : (
          <div style={styles.addRoom}>
            <CreateBreakoutRoom onClick={addRoom} />
          </div>
        )}
        {mapWithIndex(rooms).map(room => {
          return (
            <div key={room.i} style={styles.room}>
              <div style={styles.header}>
                <div style={styles.roomName}>{getRoomName(room.i)}</div>
                {room.i !== 0 && (
                  <CloseRoom onClick={() => closeRoom(room.i)} />
                )}
              </div>
              <div style={styles.roomContent}>
                {room.participants.map(participant => (
                  <Fragment key={participant.identity}>
                    {getParticipant({
                      participant,
                      containerStyles: {
                        width: videoCountPerRow === 2 ? "50%" : "33.333%",
                        height: "200px"
                      },
                      usedForPin: false,
                      forceAllowUnpin: false
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
