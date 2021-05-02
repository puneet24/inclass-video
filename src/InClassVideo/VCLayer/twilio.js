import { createLocalVideoTrack, LocalVideoTrack } from "twilio-video";

import { mapIdentity } from "./common";

export const mapPubsToTracks = trackMap =>
  trackMap
    ? Array.from(trackMap.values())
        .map(({ track }) => track)
        .filter(track => track !== null && !track.isStopped)
    : [];

export const getRemoteParticipants = ({ participants }) => [
  ...participants.values()
];

export const getParticipantFromRoom = (identity, room) => {
  if (room) {
    if (room.localParticipant.identity === identity) {
      return room.localParticipant;
    } else if (room.participants) {
      return getRemoteParticipants(room).find(p => p.identity === identity);
    }
  } else {
    return null;
  }
};

export const getParticipantRTCInfo = (identity, room, type) => {
  let participant = getParticipantFromRoom(identity, room);
  let videoPublications = [...participant.videoTracks.values()];
  let audioPublications = [...participant.audioTracks.values()];
  if (participant) {
    let webcamTrack = videoPublications.find(
      ({ track }) => track && track.name !== "screen"
    );
    let screenTrack = videoPublications.find(
      ({ track }) => track && track.name === "screen"
    );
    let audioTrack = audioPublications.find(
      track => track && track.kind === "audio"
    );
    switch (type) {
      case "videoPublication":
        return webcamTrack;
      case "videoTrack":
        return webcamTrack ? webcamTrack.track : null;
      case "screenPublication":
        return screenTrack;
      case "screenTrack":
        return screenTrack ? screenTrack.track : null;
      case "audioPublication":
        return audioTrack;
      case "audioTrack":
        return audioTrack ? audioTrack.track : null;
    }
  }
  return null;
};

export const getTrackByType = (type, tracks) =>
  tracks.find(
    ({ name }) =>
      (type === "webcam" && name !== "screen") ||
      (type === "screen" && name === "screen")
  );

export const stopTrack = (type, room) => {
  let participant = getParticipantFromRoom(
    room.localParticipant.identity,
    room
  );
  if (participant) {
    let track = getParticipantRTCInfo(
      room.localParticipant.identity,
      room,
      `${type}Track`
    );
    if (track) {
      if (type === "audio") {
        track.disable();
      } else {
        track.stop();
        participant.unpublishTrack(track);
      }
    }
  }
};

export const startTrack = (
  type,
  room,
  onStartScreenshare,
  onStopScreenShare
) => {
  let participant = getParticipantFromRoom(
    room.localParticipant.identity,
    room
  );

  const stopLocalTrack = () => {
    stopTrack("screen", room);
    //publish(VCEvents.LOCAL_SCREENSHARE_STOP);
  };

  let publishLocalTrack = track => {
    if (track) {
      participant
        .publishTrack(track)
        .then(() => {})
        .catch(err => {});
      if (track && track.mediaStreamTrack) {
        if (track.mediaStreamTrack.addEventListener) {
          track.mediaStreamTrack.addEventListener("ended", stopLocalTrack);
        } else {
          track.mediaStreamTrack.onended = stopLocalTrack;
        }
      }
    }
  };

  switch (type) {
    case "screen":
      navigator.mediaDevices
        .getDisplayMedia()
        .then(function(stream) {
          publishLocalTrack(
            new LocalVideoTrack(stream.getTracks()[0], {
              name: "screen"
            })
          );
          stream.getVideoTracks()[0].onended = function() {
            onStopScreenShare && onStopScreenShare();
          };
          onStartScreenshare && onStartScreenshare();
        })
        .catch(err => {
          console.log(`create screen video track failure`, err);
        });
      break;
    case "video":
      createLocalVideoTrack()
        .then(track => {
          publishLocalTrack(track);
        })
        .catch(err => {
          console.log(`create local video track failure`, err);
        });
      break;
    default:
      let track = getParticipantRTCInfo(
        room.localParticipant.identity,
        room,
        `${type}Track`
      );
      if (track) {
        track.enable();
      }
      break;
  }
};

export const attachTrack = (identity, room, el, type) => {
  let participant = getParticipantFromRoom(identity, room);
  if (participant) {
    let track = getParticipantRTCInfo(identity, room, `${type}Track`);
    if (track && el) {
      //console.log("ATTACH",{participant,type,el});
      track.attach(el);
    }
  }
};

export const detachTrack = (identity, room, el, type) => {
  let participant = getParticipantFromRoom(identity, room);
  if (participant) {
    let track = getParticipantRTCInfo(identity, room, `${type}Track`);
    if (track && el) {
      //console.log("DETACH",{participant,type,el});
      track.detach(el);
    }
  }
};

export const isLocalParticipant = (identity, room) =>
  room && room.localParticipant && room.localParticipant.identity === identity;

export const getVideoTracksForIdentities = (identities, room) => {
  let tracks = identities.map(identity => {
    const participant = getParticipantFromRoom(identity, room);
    return participant ? [...participant.videoTracks.values()] : [];
  });
  return tracks.flat(1);
};

export const getRoomVideosTracks = room => {
  const localVideoTracks = mapPubsToTracks(room.localParticipant.videoTracks);
  const remoteParticipants = [...room.participants.values()];
  const getVideoTracks = ({ videoTracks }) => mapPubsToTracks(videoTracks);
  const remoteVideoTracks = remoteParticipants.map(getVideoTracks).flat(1);
  return [...localVideoTracks, ...remoteVideoTracks];
};

export const getParticipantCommunicationState = (identity, room) => {
  const participant = getParticipantFromRoom(identity, room);
  if (participant) {
    const videoTracks = mapPubsToTracks(participant.videoTracks);
    const audioTracks = mapPubsToTracks(participant.audioTracks);
    const webcamTrack = getTrackByType("webcam", videoTracks);
    const screenTrack = getTrackByType("screen", videoTracks);
    return {
      isScreenOn: !!(screenTrack && screenTrack.isEnabled),
      isAudioOn: !!(
        audioTracks &&
        audioTracks.length &&
        audioTracks[0].isEnabled
      ),
      isVideoOn: !!(webcamTrack && webcamTrack.isEnabled)
    };
  } else {
    return {
      isScreenOn: false,
      isAudioOn: false,
      isVideoOn: false
    };
  }
};

export const getParticipantVideoTrackCount = room => {
  const localVideoTracks = mapPubsToTracks(room.localParticipant.videoTracks);
  const remoteParticipants = [...room.participants.values()];
  const getVideoTrackCount = ({ identity, videoTracks }) => ({
    [identity]: mapPubsToTracks(videoTracks).length
  });
  const remoteVideoTracks = remoteParticipants
    .map(getVideoTrackCount)
    .reduce((a, v) => ({ ...a, ...v }), {});
  return {
    [room.localParticipant.identity]: localVideoTracks.length,
    ...remoteVideoTracks
  };
};

export const findRemoteParticipantBy = (room, fn) => {
  const participants = [...room.participants.values()];
  const identities = mapIdentity(participants);
  const i = identities.findIndex(fn);
  return i > -1 ? participants[i] : null;
};

export const isNotAudioTrack = ({ kind }) => kind !== "audio";
