import { useEffect, useState } from "react";
import { mapIdentity, mapParticipants } from "./common";
import { useVirtualRooms } from "./useVirtualRooms";
import { useParticipants } from "./useParticipants";
import { useTeacherIdentity } from "./useTeacherIdentity";
import { useParticipantRoomMap } from "./useParticipantRoomMap";

const getRealTimeRooms = (room, virtualRooms, participants) => {
  const identities = mapIdentity(mapParticipants(virtualRooms).flat(1));
  const mainRoomParticipants = participants
    .filter(({ identity }) => !identities.includes(identity))
    .map(({ identity }) => ({ identity }));
  return [
    { participants: mainRoomParticipants },
    ...virtualRooms.map(virtualRoom => ({
      ...virtualRoom,
      participants: virtualRoom.participants.filter(({ identity }) =>
        mapIdentity(participants).includes(identity)
      )
    }))
  ];
};

export const useRooms = (
  room,
  onParticipantConnect,
  onParticipantDisconnect,
  verifyTeacher
) => {
  const [rooms, setRooms] = useState([]);
  const [participants] = useParticipants(
    room,
    onParticipantConnect,
    onParticipantDisconnect
  );
  const [teacherIdentity] = useTeacherIdentity(room, verifyTeacher);

  const [virtualRooms, moveToRoom, addRoom, removeRoom] = useVirtualRooms(
    [],
    vrs => {
      setRooms(getRealTimeRooms(room, vrs, participants));
    }
  );

  const [participantRoomMap] = useParticipantRoomMap(rooms);

  useEffect(() => {
    setRooms(getRealTimeRooms(room, virtualRooms, participants));
  }, [room, participants, virtualRooms]);

  return [
    rooms,
    moveToRoom,
    addRoom,
    removeRoom,
    participants,
    participantRoomMap,
    teacherIdentity
  ];
};
