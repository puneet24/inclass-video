import TwilioService from "../../../../../services/twilio";
import { ORIENTATIONS } from "../constants";

/**
 * Default sizing for overlaybox
 *
 * @param {HTMLElement} element dom node of overlay box
 * @param {DOMRect} bounds
 */
const setDefaultPosition = (element, bounds) => {
  const styles = {
    top: "0px",
    left: "0px",
    bottom: "0px",
    right: "0px",
    maxWidth: "100%",

    width: "initial",
    transform: "none"
  };

  Object.assign(element.style, styles);
};

/**
 * Spans the width of targetElement
 * Used in case when teacher is taking half screen horizontally
 * and inside video does not have enough aspect ratio to fill the section
 *
 * Providing the video element's bounds would snap the overlay box to actual video element
 * @param {HTMLElement} element
 * @param {DOMRect} bounds
 */
export const setInHorizontalPosition = (element, bounds) => {
  const styles = {
    top: `${bounds.top}px`,
    left: `0px`,
    right: `0px`,
    height: `${bounds.height}px`,
    width: `${bounds.width}px`,
    transform: `none`
  };

  Object.assign(element.style, styles);
};

/**
 *
 * @param {HTMLElement} element
 * @param {DOMRect} bounds
 * @param {Number} aspectRatio fit the final width in this aspectRatio
 */
export const setInVerticalPosition = (element, bounds, aspectRatio) => {
  const styles = {
    top: "0px",
    left: "50%",
    right: "0px",
    maxWidth: "100%",
    height: `${bounds.height}px`
  };

  let width = aspectRatio
    ? Math.min(bounds.width, bounds.height * aspectRatio)
    : bounds.width;

  styles.width = `${width}px`;
  styles.transform = `translateX(-${width / 2}px)`;

  Object.assign(element.style, styles);
};

/**
 *
 * @param {HTMLElement} videoBox
 * @param {HTMLElement} overlayBox
 * @param {*} orientation
 */
export const setOverlayBoxPosition = (videoBox, overlayBox, orientation) => {
  const videoElement = videoBox.querySelector("video");
  const bounds = videoBox.getBoundingClientRect();

  const track = TwilioService.getTrackBySID(videoElement.id);

  const dimensions =
    track.dimensions && track.dimensions.width ? track.dimensions : false;

  const videoStreamAspectRatio = dimensions
    ? dimensions.width / dimensions.height
    : false;

  // status checks
  const isVideoEnabled = track.isEnabled;
  const isStreamActive =
    videoElement && videoElement.srcObject && videoElement.srcObject.active;

  const isVideoWidthInvalid = bounds.width < 50;
  const shouldUseFallbackSizing =
    !isStreamActive || !isVideoEnabled || isVideoWidthInvalid;

  setDefaultPosition(overlayBox, bounds);

  if (shouldUseFallbackSizing) {
    overlayBox.classList.add("video-disabled");
    videoElement.style.opacity = 0;
  } else {
    overlayBox.classList.remove("video-disabled");
    videoElement.style.opacity = 1;
  }
};
