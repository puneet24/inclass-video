import React, { useState, useCallback, useEffect } from "react";
import Video from "twilio-video";
import Room from "./Room";
import Loader from "./../common/Loader";
import { publish } from "./PubSub";
import { RoomErrorModal } from "./RoomErrorModal";
import { VCEvents } from "./VcEvents";

const MediaDevices = ({ video = false, audio = false }) =>
  navigator.mediaDevices.getUserMedia({ video, audio });

const MEDIA_ERRORS = [
  "NotAllowedError",
  "NotFoundError",
  "NotReadableError",
  "OverconstrainedError",
  "TypeError"
];

const VideoChat = ({
  roomName,
  twilioToken,
  isFullScreen,
  sendClassSessionEvent,
  isSlideshowOn,
  oneToOne,
  oneToTwo,
  oneToMany,
  disableBreakout = false,
  userIsTeacher = false,
  getIdentityInfo,
  setSnackbar,
  setBroadcastDialog,
  playParticipantJoinSound,
  openDialog,
  children,
  updateRoomState
}) => {
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [roomConnectionError, setRoomConnectionError] = useState(null);

  useEffect(() => {
    if (twilioToken && roomName) {
      let cleanup = null;

      const handleMediaError = error => {
        /*sendClassSessionEvent({
          eventName: "client-error",
          metaData: {
            error: error.name,
            errorMessage: error.message,
            errorType: error.type ? error.type : "MEDIA",
            rawErrorMessage: error.rawMessage ? error.rawMessage : ""
          }
        });*/
        setRoomConnectionError({
          name: error.name,
          message: error.message
        });
      };

      const TwilioConnect = function(token, name, video = true, cleanup) {
        setConnecting(true);
        Video.connect(token, {
          name,
          video,
          audio: true,
          networkQuality: {
            local: 1, // LocalParticipant's Network Quality verbosity [1 - 3]
            remote: 2 // RemoteParticipants' Network Quality verbosity [0 - 3]
          }
        })
          .then(room => {
            setConnecting(true);
            setRoomConnectionError(null);
            room.localParticipant.setNetworkQualityConfiguration({
              local: 2,
              remote: 1
            });
            setRoom(room);
            publish(VCEvents.ROOM_CONNECTED, null);
            cleanup(() => {
              room.localParticipant.tracks.forEach(publication => {
                publication.track.stop();
              });
              room.disconnect();
            });
          })
          .catch(err => {
            setConnecting(false);
            console.error("Error in connecting room", err);
            if (err && MEDIA_ERRORS.includes(err.name)) {
              // Handle media error here.
              handleMediaError(err);
            } else {
              handleMediaError({
                name: err.name,
                message: "Error in connecting Room",
                type: "CUSTOM",
                rawMessage: err.message
              });
            }
          });
      };

      MediaDevices({ video: true })
        .then(() => {
          TwilioConnect(twilioToken, roomName, true, cn => {
            cleanup = cn;
          });
        })
        .catch(() => {
          TwilioConnect(twilioToken, roomName, false, cn => {
            cleanup = cn;
          });
        });
      return () => {
        cleanup && cleanup();
      };
    }
  }, [twilioToken, roomName]);

  const handleLogout = useCallback(() => {
    setRoom(prevRoom => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach(publication => {
          publication.track.stop();
        });
        prevRoom.disconnect();
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (room) {
      const tidyUp = event => {
        if (event.persisted) {
          return;
        }
        if (room) {
          handleLogout();
        }
      };
      window.addEventListener("pagehide", tidyUp);
      window.addEventListener("beforeunload", tidyUp);
      return () => {
        window.removeEventListener("pagehide", tidyUp);
        window.removeEventListener("beforeunload", tidyUp);
      };
    }
  }, [room, handleLogout]);

  return room ? (
    <Room
      room={room}
      disableBreakout={disableBreakout}
      handleLogout={handleLogout}
      isFullScreen={isFullScreen}
      sendClassSessionEvent={sendClassSessionEvent}
      isSlideshowOn={isSlideshowOn}
      oneToOne={oneToOne}
      oneToTwo={oneToTwo}
      oneToMany={oneToMany}
      getIdentityInfo={getIdentityInfo}
      userIsTeacher={userIsTeacher}
      setSnackbar={setSnackbar}
      setBroadcastDialog={setBroadcastDialog}
      playParticipantJoinSound={playParticipantJoinSound}
      openDialog={openDialog}
      updateRoomState={updateRoomState}
    >
      {children}
    </Room>
  ) : (
    <>
      {connecting ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          {roomConnectionError && (
            <RoomErrorModal errorInfo={roomConnectionError} />
          )}
        </>
      )}
    </>
  );
};

export default VideoChat;
