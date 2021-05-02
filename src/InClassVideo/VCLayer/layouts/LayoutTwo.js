import React, { Fragment, useEffect, useState } from "react";
import { mapWithIndex, getRoomName } from "../common";
import TeacherNotJoined from "../../../../../components/Twilio/TeacherNotJoined";

const getRoomsWidth = (rooms, roomVideoTrackCount, maxTracksPerRoom) => {
  return mapWithIndex(rooms)
    .sort((a, b) => roomVideoTrackCount[a.i] - roomVideoTrackCount[b.i])
    .reduce(
      ({ r, n }, { i }) => {
        return {
          r: [
            ...r,
            {
              i,
              tc:
                roomVideoTrackCount[i] < maxTracksPerRoom + n
                  ? roomVideoTrackCount[i]
                  : maxTracksPerRoom + n
            }
          ],
          n:
            roomVideoTrackCount[i] < maxTracksPerRoom + n
              ? maxTracksPerRoom + n - roomVideoTrackCount[i]
              : 0
        };
      },
      { r: [], n: 0 }
    )
    .r.sort((a, b) => {
      return a.i - b.i;
    });
};

const getRoomVideoTrackCount = (
  rooms,
  pinnedParticipantRoom,
  participantVideoTrackCount
) =>
  rooms.map(({ participants }, i) =>
    participants.reduce(
      (sum, { identity }) =>
        sum + participantVideoTrackCount[identity] === 0
          ? 1
          : participantVideoTrackCount[identity],
      pinnedParticipantRoom === i ? -1 : 0
    )
  );

const styles = {
  layout: {
    height: "100%",
    position: "relative",
    width: "100%"
  },
  pinned: rowCount => ({
    height: `${100 - rowCount * 20}%`
  }),
  rooms: rowCount => ({
    height: `${rowCount * 20}%`,
    display: "flex",
    justifyContent: "center"
  }),
  room: width => ({
    width: `${width}%`,
    height: "100%",
    display: width ? "flex" : "none",
    flexDirection: "column"
  }),
  roomName: {
    backgroundColor: "rgba(0,0,0,1)",
    height: "32px",
    padding: "4px 10px",
    fontWeight: "bold",
    color: "#fff",
    display: "inline-block"
  },
  roomContent: height => ({
    height,
    backgroundColor: "rgba(0,0,0,1)",
    border: "3px solid rgba(0,0,0,1)",
    display: "flex",
    flexWrap: "wrap"
  })
};

export const LayoutTwo = ({
  showRoomNames = false,
  rooms = [],
  pin,
  getParticipant,
  participantVideoTrackCount,
  participantCount = 0,
  teacherIdentity = false,
  userIsTeacher = false,
  pinnedParticipantRoom = 0
}) => {
  const [rowCount, setRowCount] = useState(0);
  const [maxTracksPerRoom, setMaxTracksPerRoom] = useState(0);
  const [roomWidth, setRoomWidth] = useState([]);

  useEffect(() => {
    setRowCount(participantCount === 1 ? 0 : 1);
  }, [participantCount]);

  useEffect(() => {
    setMaxTracksPerRoom(Math.ceil(6 / rooms.length));
  }, [rooms]);

  useEffect(() => {
    const roomVideoTrackCount = getRoomVideoTrackCount(
      rooms,
      pinnedParticipantRoom,
      participantVideoTrackCount
    );
    setRoomWidth(getRoomsWidth(rooms, roomVideoTrackCount, maxTracksPerRoom));
  }, [rooms, participantVideoTrackCount, maxTracksPerRoom]);

  return (
    <>
      <div style={styles.layout}>
        <div style={styles.pinned(rowCount)}>
          {!userIsTeacher && !teacherIdentity ? (
            <TeacherNotJoined />
          ) : pin ? (
            getParticipant(pin, { width: "100%" }, true)
          ) : (
            <></>
          )}
        </div>
        <div style={styles.rooms(rowCount)}>
          {mapWithIndex(rooms).map(room => {
            return (
              <div
                style={styles.room(
                  ((roomWidth[room.i] ? roomWidth[room.i].tc : 1) / 6) * 100
                )}
                key={room.i}
              >
                {showRoomNames && (
                  <div style={styles.roomName}>{getRoomName(room.i)}</div>
                )}
                <div
                  style={styles.roomContent(
                    showRoomNames ? "calc(100% - 32px)" : "100%"
                  )}
                >
                  {room.participants.map(participant => (
                    <Fragment key={participant.identity}>
                      {getParticipant(participant, {
                        width: roomWidth[room.i]
                          ? `${100 / roomWidth[room.i].tc}%`
                          : "0"
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
