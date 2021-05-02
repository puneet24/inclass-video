import React from "react";
import {
  SettingInstructionsHeader,
  SettingInstructionsSubHeader
} from "../Typo/SettingInstructions";

const CaptureClip = () => {
  return (
    <div className={"text-center w-50 m-auto"}>
      <SettingInstructionsHeader text={"Capture a short clip"} />
      <SettingInstructionsSubHeader
        text={
          "Record and play a short video sample of you talking so you can see how you'll look and sound. No one else will see this, and it's not saved anywhere."
        }
      />
    </div>
  );
};

export default CaptureClip;
