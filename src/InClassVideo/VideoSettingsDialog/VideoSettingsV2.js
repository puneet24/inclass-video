import React, { useEffect, useState } from "react";
import DefaultDialog from "../../../../components/dialogs/DefaultDialog";
import useMediaIO from "../../../../customHooks/useMediaIO";
import s from "./VideoSettingsV2.module.scss";
import DeviceSelector from "./SubComponents/DeviceSelector";
import CaptureClip from "./SubComponents/CaptureClip";
import RecordCapture from "./SubComponents/RecordCapture";
import { SettingInstructionsConfirm } from "./Typo/SettingInstructions";
import _get from "lodash/get";
import {
  CAM_VIDEO_EL_ID,
  h__handleAudioOutput,
  h__handlePlayAudio,
  h__handleStreamInput,
  h__initPermissions,
  h__instructionCtaLabel,
  h__startRecord,
  RECORD_VIDEO_EL_ID
} from "./helpers";
import Button from "@material-ui/core/Button";

const SELECTIONS = [
  { kind: "videoinput", label: "Camera" },
  { kind: "audioinput", label: "Microphone" },
  { kind: "audiooutput", label: "Speaker", isSpeaker: true }
];

const INITIAL_STAGE = 0;

const VideoSettingsV2 = ({ selectedIOOptions, onCancel }) => {
  navigator.getUserMedia(
    { video: true },
    e => console.log(e),
    e => console.log(e)
  );
  const [blobSrc, setBlobSrc] = useState("");
  const [currentStageIndex, setStage] = useState(INITIAL_STAGE);
  const {
    videoInput,
    audioInput,
    audioOutput,
    selectedIO,
    handleChange
  } = useMediaIO(selectedIOOptions);
  const selectionMap = {
    videoinput: videoInput,
    audioinput: audioInput,
    audiooutput: audioOutput
  };
  const handleUpdate = (val, key) => {
    if (key === "audiooutput") {
      h__handleAudioOutput(val, key);
    } else {
      const audioSourceId =
        key === "audioinput"
          ? val
          : _get(selectedIO, "audioinput.deviceId", "");
      const videoSourceId =
        key === "videoinput"
          ? val
          : _get(selectedIO, "videoinput.deviceId", "");
      h__handleStreamInput(audioSourceId, videoSourceId);
    }
    handleChange(val);
  };
  useEffect(() => {
    h__initPermissions();
  }, []);
  useEffect(() => {
    if (selectedIO && Object.keys(selectedIO).length) {
      handleUpdate();
    }
  }, [selectedIO]);
  useEffect(() => {
    if (currentStageIndex === 2) {
      h__startRecord(
        _get(selectedIO, "audioinput.deviceId", ""),
        _get(selectedIO, "videoinput.deviceId", ""),
        data => setBlobSrc(data)
      );
    }
  }, [currentStageIndex]);

  const handleStageScreen = () => {
    const upcomingStage = currentStageIndex + 1;
    if (!currentStageIndex) {
      setStage(upcomingStage);
    } else if (currentStageIndex === 1) {
      setStage(upcomingStage);
    } else if (currentStageIndex === 2) {
      closeDialog();
    }
  };

  const closeDialog = () => {
    setStage(INITIAL_STAGE);
    setBlobSrc("");
    onCancel(selectedIO);
  };

  navigator.getUserMedia(
    { audio: true, video: true },
    function(stream) {
      // if (stream.getVideoTracks().length > 0 && stream.getAudioTracks().length > 0) {
      //     //code for when none of the devices are available
      // } else {
      //     // code for when both devices are available
      // }
    },
    e => console.log(e)
  );
  return (
    <DefaultDialog
      open={true}
      classes={{
        container: "d-flex align-items-center justify-content-center p-0"
      }}
      dialogContentClassName={`${s.dialogContent} p-0`}
      disableDialogTitle={true}
      maxWidth={"md"}
    >
      <div className={"heading_reg"}>
        <div className={s.modalBodyContainer}>
          <video
            id={CAM_VIDEO_EL_ID}
            className={`${blobSrc ? "d-none" : ""} w-100 ${s.videoCam}`}
            playsInline
            autoPlay
            muted={true}
          />
          <video
            id={RECORD_VIDEO_EL_ID}
            src={blobSrc}
            className={`${!blobSrc ? "d-none" : ""} w-100 ${s.videoCam}`}
            controls
          />

          <div className={"py-3 col-12 p-0"}>
            {!currentStageIndex && (
              <DeviceSelector
                SELECTIONS={SELECTIONS}
                selectedIO={selectedIO}
                selectionMap={selectionMap}
                handleUpdate={handleUpdate}
                handlePlayAudio={h__handlePlayAudio}
              />
            )}
            {currentStageIndex === 1 && <CaptureClip />}
            {currentStageIndex === 2 && <RecordCapture />}
            <div className={"text-center mt-3"}>
              <SettingInstructionsConfirm
                label={h__instructionCtaLabel(currentStageIndex)}
                handleClick={handleStageScreen}
              />
              {currentStageIndex !== 2 && (
                <Button className="ml-3" onClick={closeDialog}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultDialog>
  );
};

export default VideoSettingsV2;
