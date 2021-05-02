import React, { useState, useEffect } from "react";
import { mapIdentity } from "./common";

export const useTeacherIdentity = (room, verifyTeacher) => {
  const [teacherIdentity, setTeacherIdentity] = useState(null);

  useEffect(() => {
    if (room) {
      const participants = [
        room.localParticipant,
        ...room.participants.values()
      ];
      const identities = mapIdentity(participants);
      const ti = identities.find(identity => verifyTeacher(identity));

      setTeacherIdentity(ti ? ti : null);

      const participantConnected = ({ identity }) => {
        if (verifyTeacher(identity)) {
          setTeacherIdentity(identity);
        }
      };

      const participantDisconnected = ({ identity }) => {
        if (verifyTeacher(identity)) {
          setTeacherIdentity(null);
        }
      };

      room.on("participantConnected", participantConnected);
      room.on("participantDisconnected", participantDisconnected);
      return () => {
        room.off("participantConnected", participantConnected);
        room.off("participantDisconnected", participantDisconnected);
      };
    }
  }, [room, verifyTeacher]);

  return [teacherIdentity];
};
