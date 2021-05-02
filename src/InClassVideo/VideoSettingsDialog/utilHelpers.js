let currentStream;

const gotDevices = mediaDevices => {
  // select.innerHTML = '';
  // select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === "videoinput") {
      const option = document.createElement("option");
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
};

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

export const startListing = () => {
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
};
