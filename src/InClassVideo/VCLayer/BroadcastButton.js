import React from "react";
import { ControlButton } from "./ControlButton";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import DesktopAccessDisabledIcon from "@material-ui/icons/DesktopAccessDisabled";
import StopCastIcon from "@material-ui/icons/CancelPresentation";
import CastIcon from "@material-ui/icons/Cast";

export const BroadcastButton = function({ show, on, onClick }) {
  return (
    show && (
      <ControlButton onClick={onClick} background={on ? "#fc5a5a" : null}>
        <span style={{ position: "relative", bottom: "3px" }}>
          {on ? (
            <StopCastIcon fontSize="inherit" />
          ) : (
            <CastIcon fontSize="inherit" />
          )}
        </span>
      </ControlButton>
    )
  );
};
