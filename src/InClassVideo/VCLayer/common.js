import { get as _get, merge as _merge } from "lodash";
import { LocalVideoTrack, createLocalVideoTrack } from "twilio-video";
import {
  getParticipantInfoById,
  getLoggedInUser,
  getClassInterfacingDetails
} from "../helpers/utils";
import moment from "moment";

/*
 ** Type: {type: "COMMAND:MUTE", payload: { identities , operation: {  } }, ty, resolver }
 */
let currentRequest = null;
let room = { particpants: {} };
let roomObj = null;

export const mapPubsToTracks = trackMap =>
  trackMap
    ? Array.from(trackMap.values())
        .map(({ track }) => track)
        .filter(track => track !== null)
    : [];

export const getRoomVideosTracks = room =>
  [
    ...mapPubsToTracks(room.localParticipant.videoTracks),
    ...[...room.participants.values()].map(({ videoTracks }) =>
      mapPubsToTracks(videoTracks)
    )
  ].flat(1);

export const updateRequest = request => {
  if (currentRequest && currentRequest.clear) {
    currentRequest.clear();
  }
  currentRequest = request;
  if (currentRequest && currentRequest.resolver) {
    resolveRequest({ type: currentRequest.type });
    //currentRequest.resolver(currentRequest, {});
  }
};

export const updateRoomObj = roomParam => {
  roomObj = roomParam;
};

export const resolveRequest = obj => {
  if (currentRequest && currentRequest.type === obj.type) {
    const resolverStatus = currentRequest.resolver(currentRequest, obj);
    if (resolverStatus) {
      currentRequest.resolverSuccessCallback();
      currentRequest = null;
    }
  }
};

export const updateRoom = requestObj => {
  room = _merge(room, requestObj);
};

export const getRoom = () => {
  return room;
};

/* Twilio/Generic Helper Methods */

export const getLocalParticipantInfo = room => {
  return room && room.localParticipant
    ? getParticipantInfoById(room.localParticipant.identity)
    : {};
};

export const getTrackByType = (t, tracks) =>
  tracks.filter(
    ({ name }) =>
      (t === "webcam" && name !== "screen") ||
      (t === "screen" && name === "screen")
  )[0];

export const findTeacherParticipant = roomParam => {
  const participants = [...roomParam.participants.values()];
  const identities = participants.map(({ identity }) => identity);
  const infos = identities.map(getParticipantInfoById);
  const teacherI = infos.findIndex(({ isTeacher }) => isTeacher);
  return infos[teacherI];
};

export const getParticipantCommunicationState = ({ identity }) => {
  let state = { isScreenOn: false, isAudioOn: false, isVideoOn: false };
  let participant = null;
  participant = getRoomParticipant({ identity });
  if (participant) {
    const videoTracks = mapPubsToTracks(participant.videoTracks);
    const audioTracks = mapPubsToTracks(participant.audioTracks);
    const webcamTrack = getTrackByType("webcam", videoTracks);
    const screenTrack = getTrackByType("screen", videoTracks);
    if (webcamTrack) {
      state.isVideoOn = webcamTrack.isEnabled && !webcamTrack.isStopped;
    }
    if (screenTrack) {
      state.isScreenOn = screenTrack.isEnabled;
    }
    if (audioTracks && audioTracks.length > 0) {
      state.isAudioOn = audioTracks[0].isEnabled;
    }
  }
  return state;
};

export const getRoomParticipant = ({ identity }) => {
  let participant = null;
  if (roomObj) {
    if (roomObj.localParticipant.identity === identity) {
      participant = roomObj.localParticipant;
    } else if (roomObj.participants) {
      participant = [...roomObj.participants.values()].filter(
        p => p.identity === identity
      )[0];
    }
  }
  return participant;
};

export const getParticipantRTCInfo = ({ identity }, infoType) => {
  let result = null;
  let participant = getRoomParticipant({ identity });
  let tracks = [...participant.videoTracks.values()];
  let audioTracks = [...participant.audioTracks.values()];
  if (participant && tracks.length) {
    let videoPublication = tracks.filter(
      ({ track }) => track && track.name !== "screen"
    )[0];
    let screenPublication = tracks.filter(
      ({ track }) => track && track.name === "screen"
    )[0];
    let audioPublication = audioTracks.filter(
      track => track && track.kind === "audio"
    )[0];
    switch (infoType) {
      case "videoPublication":
        result = videoPublication;
        break;
      case "videoTrack":
        result = videoPublication ? videoPublication.track : null;
        break;
      case "screenPublication":
        result = screenPublication;
        break;
      case "screenTrack":
        result = screenPublication ? screenPublication.track : null;
        break;
      case "audioPublication":
        result = audioPublication;
        break;
      case "audioTrack":
        result = audioPublication ? audioPublication.track : null;
        break;
    }
  }
  return result;
};

