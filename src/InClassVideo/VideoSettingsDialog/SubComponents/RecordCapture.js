import React from "react";
import {
  SettingInstructionsHeader,
  SettingInstructionsSubHeader
} from "../Typo/SettingInstructions";

const RecordCapture = () => {
  const [isRecording, setRecording] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setRecording(false);
    }, 7000);
  }, []);
  return (
    <div className={"text-center w-50 m-auto"}>
      <SettingInstructionsHeader text={"Capture a short clip"} />
      {isRecording && (
        <SettingInstructionsSubHeader text={isRecording ? "Recording" : ""} />
      )}
    </div>
  );
};

export default RecordCapture;
