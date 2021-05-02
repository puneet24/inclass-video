import React, { useState } from "react";

import MediaStatusIndicator from "./MediaStatusIndicator";

import { UserPlaceholder } from "./UserPlaceholder";
import { MicButton } from "./MicButton";
import { ScreenButton } from "./ScreenButton";
import { PinButton } from "./PinButton";
import { BroadcastButton } from "./BroadcastButton";
import MicIcon from "@material-ui/icons/Mic";
import MicIconV2 from "./MicIconV2";

export const VideoOverlay = ({
  imageUrl = "",
  name = "",
  isVideoOn = false,
  isAudioOn = false,
  isScreenOn = false,
  isPinned = false,
  isBroadcasting = false,
  showMicBtn = false,
  showPinBtn = false,
  showScreenBtn = false,
  showBroadcastBtn = false,
  onPin,
  onScreen,
  onMic,
  onBroadcast,
  children,
  version = 1
}) => {
  const [mouseOver, setMouseOver] = useState(false);

  const styles = {
    videoOverlay: {
      backgroundColor: "rgba(0,0,0,1)",
      position: "relative",
      height: "100%",
      overflow: "hidden"
    },
    background: {
      backgroundColor: isVideoOn ? "transparent" : "rgba(0,0,0,1)",
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2
    },
    name: {
      padding: "3px 5px",
      color: "rgba(255,255,255,1)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: "12px",
      zIndex: 1
    },
    bottomOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      display: "flex",
      alignItems: "center",
      background: "rgba(0,0,0,0.3)",
      width: "100%"
    },
    buttons: {
      display: "flex"
    }
  };

  return (
    <div
      style={styles.videoOverlay}
      onMouseOver={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}
    >
      <div style={styles.background}>
        {version === 1 ? (
          <MediaStatusIndicator isVideoOn={isVideoOn} isAudioOn={isAudioOn} />
        ) : (
          <></>
        )}
        <UserPlaceholder url={imageUrl} show={!isVideoOn} name={name} />
        {mouseOver && (
          <div style={styles.buttons}>
            <MicButton onClick={onMic} on={isAudioOn} show={showMicBtn} />
            <ScreenButton
              onClick={onScreen}
              on={isScreenOn}
              show={showScreenBtn}
            />
            <PinButton onClick={onPin} on={isPinned} show={showPinBtn} />
            <BroadcastButton
              onClick={onBroadcast}
              on={isBroadcasting}
              show={showBroadcastBtn}
            />
          </div>
        )}
      </div>
      {children}
      <div style={styles.bottomOverlay}>
        {version === 2 ? <MicIconV2 isAudioOn={isAudioOn} /> : <></>}
        <div title={name} style={styles.name}>
          {name}
        </div>
      </div>
    </div>
  );
};
