import React, { useState, useEffect } from "react";

export const useRoomParticipantTrackMap = room => {
  const [roomParticipantTrackMap, setRoomParticipantTrackMap] = useState({});

  useEffect(() => {
    const remoteParticipants = room.participants.values();
    const totalParticipants = [room.localParticipant, ...remoteParticipants];

    setRoomParticipantTrackMap(
      totalParticipants
        .map(participant => {
          const tracks = [...participant.tracks.values()]
            .map(({ track }) => track)
            .filter(v => v);

          const webcam = tracks.find(
            ({ kind, name }) => kind === "video" && name !== "screen"
          );
          const screen = tracks.find(
            ({ kind, name }) => kind === "video" && name === "screen"
          );
          const audio = tracks.find(({ kind }) => kind === "audio");

          return [
            participant.identity,
            {
              webcam: webcam ? webcam : null,
              screen: screen ? screen : null,
              audio: audio ? audio : null
            }
          ];
        })
        .reduce(
          (map, [identity, tracks]) => ({ ...map, [identity]: tracks }),
          {}
        )
    );

    const trackSubscribed = (track, publication, participant) => {
      setRoomParticipantTrackMap(roomParticipantTrackMap => ({
        ...roomParticipantTrackMap,
        [participant.identity]: {
          ...roomParticipantTrackMap[participant.identity],
          webcam:
            track.kind === "video" && track.name !== "screen"
              ? track
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].webcam
              : null,
          screen:
            track.kind === "video" && track.name === "screen"
              ? track
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].screen
              : null,
          audio:
            track.kind === "audio"
              ? track
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].audio
              : null
        }
      }));
    };

    const trackUnsubscribed = (track, publication, participant) => {
      setRoomParticipantTrackMap(roomParticipantTrackMap => ({
        ...roomParticipantTrackMap,
        [participant.identity]: {
          ...roomParticipantTrackMap[participant.identity],
          webcam:
            track.kind === "video" && track.name !== "screen"
              ? null
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].webcam
              : null,
          screen:
            track.kind === "video" && track.name === "screen"
              ? null
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].screen
              : null,
          audio:
            track.kind === "audio"
              ? null
              : roomParticipantTrackMap[participant.identity]
              ? roomParticipantTrackMap[participant.identity].audio
              : null
        }
      }));
    };

    const trackPublished = ({ track }) => {
      setRoomParticipantTrackMap(roomParticipantTrackMap => ({
        ...roomParticipantTrackMap,
        [room.localParticipant.identity]: {
          ...roomParticipantTrackMap[room.localParticipant.identity],
          webcam:
            track.kind === "video" && track.name !== "screen"
              ? track
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].webcam
              : null,
          screen:
            track.kind === "video" && track.name === "screen"
              ? track
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].screen
              : null,
          audio:
            track.kind === "audio"
              ? track
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].audio
              : null
        }
      }));
    };

    const trackStopped = track => {
      setRoomParticipantTrackMap(roomParticipantTrackMap => ({
        ...roomParticipantTrackMap,
        [room.localParticipant.identity]: {
          ...roomParticipantTrackMap[room.localParticipant.identity],
          webcam:
            track.kind === "video" && track.name !== "screen"
              ? null
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].webcam
              : null,
          screen:
            track.kind === "video" && track.name === "screen"
              ? null
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].screen
              : null,
          audio:
            track.kind === "audio"
              ? null
              : roomParticipantTrackMap[room.localParticipant.identity]
              ? roomParticipantTrackMap[room.localParticipant.identity].audio
              : null
        }
      }));
    };

    room.on("trackSubscribed", trackSubscribed);
    room.on("trackUnsubscribed", trackUnsubscribed);
    room.localParticipant.on("trackPublished", trackPublished);
    room.localParticipant.on("trackStopped", trackStopped);
    return () => {
      room.off("trackSubscribed", trackSubscribed);
      room.off("trackUnsubscribed", trackUnsubscribed);
      room.localParticipant.off("trackPublished", trackPublished);
      room.localParticipant.off("trackStopped", trackStopped);
    };
  }, [room]);

  return [roomParticipantTrackMap];
};
