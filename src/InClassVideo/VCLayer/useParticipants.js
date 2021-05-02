import { useEffect, useState } from "react";

export const useParticipants = (
  room,
  onConnect = () => {},
  onDisconnect = () => {}
) => {
  const [participants, setParticipants] = useState([]);

  const participantConnected = participant => {
    setParticipants(prev => [...prev, participant]);
    onConnect(participant);
  };

  const participantDisconnected = participant => {
    setParticipants(prev => prev.filter(p => p !== participant));
    onDisconnect(participant);
  };

  useEffect(() => {
    if (room) {
      setParticipants([room.localParticipant]);
      room.on("participantConnected", participantConnected);
      room.on("participantDisconnected", participantDisconnected);
      room.participants.forEach(participantConnected);
      return () => {
        room.off("participantConnected", participantConnected);
        room.off("participantDisconnected", participantDisconnected);
      };
    }
  }, [room]);

  return [participants];
};
