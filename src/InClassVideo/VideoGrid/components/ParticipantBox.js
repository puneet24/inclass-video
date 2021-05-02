import React, { useDebugValue } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";
import deepEqual from "fast-deep-equal";
import _pick from "lodash/pick";
import _debounce from "lodash/debounce";
import _throttle from "lodash/throttle";
import TwilioService from "../../../../../services/twilio";
import _round from "lodash/round";

import { makeDebugLogger } from "../../../../../helpers/dev-utils";
import SocketService from "../../../../../services/socket/index";
import {
  ACTION_TYPE,
  EVENT_TYPE
} from "../../../../../services/socket/constants";
import { isOneToOneClass } from "../../../../../helpers/utils";
import { s__slideshowData } from "../../../../../selectors/common";

const debug = makeDebugLogger("inclass:participantbox");

const getPropsToCompare = props => {
  const toCompare = ["videoTrackSid", "audioTrackSid", "participantIdentity"];
  return _pick(props, ...toCompare);
};

const areRelevantPropsEqual = (props1, props2) => {
  return deepEqual(getPropsToCompare(props1), getPropsToCompare(props2));
};

class ParticipantBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorInRefreshing: false
    };

    this._debouncedVerify = _debounce(this.verify, 1000, { trailing: true });
    this._throttledPositionVideo = _throttle(this.positionVideoElement, 2000);
    this._debouncedTogglePIPVideo = _debounce(this._toggleVideoPIP, 100, {
      trailing: true
    });
    // this._debouncedRefresh = _debounce(this.refresh, 100, { trailing: true });
  }

  shouldHandlePIP = () => {
    const localParticipant = TwilioService.getLocalParticipantInfo({
      withUserDetails: true
    });
    const { isScreenShare, isTeacher: isTeacherVideo } = this.props;
    if (localParticipant.isTeacher) {
      return isOneToOneClass() && !isTeacherVideo && !isScreenShare;
    } else {
      return isTeacherVideo && !isScreenShare;
    }
  };

  _toggleVideoPIP = enablePIP => {
    if (!this.props.isVideoOn) return;
    const isAlreadyPIP = document.pictureInPictureElement !== null;
    try {
      if (enablePIP && !isAlreadyPIP) {
        this.videoEl && this.videoEl.requestPictureInPicture();
      } else if (!enablePIP && isAlreadyPIP) {
        document.exitPictureInPicture();
      }
    } catch (e) {
      debug("called PIP toggle failed " + e.message);
    }
  };

  _handleSlideshowVisibility = isSlideShowVisible => {
    const localParticipant = TwilioService.getLocalParticipantInfo({
      withUserDetails: true
    });
    if (localParticipant.isStudent && isSlideShowVisible) {
      const isAlreadyPIP = document.pictureInPictureElement !== null;
      if (!isAlreadyPIP) {
        const { openDialog } = this.props;
        openDialog({
          showCancelButton: false,
          title: "Enable PIP",
          content: <div>Teacher has requested to enable PIP</div>,
          onConfirm: () => this._toggleVideoPIP(isSlideShowVisible)
        });
      }
    } else {
      const isPageVisible = document.visibilityState === "visible";
      if (!isPageVisible && !isSlideShowVisible) {
        return;
      }
      this._toggleVideoPIP(isSlideShowVisible);
    }
  };

  componentDidMount = async () => {
    this.refreshVideo(null, this.props.videoTrackSid);
    if (!this.props.isLocalParticipant) {
      this.refreshAudio(null, this.props.audioTrackSid);
    } else {
      debug("ddd not attaching local participant audio");
    }

    window.addEventListener("resize", this._throttledPositionVideo, false);
    document.addEventListener(
      "fullscreenchange",
      this._throttledPositionVideo,
      false
    );

    // if (this.shouldHandlePIP()) {
    //   SocketService.onEvent(ACTION_TYPE.ACTIVITY_OPEN, () =>
    //     this._toggleVideoPIP(true)
    //   );
    // }
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this._throttledPositionVideo, false);
    document.removeEventListener(
      "fullscreenchange",
      this._throttledPositionVideo,
      false
    );

    if (this.shouldHandlePIP()) {
      SocketService.removeListener(ACTION_TYPE.ACTIVITY_OPEN, () =>
        this._toggleVideoPIP(true)
      );
    }
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    this.refresh(this.props, nextProps);
  };

  componentDidUpdate = prevProps => {
    this._debouncedVerify();
    // this._throttledPositionVideo();
    // const { isVisible } = this.props.slideshowState;
    // if (
    //   this.shouldHandlePIP() &&
    //   prevProps.slideshowState.isVisible !== isVisible
    // ) {
    //   this._handleSlideshowVisibility(isVisible);
    // }
  };

  refresh = async (prevProps, currentProps) => {
    if (prevProps && prevProps.videoTrackSid !== currentProps.videoTrackSid) {
      this.refreshVideo(prevProps.videoTrackSid, currentProps.videoTrackSid);
    }
    if (prevProps && prevProps.audioTrackSid !== currentProps.audioTrackSid) {
      if (!this.props.isLocalParticipant) {
        this.refreshAudio(prevProps.audioTrackSid, currentProps.audioTrackSid);
      } else {
        debug("ddd not attaching local participant audio");
      }
    }
  };

  verify = async () => {
    if (this.audioEl && !this.audioEl.srcObject) {
      TwilioService.refreshTrack(null, this.props.audioTrackSid);
    }

    const track = TwilioService.getTrackBySID(this.props.videoTrackSid);
    if (this.props.isLocalParticipant && !track.isEnabled) {
      // this._throttledPositionVideo();
      return;
    }
    if (this.videoEl && !this.videoEl.srcObject) {
      await TwilioService.refreshTrack(null, this.props.videoTrackSid);
      // this._throttledPositionVideo();
    }
  };

  positionVideoElement = () => {
    const { isScreenShare } = this.props;

    if (!this.videoBoxEl || !this.videoEl || !this.containerEl) {
      debug("returning because of conditions");
      return;
    }

    if (isScreenShare) {
      videoBoxStyles = {
        paddingTop: 0
      };
      videoStyles = {
        position: "static",
        transform: "initial"
      };
      Object.assign(this.videoBoxEl.style, videoBoxStyles);
      Object.assign(this.videoEl.style, videoStyles);
      return;
    }

    const { isWide, aspectRatio } = this.isVideoWide();

    const containerBounds = this.containerEl.getBoundingClientRect();
    const videoBounds = this.videoEl.getBoundingClientRect();

    let videoBoxStyles = {
      paddingTop: _round(100 / aspectRatio, 5) + "%",
      position: "relative",
      overflow: "hidden"
    };
    let videoStyles = {
      position: "absolute",
      top: "0",
      left: "0",
      bottom: "0"
    };

    const widthDiff = Math.abs(videoBounds.width - containerBounds.width);
    const heightDiff = Math.abs(videoBounds.height - containerBounds.height);

    // We're flipping the video container if it's a video track
    // So as to play correct mirror reflection
    // This means our transforms need to be adjusted as well
    const multiplier = isScreenShare ? -1 : 1;

    let xShift = multiplier * -1 * Math.floor(widthDiff / 2);
    let yShift = -1 * Math.floor(heightDiff / 2);
    videoStyles.transform = `translate3d(${xShift}px, ${yShift}px, 0)`;

    // debug('positioning video', {
    //   videoStyles,
    //   videoBoxStyles,
    //   containerBounds,
    //   videoBounds,
    //   heightDiff,
    //   widthDiff,
    //   xShift,
    //   yShift,
    //   multiplier
    // })

    Object.assign(this.videoBoxEl.style, videoBoxStyles);
    Object.assign(this.videoEl.style, videoStyles);
  };

  refreshVideo = async (prevVideoTrackSid, videoTrackSid) => {
    if (prevVideoTrackSid !== videoTrackSid) {
      await TwilioService.refreshTrack(prevVideoTrackSid, videoTrackSid);
    }
    const prevInfo = !prevVideoTrackSid
      ? {}
      : TwilioService.getTrackInfoBySID(prevVideoTrackSid);
    const nextInfo = TwilioService.getTrackInfoBySID(videoTrackSid);

    if (!deepEqual(prevInfo, nextInfo)) {
      await TwilioService.refreshTrack(null, videoTrackSid);
    }
    // this._throttledPositionVideo();
  };

  refreshAudio = (prevAudioTrackSid, audioTrackSid) => {
    // We won't be attaching local participant's own audio stream to playback
    if (this.props.isLocalParticipant) {
      return;
    }

    if (prevAudioTrackSid !== audioTrackSid) {
      return TwilioService.refreshTrack(prevAudioTrackSid, audioTrackSid);
    }
    const prevInfo = !prevAudioTrackSid
      ? {}
      : TwilioService.getTrackInfoBySID(prevAudioTrackSid);
    const nextInfo = TwilioService.getTrackInfoBySID(audioTrackSid);

    if (!deepEqual(prevInfo, nextInfo)) {
      return TwilioService.refreshTrack(null, audioTrackSid);
    }
  };

  isVideoWide = () => {
    const track = TwilioService.getTrackBySID(this.props.videoTrackSid);
    if (!track || !track.dimensions) {
      return false;
    }

    const aspectRatio = track.dimensions.width / track.dimensions.height;
    const isWide = aspectRatio > 1.5;

    return { isWide, aspectRatio };
  };

  render() {
    const {
      videoTrackSid,
      audioTrackSid,
      isLocalParticipant,
      isScreenShare
    } = this.props;

    const { isWide, aspectRatio } = this.isVideoWide();

    const cx = classnames("ui-participant-video", {
      "is-16-by-9": !isScreenShare && isWide,
      "is-4-by-3": !isScreenShare && !isWide,
      "is-screen-share": isScreenShare
    });

    return (
      <div
        className="ui-participant-box"
        ref={node => {
          this.containerEl = node;
        }}
      >
        <div
          className={cx}
          ref={node => {
            this.videoBoxEl = node;
          }}
        >
          {/* <div className='ui-participant-video-inner'> */}
          <video
            autoPlay
            playsInline
            volume={0}
            id={videoTrackSid}
            key={videoTrackSid}
            onPlay={this.positionVideoElement}
            onTimeUpdate={this._throttledPositionVideo}
            ref={node => {
              this.videoEl = node;
            }}
          />
          {/* </div> */}
        </div>
        {!isLocalParticipant ? (
          <div className="ui-participant-audio">
            <audio
              autoPlay
              playsInline
              id={audioTrackSid}
              key={audioTrackSid}
              ref={node => {
                this.audioEl = node;
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

ParticipantBox.propTypes = {
  videoTrackSid: PropTypes.string,
  audioTrackSid: PropTypes.string,
  participantIdentity: PropTypes.string
};

const mapStateToProps = state => {
  return {
    slideshowState: s__slideshowData(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ParticipantBox);
