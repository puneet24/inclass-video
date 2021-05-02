import React, { useEffect } from "react";
import { publish, subscribe } from "./PubSub";
import Participant from "./Participant";
//import * as SocketActions from "../../../../services/socket/actions";
import { VCEvents } from "./VcEvents";

import { LayoutOne } from "./layouts/LayoutOne";
import {
  startTrack,
  stopTrack,
  isLocalParticipant,
  isNotAudioTrack
} from "./twilio";
import { useTotalVideoTrackCount } from "./useTotalVideoTrackCount";
import { useParticipantTrackCount } from "./useParticipantTrackCount";
import { useRooms } from "./useRooms";
import { useCommunication } from "./useCommunication";
import { Widget } from "./layouts/Widget";
import { BigBox } from "./layouts/BigBox";
import { useBroadcast } from "./useBroadcast";
import { usePinAndWidget } from "./usePinAndWidget";
import { getParticipantName, updateRequest } from "./common";
import { useRoomParticipantTrackMap } from "./useRoomParticipantTrackMap";
import { useMuteEvent } from "./useMuteEvent";
import { useIntl } from "./../helpers/utils";
import { useScreenShareEvent } from "./useScreenShareEvent";

const roomStateEvents = [
  VCEvents.RECONNECTING,
  VCEvents.RECONNECTED,
  VCEvents.CONNECTED,
  VCEvents.DISCONNECTED
];

