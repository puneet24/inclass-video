import React from "react";
import { ControlButton } from "./ControlButton";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import DesktopAccessDisabledIcon from "@material-ui/icons/DesktopAccessDisabled";

export const ScreenButton = function({ show, on, onClick }) {
  return show ? (
    <ControlButton onClick={onClick} background={on ? "#3DD598" : null}>
      {on ? (
        <DesktopWindowsIcon fontSize="inherit" />
      ) : (
        <DesktopAccessDisabledIcon fontSize="inherit" />
      )}
    </ControlButton>
  ) : (
    <></>
  );
};