export const stopParticipantTrack = trackType => {
  let identity = roomObj.localParticipant.identity;
  let participant = getRoomParticipant({ identity });
  if (participant) {
    let trackPublication = getParticipantRTCInfo(
      { identity },
      `${trackType}Publication`
    );
    if (trackPublication && trackPublication.track) {
      if (trackType === "audio") {
        trackPublication.track.disable();
      } else {
        trackPublication.track.stop();
        participant.unpublishTrack(trackPublication.track);
      }
    }
  }
};

export const startParticipantTrack = trackType => {
  let identity = roomObj.localParticipant.identity;
  let participant = getRoomParticipant({ identity });
  let track = null;

  let publishLocalTrack = () => {
    if (track) {
      participant
        .publishTrack(track)
        .then(() => {})
        .catch(err => {
          console.log(`publish ${trackType} track failure`, err);
        });
      if (track.addEventListener) {
        track.addEventListener("ended", () => {
          stopParticipantTrack(trackType);
        });
      } else {
        track.onended = () => {
          stopParticipantTrack(trackType);
        };
      }
    }
  };

  if (trackType === "screen") {
    navigator.mediaDevices
      .getDisplayMedia()
      .then(function(stream) {
        let trackParam = stream.getTracks()[0];
        track = new LocalVideoTrack(trackParam, {
          name: "screen"
        });
        publishLocalTrack();
      })
      .catch(err => {
        console.log(`create screen video track failure`, err);
      });
  } else if (trackType === "video") {
    createLocalVideoTrack()
      .then(localVideoTrack => {
        track = localVideoTrack;
        publishLocalTrack();
      })
      .catch(err => {
        console.log(`create local video track failure`, err);
      });
  } else {
    let trackPublication = getParticipantRTCInfo(
      { identity },
      `${trackType}Publication`
    );
    if (trackPublication && trackPublication.track) {
      trackPublication.track.enable();
    }
  }
};

export const attachParticipantTrack = (identity, ref, trackType) => {
  let participant = getRoomParticipant({ identity });
  if (participant) {
    let trackPublication = getParticipantRTCInfo(
      { identity },
      `${trackType}Publication`
    );
    if (trackPublication && trackPublication.track) {
      if (ref.current) {
        trackPublication.track.attach(ref.current);
      }
    }
  }
};

export const detachParticipantTrack = (identity, ref, trackType) => {
  let participant = getRoomParticipant({ identity });
  if (participant) {
    let trackPublication = getParticipantRTCInfo(
      { identity },
      `${trackType}Publication`
    );
    if (trackPublication && trackPublication.track) {
      //trackPublication.track.detach(ref.current);
      if (ref.current) {
        trackPublication.track.detach(ref.current);
      }
    }
  }
};

export const isLocalParticipant = ({ identity }) => {
  return (
    roomObj &&
    roomObj.localParticipant &&
    roomObj.localParticipant.identity === identity
  );
};

export const getLocalParticipantIdentity = () => {
  return roomObj && roomObj.localParticipant
    ? roomObj.localParticipant.identity
    : null;
};

export const getTotalTrackCount = participants => {
  let p = participants.map(getRoomParticipant);
  return p.reduce((total, c) => {
    return c ? total + [...c.videoTracks.values()].length : 0;
  }, 0);
};

// DO NOT ADD ANYTHING IN THIS FILE EXCEPT PURE FUNCTIONS

export const getParticipants = ({ participants }) => participants;
export const mapParticipants = a => a.map(getParticipants);
export const getIdentity = ({ identity }) => identity;
export const mapIdentity = a => a.map(getIdentity);
export const findIndexBy = (fn, a) => a.findIndex(i => fn(i));
export const findByIdentity = (i, a) =>
  a.find(({ identity }) => i === identity);

export const removeAt = (i, a) => [...a.slice(0, i), ...a.slice(i + 1)];
export const insertAt = (i, a, v) => [...a.slice(0, i), v, ...a.slice(i + 1)];
export const withIndex = (v, i) => ({ ...v, i });
export const mapWithIndex = a => a.map(withIndex);

export const getParticipantName = (name = "", isTeacher = false, suffix) =>
  name
    ? `${name} ${!suffix ? (isTeacher ? " (Teacher) " : " (Student) ") : ""}`
    : "WHJR-OPS";

export const getRoomName = i => {
  if (i === 0) {
    return "Main Room";
  } else if (i === 1) {
    return "Breakout Room";
  } else {
    return `${i + 1} Room`;
  }
};
