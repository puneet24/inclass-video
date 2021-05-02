import React, { useEffect, useRef } from "react";
import { VideoOverlay } from "./VideoOverlay";
import { ParticipantMenu } from "./ParticipantMenu";

const Participant = ({
  identity,
  containerStyles = {},
  showMicBtn = false,
  showPinBtn = false,
  showScreenBtn = false,
  showScreenBroadcastBtn = true,
  showWebcamBroadcastBtn = true,
  showTransparentLayer = false,
  showChangeRoomMenu = false,
  currentRoomIndex = 0,
  roomCount = 0,
  renderWebcam = true,
  renderScreen = false,
  isScreenPinned = false,
  isWebcamPinned = false,
  isScreenBroadcast = false,
  isWebcamBroadcast = false,
  isScreenOn = false,
  isWebcamOn = false,
  isAudioOn = false,
  name = "",
  imageUrl = "",
  version = 1,
  webcamTrack,
  screenTrack,
  audioTrack,
  onPin,
  onMic,
  onScreen,
  onBroadcast,
  onMoveToRoom,
  classNames = { webcamContainer: "", screenContainer: "", menuContainer: "" }
}) => {
  const videoRef = useRef();
  const audioRef = useRef();
  const screenRef = useRef();

  useEffect(() => {
    if (webcamTrack && videoRef.current) {
      webcamTrack.attach(videoRef.current);
      return () => {
        webcamTrack.detach(videoRef.current);
      };
    }
  }, [webcamTrack, isWebcamOn]);

  useEffect(() => {
    if (screenTrack && screenRef.current) {
      screenTrack.attach(screenRef.current);
      return () => {
        screenTrack.detach(screenRef.current);
      };
    }
  }, [screenTrack, isScreenOn]);

  useEffect(() => {
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach(audioRef.current);
      };
    }
  }, [audioTrack, isAudioOn]);

  const onScreenPinClick = () => {
    onPin(isScreenPinned ? null : { identity, track: "screen" });
  };

  const onWebcamPinClick = () => {
    onPin(isWebcamPinned ? null : { identity, track: "webcam" });
  };

  const onMicClick = () => {
    onMic({ identity, isAudioOn });
  };

  const onScreenClick = () => {
    onScreen({ identity, isScreenOn });
  };

  const onScreenBroadcast = () => {
    onBroadcast(isScreenBroadcast ? null : { identity, track: "screen" });
  };

  const onWebcamBroadcast = () => {
    onBroadcast(isWebcamBroadcast ? null : { identity, track: "webcam" });
  };

  const styles = {
    screenContainer: {
      display: renderScreen ? "block" : "none",
      position: "relative",
      height: "100%",
      overflow: "hidden",
      border: "2px solid #000",
      borderRadius: version === 1 ? "0" : "14px",
      ...containerStyles
    },
    webcamContainer: {
      position: "relative",
      overflow: "hidden",
      height: "100%",
      border: "2px solid #000",
      borderRadius: version === 1 ? "0" : "14px"
    },
    transparentLayer: {
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex: 1,
      background: "rgba(0,0,0,0.5)"
    },
    menuContainer: {
      display: renderWebcam ? "inline-block" : "none",
      position: "relative",
      height: "100%",
      ...containerStyles
    },
    screenVideo: {
      display: "inline-block",
      transform: "translate(-50%,-50%)",
      top: "50%",
      left: "50%",
      position: "relative",
      objectFit: "contain",
      width: "100%",
      height: "100%"
    },
    webcamVideo: {
      display: "inline-block",
      transform: `translate(-50%,-50%) scaleX(-1)`,
      top: "50%",
      left: "50%",
      position: "relative",
      width: "100%",
      height: "100%"
    }
  };

  const onMoveToRoomClick = i => {
    onMoveToRoom(identity, i);
  };

  return (
    <>
      <div
        style={styles.screenContainer}
        className={classNames.screenContainer}
      >
        {showTransparentLayer && <div style={styles.transparentLayer} />}
        <VideoOverlay
          version={version}
          showMicBtn={false}
          showPinBtn={showPinBtn}
          showScreenBtn={false}
          showBroadcastBtn={showScreenBroadcastBtn}
          isBroadcasting={isScreenBroadcast}
          onBroadcast={onScreenBroadcast}
          isPinned={isScreenPinned}
          isVideoOn={isScreenOn}
          isScreenOn={isScreenOn}
          onPin={onScreenPinClick}
          onMic={() => {}}
          onScreen={onScreenClick}
          name={name}
        >
          <video style={styles.screenVideo} ref={screenRef} autoPlay={true} />
        </VideoOverlay>
      </div>
      <div style={styles.menuContainer} className={classNames.menuContainer}>
        {showChangeRoomMenu && (
          <ParticipantMenu
            currentRoomIndex={currentRoomIndex}
            virtualRoomCount={roomCount}
            onMoveToRoom={onMoveToRoomClick}
          />
        )}
        <div
          style={styles.webcamContainer}
          className={classNames.webcamContainer}
        >
          {showTransparentLayer && <div style={styles.transparentLayer} />}
          <VideoOverlay
            version={version}
            showPinBtn={showPinBtn}
            showMicBtn={showMicBtn}
            showScreenBtn={showScreenBtn}
            showBroadcastBtn={showWebcamBroadcastBtn}
            isBroadcasting={isWebcamBroadcast}
            onBroadcast={onWebcamBroadcast}
            isVideoOn={isWebcamOn}
            isAudioOn={isAudioOn}
            isScreenOn={isScreenOn}
            isPinned={isWebcamPinned}
            name={name}
            onPin={onWebcamPinClick}
            onMic={onMicClick}
            onScreen={onScreenClick}
            imageUrl={imageUrl}
          >
            <video style={styles.webcamVideo} ref={videoRef} autoPlay={true} />
          </VideoOverlay>
        </div>
      </div>
      <audio ref={audioRef} autoPlay={true} />
    </>
  );
};

export default Participant;
