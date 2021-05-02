import React from "react";
import { ControlButton } from "./ControlButton";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import DesktopAccessDisabledIcon from "@material-ui/icons/DesktopAccessDisabled";
import { UnpinSVGIcon } from "./UnPinSVGIcon";
import { PinSVGIcon } from "./PinSVGIcon";

export const PinButton = function({ show, on, onClick }) {
  return show ? (
    <ControlButton onClick={onClick} background={on ? "#33b5e5" : null}>
      <span>{on ? <UnpinSVGIcon /> : <PinSVGIcon />}</span>
    </ControlButton>
  ) : (
    <></>
  );
};
