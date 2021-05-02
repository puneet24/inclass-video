import React from "react";
import { ControlButton } from "./ControlButton";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";

export const MicButton = function({ show, on, onClick }) {
  return show ? (
    <ControlButton onClick={onClick} background={on ? null : "#FC5A5A"}>
      {on ? <MicIcon fontSize="inherit" /> : <MicOffIcon fontSize="inherit" />}
    </ControlButton>
  ) : (
    <></>
  );
};
