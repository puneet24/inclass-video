import React, { useEffect, useState } from "react";

export const useCommunication = room => {
  const [communication, setCommunication] = useState({});

  useEffect(() => {
    setCommunication({
      [room.localParticipant.identity]: {
        isScreenOn: false,
        isWebcamOn: true,
        isAudioOn: true
      }
    });

    const onLocalTrackPublished = ({ track }) => {
      const identity = room.localParticipant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          ...(track.name === "screen"
            ? { isScreenOn: track.isEnabled }
            : { isWebcamOn: track.isEnabled })
        }
      }));
    };
    const onLocalTrackStopped = track => {
      const identity = room.localParticipant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          ...(track.name === "screen"
            ? { isScreenOn: !track.isStopped }
            : { isWebcamOn: !track.isStopped })
        }
      }));
    };
    const onLocalTrackEnabled = track => {
      const identity = room.localParticipant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          isAudioOn: true
        }
      }));
    };
    const onLocalTrackDisabled = track => {
      const identity = room.localParticipant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          isAudioOn: false
        }
      }));
    };
    const onTrackSubscribed = (track, publication, participant) => {};
    const onTrackStarted = (track, participant) => {
      const identity = participant.identity;
      setCommunication(communication => {
        return {
          ...communication,
          [identity]: {
            ...communication[identity],
            ...(track.name === "screen" ? { isScreenOn: track.isEnabled } : {}),
            ...(track.kind === "audio"
              ? { isAudioOn: track.isEnabled }
              : { isWebcamOn: track.isEnabled })
          }
        };
      });
    };
    const onTrackUnpublished = (publication, participant) => {
      const identity = participant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          ...(publication.trackName === "screen"
            ? { isScreenOn: publication.isSubscribed }
            : { isWebcamOn: publication.isSubscribed })
        }
      }));
    };
    const onTrackEnabled = (publication, participant) => {
      const identity = participant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          isAudioOn: true
        }
      }));
    };
    const onTrackDisabled = (publication, participant) => {
      const identity = participant.identity;
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          ...communication[identity],
          isAudioOn: false
        }
      }));
    };

    const participantConnected = ({ identity }) => {
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          isWebcamOn: false,
          isScreenOn: false,
          isAudioOn: false
        }
      }));
    };

    const participantDisconnected = ({ identity }) => {
      setCommunication(communication => ({
        ...communication,
        [identity]: {
          isWebcamOn: false,
          isScreenOn: false,
          isAudioOn: false
        }
      }));
    };

    room.localParticipant.on("trackPublished", onLocalTrackPublished);
    room.localParticipant.on("trackStopped", onLocalTrackStopped);
    room.localParticipant.on("trackEnabled", onLocalTrackEnabled);
    room.localParticipant.on("trackDisabled", onLocalTrackDisabled);
    room.on("trackSubscribed", onTrackSubscribed);
    room.on("trackStarted", onTrackStarted);
    room.on("trackUnpublished", onTrackUnpublished);
    room.on("trackEnabled", onTrackEnabled);
    room.on("trackDisabled", onTrackDisabled);
    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);

    return () => {
      room.localParticipant.off("trackPublished", onLocalTrackPublished);
      room.localParticipant.off("trackStopped", onLocalTrackStopped);
      room.localParticipant.off("trackEnabled", onLocalTrackEnabled);
      room.localParticipant.off("trackDisabled", onLocalTrackDisabled);
      room.off("trackSubscribed", onTrackSubscribed);
      room.off("trackStarted", onTrackStarted);
      room.off("trackUnpublished", onTrackUnpublished);
      room.off("trackEnabled", onTrackEnabled);
      room.off("trackDisabled", onTrackDisabled);
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  return [communication];
};
