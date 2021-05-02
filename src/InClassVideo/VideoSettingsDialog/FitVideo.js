import React from "react";
import classnames from "classnames";
import _noop from "lodash/noop";
import _throttle from "lodash/throttle";
import PropTypes from "prop-types";

const fitVideoPosition = (containerEl, videoEl) => {
  if (!containerEl || !videoEl) {
    return;
  }

  const stream = videoEl.srcObject;
  if (!stream.active) {
    return;
  }
  const track = videoEl.srcObject.getVideoTracks()[0];
  if (!track) {
    return;
  }

  const containerBounds = containerEl.getBoundingClientRect();
  const containerAspectRatio = containerBounds.width / containerBounds.height;
  const videoAspectRatio = track.getSettings().aspectRatio;

  const containerIsTaller = videoAspectRatio > containerAspectRatio;

  let width;
  let height;

  let widthDiff = 0;
  let heightDiff = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Prioritize height
  if (containerIsTaller) {
    height = Math.ceil(containerBounds.height + 1);
    width = Math.ceil(containerBounds.height * videoAspectRatio + 1);
    widthDiff = Math.abs(containerBounds.width - width);
    heightDiff = Math.abs(containerBounds.height - height);
    offsetY = `${Math.floor(heightDiff / 2)}px`;
    offsetX = `${Math.floor((-1 * widthDiff) / 2)}px`;
  } else {
    height = Math.ceil(containerBounds.width / videoAspectRatio + 1);
    width = Math.ceil(containerBounds.width + 1);
    widthDiff = Math.abs(containerBounds.width - width);
    heightDiff = Math.abs(containerBounds.height - height);
    offsetX = `${Math.floor(widthDiff / 2)}px`;
    offsetY = `${Math.floor((-1 * heightDiff) / 2)}px`;
  }

  const styles = {
    height: `${height}px`,
    width: `${width}px`,
    transform: `translate3d(${offsetX}, ${offsetY}, 0px)`
  };

  Object.assign(videoEl.style, styles);
};

class FitVideo extends React.Component {
  constructor(props) {
    super(props);
    this._throttledTimeUpdate = _throttle(this.onTimeUpdate, 2000);
  }
  getAspectRatio = () => {
    if (!this.video || !this.video.srcObject || !this.video.srcObject.active) {
      return 1.333333; // 4/3
    }

    let videoTrack = this.video.srcObject.getVideoTracks()[0];
    return videoTrack.getSettings().aspectRatio;
  };

  onPlay = (...args) => {
    const { onPlay = _noop } = this.props.videoProps || {};
    if (this.container && this.video) {
      fitVideoPosition(this.container, this.video);
    }
    onPlay(...args);
  };

  onTimeUpdate = (...args) => {
    const { onTimeUpdate = _noop } = this.props.videoProps || {};
    if (this.container && this.video) {
      fitVideoPosition(this.container, this.video);
    }
    onTimeUpdate(...args);
  };

  render() {
    const { className, videoClassName, videoProps = {} } = this.props;

    const rootClasses = classnames("fit-video-container", className);
    const videoClasses = classnames("fit-video", videoClassName);

    return (
      <div
        className={rootClasses}
        ref={node => {
          this.container = node;
        }}
      >
        <video
          {...videoProps}
          className={videoClasses}
          ref={node => {
            this.video = node;
            if (videoProps.ref) {
              videoProps.ref(node);
            }
          }}
          onPlay={this.onPlay}
          onTimeUpdate={this._throttledTimeUpdate}
        />
      </div>
    );
  }
}

export default FitVideo;
