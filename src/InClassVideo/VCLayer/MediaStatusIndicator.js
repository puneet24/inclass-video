import React from "react";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideoCamOffIcon from "@material-ui/icons/VideocamOff";
import s from "./MediaStatusIndicator.module.scss";

const MediaStatusIndicator = ({ isAudioOn, isVideoOn }) => {
  return (
    <div className={s.iconContainer}>
      {!isVideoOn && <VideoCamOffIcon fontSize={"small"} />}
      {!isAudioOn && <MicOffIcon className={"ml-1"} fontSize={"small"} />}
    </div>
  );
};

export default MediaStatusIndicator;
