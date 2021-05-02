import React, { useState, useEffect } from "react";

const mapRoomIndexToParticipant = i => ({ identity }) => ({ identity, i });
const mapParticipantToRooms = rooms =>
  rooms
    .map(({ participants }, i) =>
      participants.map(mapRoomIndexToParticipant(i))
    )
    .flat(1)
    .reduce((map, p) => ({ ...map, [p.identity]: p.i }), {});

export const useParticipantRoomMap = rooms => {
  const [participantRoomMap, setParticipantRoomMap] = useState({});

  useEffect(() => {
    setParticipantRoomMap(mapParticipantToRooms(rooms));
  }, [rooms]);

  return [participantRoomMap];
};
