import DetectRTC from "detectrtc";
import { setDefaultDevice } from "../../../services/twilio/device-utils";

export const h__updateRtcChannels = (newTargetValue, successCb) => {
  let videoElement = document.getElementById("twilio-video");
  DetectRTC.load(async () => {
    const newTarget = DetectRTC.MediaDevices.find(
      val => val.deviceId === newTargetValue
    );

    const targetKind = newTarget.kind;

    const changeAudioDestination = () => {
      const audioDestination = newTarget.deviceId;
      attachSinkId(videoElement, audioDestination);
      // setDefaultDevice("audiooutput", audioDestination);
    };

    if (targetKind) {
      if (targetKind === "videoinput") {
        const videoSource = newTarget.deviceId;
        setDefaultDevice("videoinput", videoSource);
        successCb(newTarget);
        // const constraints = {
        //   video: { deviceId: videoSource ? { exact: videoSource } : undefined }
        // };
        // navigator.mediaDevices
        //   .getUserMedia(constraints)
        //   .then(gotStream)
        //   .then(() => successCb && successCb(newTarget));
      } else if (targetKind === "audioinput") {
        const audioSource = newTarget.deviceId;
        setDefaultDevice("audioinput", audioSource);
        successCb(newTarget);
        // const constraints = {
        //   audio: { deviceId: audioSource ? { exact: audioSource } : undefined }
        //   // video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        // };
        // navigator.mediaDevices
        //   .getUserMedia(constraints)
        //   .then(gotStream)
        //   .then(() => successCb && successCb(newTarget));
      } else if (targetKind === "audiooutput") {
        changeAudioDestination();
      }
    }

    function gotDevices(deviceInfos) {
      console.log(deviceInfos, "deviceInfos>>>>>>");
    }

    navigator.mediaDevices
      .enumerateDevices()
      .then(gotDevices)
      .catch(handleError);

    // Attach audio output device to video element using device/sink ID.
    function attachSinkId(element, sinkId) {
      if (
        "sinkId" in HTMLMediaElement.prototype &&
        typeof element.sinkId !== "undefined"
      ) {
        element
          .setSinkId(sinkId)
          .then(() => {
            successCb && successCb(newTarget);
            console.log(`Success, audio output device attached: ${sinkId}`);
          })
          .catch(error => {
            let errorMessage = error;
            if (error.name === "SecurityError") {
              errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
          });
      } else {
        console.warn("Browser does not support output device selection.");
      }
    }
    function gotStream(stream) {
      window.stream = stream; // make stream available to console
      videoElement.srcObject = stream;
      // Refresh button list in case labels have become available
      return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {
      console.log(
        "navigator.MediaDevices.getUserMedia error: ",
        error.message,
        error.name
      );
    }
  });
};
