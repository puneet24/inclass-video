const SPEAKER_TEST_MP3 =
  "https://ssl.gstatic.com/chat/sounds/speaker_test_d00f43ce701c3b3f084f723f0f61d406.mp3";
export const CAM_VIDEO_EL_ID = "vid_settings-video-source";
export const RECORD_VIDEO_EL_ID = "vid_settings-record-view";
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
let currentStream;
export const INITIAL_STAGE = "deviceSelector";

const stopMediaTracks = stream => {
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

export const STAGE_SEQUENCE = [
  "deviceSelector",
  "captureClipConfirmation",
  "recordClip"
];

export const h__instructionCtaLabel = index => {
  if (!index) return "Next";
  else if (index === 1) return "Start";
  else return "Close";
};

export const h__startRecord = (audioSourceId, videoSourceId, onSuccess) => {
  if (window.stream || currentStream) {
    (window.stream || currentStream).getTracks().forEach(track => {
      track.stop();
    });
  }
  const constraintObj = {
    audio: { deviceId: audioSourceId ? { exact: audioSourceId } : undefined },
    video: {
      facingMode: "user",
      deviceId: videoSourceId ? { exact: videoSourceId } : undefined
    }
  };
  navigator.mediaDevices
    .getUserMedia(constraintObj)
    .then(function(mediaStreamObj) {
      let video = document.getElementById(CAM_VIDEO_EL_ID);
      let videoOutput = document.getElementById(RECORD_VIDEO_EL_ID);
      if ("srcObject" in video) {
        video.srcObject = mediaStreamObj;
      } else {
        //old version
        video.src = window.URL.createObjectURL(mediaStreamObj);
      }

      video.onloadedmetadata = function(ev) {
        //show in the video element what is being captured by the webcam
        video.play();
      };
      let mediaRecorder = new MediaRecorder(mediaStreamObj);
      let chunks = [];
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 7000);
      mediaRecorder.ondataavailable = function(ev) {
        chunks.push(ev.data);
      };
      mediaRecorder.onstop = ev => {
        let blob = new Blob(chunks, { type: "video/mp4;" });
        chunks = [];
        // delete video;
        onSuccess(window.URL.createObjectURL(blob));
        videoOutput.src = window.URL.createObjectURL(blob);
      };
    })
    .catch(function(err) {});
};

export const h__handlePlayAudio = sinkId => {
  const audio = new Audio(SPEAKER_TEST_MP3);
  // new Audio(SPEAKER_TEST_MP3).play();
  if (audio.setSinkId) {
    audio.setSinkId(sinkId);
  }
  audio.play();
};

function gotStream(stream) {
  const videoElement = document.getElementById(CAM_VIDEO_EL_ID);
  videoElement.volume = 1;
  if (typeof currentStream !== "undefined") {
    stopMediaTracks(currentStream);
  }
  currentStream = stream;
  window.stream = stream; // make stream available to console
  try {
    videoElement.srcObject = stream;
  } catch (error) {
    videoElement.src = URL.createObjectURL(stream);
  }
  // videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

export const h__handleStreamInput = (audioSourceId, videoSourceId) => {
  try {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  } catch (e) {
    handleError(e);
  }
  console.log(
    audioSourceId,
    videoSourceId,
    "audioSourceId, videoSourceId>>>>>"
  );
  const constraints = {
    audio: { deviceId: audioSourceId ? { exact: audioSourceId } : undefined },
    video: { deviceId: videoSourceId ? { exact: videoSourceId } : undefined }
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
};

export const h__initPermissions = () => {
  navigator.getUserMedia(
    { video: true },
    function(stream) {
      console.log(stream, "stream>>>>>");
      // if (stream.getVideoTracks().length > 0 && stream.getAudioTracks().length > 0) {
      //     //code for when none of the devices are available
      // } else {
      //     // code for when both devices are available
      // }
    },
    handleError
  );
};

export const h__handleAudioOutput = audioOutputDeviceId => {
  const videoElement = document.getElementById(RECORD_VIDEO_EL_ID);
  // if (videoElement) {
  //     videoElement.setSinkId(audioOutputDeviceId);
  // }
  if (typeof videoElement.sinkId !== "undefined") {
    videoElement.setSinkId(audioOutputDeviceId).catch(error => {
      let errorMessage = error;
      if (error.name === "SecurityError") {
        errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      // audioOutputSelect.selectedIndex = 0;
    });
  } else {
    console.warn("Browser does not support output device selection.");
  }
};

function handleError(e) {
  console.log(e, ">>>>>Error");
}
