import React from "react";
import MicOffIcon from "@material-ui/icons/MicOff";
import MicIcon from "@material-ui/icons/Mic";

const styles = {
  mediaStatus: {
    marginRight: "5px",
    color: "#fff",
    backgroundColor: " #0c8d0c",
    borderRadius: "50%",
    minWidth: "28px",
    height: "28px",
    fontSize: "16px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  isMuted: {
    backgroundColor: "#FC5A5A"
  }
};

const MicIconV2 = ({ isAudioOn }) => {
  return (
    <div
      style={{
        ...styles.mediaStatus,
        ...(isAudioOn ? {} : styles.isMuted)
      }}
    >
      {isAudioOn ? (
        <MicIcon fontSize="inherit" />
      ) : (
        <MicOffIcon fontSize="inherit" />
      )}
    </div>
  );
};

export default MicIconV2;