const Room = ({
  room,
  isFullScreen = false,
  isSlideshowOn = false,
  oneToOne = true,
  oneToTwo = false,
  oneToMany = false,
  userIsTeacher = false,
  disableBreakout = false,
  getIdentityInfo = () => {},
  setSnackbar,
  setBroadcastDialog,
  sendClassSessionEvent,
  playParticipantJoinSound,
  openDialog,
  updateRoomState,
  children
}) => {
  const intl = useIntl();

  const verifyTeacher = identity => {
    const info = getIdentityInfo(identity);
    return info && info.isTeacher;
  };

  const [
    rooms,
    moveToRoom,
    addRoom,
    removeRoom,
    participants,
    participantRoomMap,
    teacherIdentity
  ] = useRooms(
    room,
    participant => {
      sendClassSessionEvent({
        eventName: "participant-joined",
        actionParticipantIdentity: participant.identity,
        metaData: {
          networkQualityLevel: participant.networkQualityLevel,
          networkQualityStats: participant.networkQualityStats
        }
      });
      playParticipantJoinSound();
    },
    participant => {
      sendClassSessionEvent({
        eventName: "participant-removed",
        actionParticipantIdentity: participant.identity,
        metaData: {
          networkQualityLevel: participant.networkQualityLevel,
          networkQualityStats: participant.networkQualityStats
        }
      });
    },
    verifyTeacher
  );

  const [totalVideoTrackCount] = useTotalVideoTrackCount(room);
  const [participantVideoTrackCount] = useParticipantTrackCount(
    room,
    isNotAudioTrack
  );
  const [communication] = useCommunication(room);

  const [broadcast, sendBroadcast] = useBroadcast(null);
  const [pin, setPin, widget, setWidget] = usePinAndWidget(
    oneToOne,
    oneToTwo,
    oneToMany,
    userIsTeacher,
    participants,
    teacherIdentity,
    participantVideoTrackCount,
    isSlideshowOn,
    broadcast,
    totalVideoTrackCount,
    communication,
    getIdentityInfo
  );

  const [roomParticipantTrackMap] = useRoomParticipantTrackMap(room);

  useEffect(() => {
    updateRoomState(room.state);
    roomStateEvents.forEach(event =>
      room.on(event, () => {
        updateRoomState(room.state);
      })
    );
  }, [room]);

  useEffect(() => {
    if (broadcast) {
      setPin(broadcast);
    }
  }, [broadcast]);

  useEffect(() => {
    publish(
      VCEvents.LOCAL_COMMUNICATION_UPDATE,
      communication[room.localParticipant.identity]
    );
  }, [room.localParticipant.identity, communication]);

  useEffect(() => {
    const unsubScreenShareStart = subscribe(
      VCEvents.LOCAL_SCREENSHARE_START,
      () => {
        startTrack(
          "screen",
          room,
          () => {
            setSnackbar({
              message: `Your are sharing your screen`,
              open: true,
              variant: "info",
              disableClickAway: true,
              timeout: null
            });
          },
          () => {
            setSnackbar({
              open: false
            });
          }
        );
      }
    );
    const unsubScreenShareStop = subscribe(
      VCEvents.LOCAL_SCREENSHARE_STOP,
      () => {
        stopTrack("screen", room);
        setSnackbar({
          open: false
        });
      }
    );
    const unsubCamStart = subscribe(VCEvents.LOCAL_CAM_START, () => {
      startTrack("video", room);
    });
    const unsubCamStop = subscribe(VCEvents.LOCAL_CAM_STOP, () => {
      stopTrack("video", room);
    });
    const unsubAudioStart = subscribe(VCEvents.LOCAL_AUDIO_START, () => {
      startTrack("audio", room);
    });
    const unsubAudioStop = subscribe(VCEvents.LOCAL_AUDIO_STOP, () => {
      stopTrack("audio", room);
    });

    return () => {
      unsubScreenShareStart();
      unsubScreenShareStop();
      unsubCamStart();
      unsubCamStop();
      unsubAudioStart();
      unsubAudioStop();
    };
  }, [room]);

  useEffect(() => {
    const unsubShow = subscribe(VCEvents.LOCAL_VIDEO_WIDGET_SHOW, () => {
      setWidget(true);
    });
    const unsubHide = subscribe(VCEvents.LOCAL_VIDEO_WIDGET_HIDE, () => {
      setWidget(false);
    });
    return () => {
      unsubShow();
      unsubHide();
    };
  }, []);

  useEffect(() => {
    publish(VCEvents.REAL_TIME_ROOMS_UPDATE, rooms);
    return subscribe(VCEvents.REAL_TIME_ROOMS_DATA, () => {
      publish(VCEvents.REAL_TIME_ROOMS_UPDATE, rooms);
    });
  }, [rooms]);

  useEffect(() => {
    const giveMeUpdateUnsub = subscribe(
      VCEvents.PARTICIPANTS_GIVE_ME_UPDATE,
      () => {
        publish(VCEvents.PARTICIPANTS_UPDATE, participants);
      }
    );
    publish(VCEvents.PARTICIPANTS_UPDATE, participants);
    return giveMeUpdateUnsub;
  }, [participants]);

  useMuteEvent(
    ({ target, payload }) => {
      if (
        (target === "*" || target === room.localParticipant.identity) &&
        payload &&
        payload.state
      ) {
        if (payload.state.isMuteOperation) {
          publish(VCEvents.LOCAL_AUDIO_STOP);
        } else {
          publish(VCEvents.LOCAL_AUDIO_START);
        }
        const operation = payload.state.isMuteOperation ? "muted" : "un-muted";
        setSnackbar({
          message: `Teacher ${operation} you.`,
          open: true,
          variant: "info",
          disableClickAway: false,
          timeout: 2000
        });
      }
    },
    [room]
  );

  useScreenShareEvent(
    ({ target, payload }) => {
      if (target === room.localParticipant.identity) {
        if (payload && payload.state && payload.state.isScreenOn) {
          openDialog({
            title: "Stop Screen Sharing",
            content: (
              <div>Teacher has requested you to stop sharing screen </div>
            ),
            onConfirm: () => {
              publish(VCEvents.LOCAL_SCREENSHARE_STOP, null);
            }
          });
        } else {
          openDialog({
            title: "Screen Sharing",
            content: <div>Teacher has requested to share your screen</div>,
            onConfirm: () => {
              publish(VCEvents.LOCAL_SCREENSHARE_START, null);
            }
          });
        }
      }
    },
    [room]
  );

  const onPin = v => {
    if (broadcast) {
      if (v) {
        setBroadcastDialog({
          message: intl.formatMessage({
            id:
              "inClass.PINNING_THIS_VIDEO_WILL_STOP_THE_ONGOING_BROADCAST._ARE_YOU_SURE_YOU_WANT_TO_CONTINUE?",
            defaultMessage:
              "Pinning this video will stop the ongoing broadcast. Are you sure you want to continue?"
          }),
          open: true,
          onConfirm: () => {
            setPin(v);
            sendBroadcast(null);
          }
        });
      } else {
        setBroadcastDialog({
          message: intl.formatMessage({
            id:
              "inClass.UNPINNING_THIS_VIDEO_WILL_STOP_THE_ONGOING_BROADCAST._ARE_YOU_SURE_YOU_WANT_TO_UNPIN?",
            defaultMessage:
              "Unpinning the video will stop the broadcast. Are you sure you want to unpin?"
          }),
          open: true,
          onConfirm: () => {
            setPin(null);
            sendBroadcast(null);
          }
        });
      }
    } else {
      setPin(v);
    }
  };

  const onBroadcast = v => {
    sendBroadcast(v);
  };

  const onMic = ({ identity, isAudioOn }) => {
    if (userIsTeacher) {
      const info = getIdentityInfo(identity);
      setSnackbar({
        message: `You have requested to ${isAudioOn ? "mute" : "un-mute"} ${
          info.name
        }.`,
        open: true,
        variant: "info",
        disableClickAway: false,
        timeout: 2000
      });
      const failTimeout = setTimeout(() => {
        setSnackbar({
          message: `${info.name} could not be ${
            isAudioOn ? "muted" : "un-muted"
          }.`,
          open: true,
          variant: "error",
          disableClickAway: false,
          timeout: 2000
        });
      }, 3000);

      updateRequest({
        type: "COMMAND:MUTE",
        payload: {
          identities: { [identity]: !isAudioOn }
        },
        resolverSuccessCallback: () => {
          if (failTimeout) {
            clearTimeout(failTimeout);
          }
          setSnackbar({
            message: `${info.name} was ${
              isAudioOn ? "muted" : "un-muted"
            } successfully.`,
            open: true,
            variant: "success",
            disableClickAway: false,
            timeout: 2000
          });
        },
        resolver: request => {
          if (request && request.type === "COMMAND:MUTE") {
            return Object.values(request.payload.identities).includes(
              !isAudioOn
            );
          }
        }
      });

      //SocketActions.muteStudent(identity, isAudioOn);
    }
  };

  const onScreen = ({ identity, isScreenOn }) => {
    if (userIsTeacher && !isScreenOn) {
      const info = getIdentityInfo(identity);
      setSnackbar({
        message: `You have requested ${info.name} to share screen.`,
        open: true,
        variant: "info",
        disableClickAway: false,
        timeout: 2000
      });
      //SocketActions.requestScreenShare(identity, isScreenOn);
    }
  };

  const getParticipant = ({
    participant,
    containerStyles = {},
    usedForPin = false,
    forceAllowUnpin = false,
    classNames = { webcamContainer: "", screenContainer: "", menuContainer: "" }
  }) => {
    const { identity } = participant || {};
    const info = getIdentityInfo(identity);
    const name = getParticipantName(info.name, info.isTeacher, true);
    const showMicBtn =
      userIsTeacher && room.localParticipant.identity !== identity;
    const showPinBtn =
      !oneToOne && userIsTeacher && (!usedForPin || forceAllowUnpin);
    const showScreenBtn =
      userIsTeacher && room.localParticipant.identity !== identity;
    const showScreenBroadcastBtn =
      !oneToOne &&
      userIsTeacher &&
      pin &&
      pin.identity === identity &&
      pin.track === "screen";
    const showWebcamBroadcastBtn =
      !oneToOne &&
      userIsTeacher &&
      pin &&
      pin.identity === identity &&
      pin.track === "webcam";
    const showChangeRoomMenu = userIsTeacher && oneToMany;
    const renderWebcam = pin
      ? pin.identity !== identity ||
        (usedForPin
          ? pin.identity === identity && pin.track === "webcam"
          : pin.identity === identity && pin.track !== "webcam")
      : true;
    const renderScreen =
      communication[identity] &&
      communication[identity].isScreenOn &&
      ((userIsTeacher &&
        identity !== room.localParticipant.identity &&
        (pin
          ? pin.identity !== identity ||
            (usedForPin
              ? pin.identity === identity && pin.track === "screen"
              : pin.identity === identity && pin.track !== "screen")
          : true)) ||
        (!userIsTeacher &&
          usedForPin &&
          pin &&
          pin.identity === identity &&
          pin.track === "screen"));
    const isScreenPinned =
      pin && pin.identity === identity && pin.track === "screen";
    const isWebcamPinned =
      pin && pin.identity === identity && pin.track === "webcam";
    const isScreenBroadcast =
      broadcast &&
      broadcast.identity === identity &&
      broadcast.track === "screen";
    const isWebcamBroadcast =
      broadcast &&
      broadcast.identity === identity &&
      broadcast.track === "webcam";
    const isScreenOn =
      communication[identity] && communication[identity].isScreenOn;
    const isWebcamOn =
      communication[identity] && communication[identity].isWebcamOn;
    const isAudioOn =
      communication[identity] &&
      communication[identity].isAudioOn &&
      !isLocalParticipant(identity);
    const showTransparentLayer =
      participantRoomMap[identity] !==
      participantRoomMap[room.localParticipant.identity];
    return (
      <Participant
        identity={identity}
        containerStyles={containerStyles}
        showMicBtn={showMicBtn}
        showPinBtn={showPinBtn}
        showScreenBtn={showScreenBtn}
        showScreenBroadcastBtn={showScreenBroadcastBtn}
        showWebcamBroadcastBtn={showWebcamBroadcastBtn}
        showTransparentLayer={showTransparentLayer}
        showChangeRoomMenu={showChangeRoomMenu}
        currentRoomIndex={participantRoomMap[identity]}
        roomCount={rooms.length}
        renderWebcam={renderWebcam}
        renderScreen={renderScreen}
        isScreenPinned={isScreenPinned}
        isWebcamPinned={isWebcamPinned}
        isScreenBroadcast={isScreenBroadcast}
        isWebcamBroadcast={isWebcamBroadcast}
        isScreenOn={isScreenOn}
        isWebcamOn={isWebcamOn}
        isAudioOn={isAudioOn}
        version={userIsTeacher ? 1 : 2}
        webcamTrack={
          roomParticipantTrackMap[identity]
            ? roomParticipantTrackMap[identity].webcam
            : null
        }
        screenTrack={
          roomParticipantTrackMap[identity]
            ? roomParticipantTrackMap[identity].screen
            : null
        }
        audioTrack={
          roomParticipantTrackMap[identity]
            ? roomParticipantTrackMap[identity].audio
            : null
        }
        name={name}
        imageUrl={info.profileImageUrl}
        onPin={onPin}
        onMic={onMic}
        onScreen={onScreen}
        onBroadcast={onBroadcast}
        onMoveToRoom={moveToRoom}
        classNames={classNames}
      />
    );
  };

  const startLocalWebcam = () => {
    startTrack("webcam", room);
  };

  const stopLocalWebcam = () => {
    stopTrack("webcam", room);
  };

  const startLocalScreen = () => {
    startTrack("screen", room);
  };

  const stopLocalScreen = () => {
    stopTrack("screen", room);
  };

  const startLocalAudio = () => {
    startTrack("audio", room);
  };

  const stopLocalAudio = () => {
    stopTrack("audio", room);
  };

  return (
    <>
      {children ? (
        children(
          rooms,
          pin,
          teacherIdentity,
          getParticipant,
          communication[room.localParticipant.identity],
          startLocalWebcam,
          stopLocalWebcam,
          startLocalScreen,
          stopLocalScreen,
          startLocalAudio,
          stopLocalAudio
        )
      ) : oneToMany && userIsTeacher && !widget ? (
        <>
          <LayoutOne
            disableBreakout={disableBreakout}
            videoCountPerRow={isFullScreen ? 3 : 2}
            rooms={rooms}
            getParticipant={getParticipant}
            removeRoom={removeRoom}
            addRoom={addRoom}
          />
        </>
      ) : (
        <>
          <>
            <BigBox pin={pin} getParticipant={getParticipant} />
            <Widget
              participantCount={participants.length}
              rooms={rooms}
              getParticipant={getParticipant}
            />
          </>
        </>
      )}
    </>
  );
};

export default Room;
