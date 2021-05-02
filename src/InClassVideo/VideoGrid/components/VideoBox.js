import React from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import TwilioService from "../../../../../services/twilio";
import deepEqual from "fast-deep-equal";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import SocketService from "../../../../../services/socket/index";
import * as SocketActions from "../../../../../services/socket/actions";

import _get from "lodash/get";
import _pick from "lodash/pick";
import _debounce from "lodash/debounce";
import store from "../../../../../index";

import VideoBoxControls from "./VideoBoxControls";
import ParticipantInfo from "./ParticipantInfo";

import { getTwilioParticipantInformation } from "../../../../../helpers/utils";
import { makeDebugLogger } from "../../../../../helpers/dev-utils";
import ParticipantBox from "./ParticipantBox";
import FlashSnackbar from "../../../../../components/snackbar/FlashSnackbar";

import * as OverlayBoxHelper from "../helpers/overlaybox-helper";

import LocationOffIcon from "@material-ui/icons/LocationOff";
import LocationOnIcon from "@material-ui/icons/LocationOn";

const debug = makeDebugLogger("inclass:videobox");

const PinControl = ({ isPinned, onClick }) => {
  const text = isPinned ? `Remove Pin` : `Pin`;
  const icon = isPinned ? (
    <LocationOffIcon fontSize="inherit" />
  ) : (
    <LocationOnIcon fontSize="inherit" />
  );
  return (
    <div className="ui-videobox-pin-control" onClick={onClick}>
      {icon} {text}
    </div>
  );
};

class VideoBox extends React.Component {
  state = {
    showSnackbar: false,
    snackbarMsg: "",
    snackbarType: ""
  };

  constructor(props) {
    super(props);
    this._debouncedAdjustOverlay = _debounce(this.adjustOverlay, 300);
  }

  getAudioTrackInfo = props => {
    props = props || this.props;
    const trackInfo = (props.trackInfo || { audio: [] }).audio[0];
    return trackInfo || {};
  };

  getVideoTrackInfo = props => {
    props = props || this.props;
    const trackInfo = (props.trackInfo || { video: [] }).video[0];
    return trackInfo || {};
  };

  getTrack = trackInfoOrSid => {
    // trackSid
    if (trackInfoOrSid === "string") {
      return TwilioService.getTrackBySID(trackInfoOrSid);
    }

    const sid = trackInfoOrSid.trackSid;
    return TwilioService.getTrackBySID(sid);
  };

  componentDidMount = () => {
    this._debouncedAdjustOverlay();
    // Only attach if user is a student
    if (!this.props.isTeacher) {
      SocketService.onAction(
        `COMMAND:SCREEN_SHARE`,
        this.onSocketMessageStartScreenShare
      );
      SocketService.onAction(
        `COMMAND:MUTE_STUDENT`,
        this.onSocketMessageMuteStudent
      );
    }
  };

  onSocketMessageStartScreenShare = payload => {
    const localParticipant = getTwilioParticipantInformation(
      TwilioService.getLocalParticipantInfo()
    );
    debug("ccc request screenshare", {
      payload,
      localParticipant,
      isAlreadySharing: TwilioService.isParticipantSharingScreen(
        localParticipant
      ),
      props: this.props
    });
    if (payload.target !== localParticipant.userId) {
      return;
    }

    const { openDialog } = this.props;
    if (TwilioService.isParticipantSharingScreen(localParticipant)) {
      openDialog({
        title: "Stop Screen Sharing",
        content: <div>Teacher has requested you to stop sharing screen </div>,
        onConfirm: () => TwilioService.stopScreenSharing(localParticipant)
      });
    } else {
      openDialog({
        title: "Screen Sharing",
        content: <div>Teacher has requested to share your screen</div>,
        onConfirm: () => {
          return (
            !TwilioService.isParticipantSharingScreen(localParticipant) &&
            TwilioService.startScreenSharing(localParticipant)
          );
        }
      });
    }
  };

  componentWillUnmount = () => {};

  componentDidUpdate = prevProps => {
    this._debouncedAdjustOverlay();
  };

  adjustOverlay = () => {
    const { orientation } = this.props;
    if (!this.container) {
      return;
    }

    const videoBox = this.container.querySelector(".ui-participant-video");
    const overlayBox = this.container.querySelector(".ui-video-box-overlay");

    if (!videoBox || !overlayBox) {
      return;
    }
    OverlayBoxHelper.setOverlayBoxPosition(videoBox, overlayBox, orientation);
  };

  isScreenSharingActiveForParticipant = identity => {
    const tracks = TwilioService.staticTrackInfoList || [];
    const screenTrack = tracks.find(
      ({ kind, participantIdentity, isScreenShareTrack }) => {
        return (
          kind === "video" &&
          participantIdentity === identity &&
          isScreenShareTrack
        );
      }
    );
    return !!screenTrack;
  };

  _handleStudentScreenShareRequest = ({ name, identity }) => {
    const studentScreenTrack = this.isScreenSharingActiveForParticipant(
      identity
    );

    if (studentScreenTrack) {
      this._showNotification(`${name} started screen sharing.`, "success");
    } else {
      this._showNotification(
        `${name} could not start screen sharing.`,
        "error"
      );
    }
  };

  toggleScreenShare = () => {
    const { userId } = this.props;
    const localParticipant = getTwilioParticipantInformation(
      TwilioService.getLocalParticipantInfo()
    );
    if (localParticipant.isTeacher) {
      const isScreenSharingActive = this.isScreenSharingActiveForParticipant(
        this.props.identity
      );
      if (!isScreenSharingActive) {
        this._showNotification(
          `You have requested ${this.props.name} to share screen.`,
          "info"
        );
        if (this._timeoutSS) {
          window.clearTimeout(this._timeoutSS);
        }
        this._timeoutSS = setTimeout(
          () => this._handleStudentScreenShareRequest(this.props),
          15000
        );
      }
      SocketActions.requestScreenShare(userId);
    }
  };

  _showNotification(message, variant = "info") {
    this.setState({
      showSnackbar: true,
      snackbarMsg: message,
      snackbarType: variant
    });
  }

  _handleMuteStudentRequest = ({ name, identity }, wasAudioTrackEnabled) => {
    const tracks = TwilioService.staticTrackInfoList || [];
    const mutedStudentAudioTrack = tracks.find(
      ({ kind, participantIdentity, isEnabled }) => {
        return kind === "audio" && participantIdentity === identity;
      }
    );

    if (
      mutedStudentAudioTrack &&
      mutedStudentAudioTrack.isEnabled !== wasAudioTrackEnabled
    ) {
      this._showNotification(
        `${name} was ${
          wasAudioTrackEnabled ? "muted" : "un-muted"
        } successfully.`,
        "success"
      );
    } else {
      this._showNotification(
        `${name} could not be ${wasAudioTrackEnabled ? "muted" : "un-muted"}.`,
        "error"
      );
    }
  };

  toggleAudioTrack = () => {
    const trackInfo = this.getAudioTrackInfo();
    const localParticipant = getTwilioParticipantInformation(
      TwilioService.getLocalParticipantInfo()
    );

    // Local participant when toggles audio of self
    // It should reflect to all participants in the room
    if (trackInfo.isLocalParticipant) {
      TwilioService.detachTrackBySID(trackInfo.trackSid);
    } else if (localParticipant.isTeacher) {
      // When local participant toggles audio of remote participant
      // Nothing should happen unless the local participant is teacher
      const isAudioTrackEnabled = this.getAudioTrackInfo().isEnabled;
      this._showNotification(
        `You have requested to ${isAudioTrackEnabled ? "mute" : "un-mute"} ${
          this.props.name
        }.`,
        "info"
      );
      if (this._timeoutAudio) {
        window.clearTimeout(this._timeoutAudio);
      }
      this._timeoutAudio = setTimeout(
        () => this._handleMuteStudentRequest(this.props, isAudioTrackEnabled),
        4000
      );
      SocketActions.muteStudent(this.props.userId, isAudioTrackEnabled);
    }
  };

  // A teacher has requested to mute student
  onSocketMessageMuteStudent = socketMessage => {
    if (
      socketMessage.target !== "*" &&
      socketMessage.target !== this.props.userId
    ) {
      return;
    }
    const { state = {} } = socketMessage.payload;
    const { isMuteOperation } = state;

    debug("ccc twilio socket mute", { socketMessage, props: this.props });

    const audioTrackInfo = this.getAudioTrackInfo();
    const { isSharingScreen, isLocalParticipant } = this.props;
    const operation = isMuteOperation ? "muted" : "un-muted";
    if (isMuteOperation) {
      TwilioService.detachTrackBySID(audioTrackInfo.trackSid);
    } else {
      TwilioService.attachTrackBySID(audioTrackInfo.trackSid);
    }
    if (!isSharingScreen && isLocalParticipant) {
      this._showNotification(`Teacher ${operation} you.`, "info");
    }
  };

  shouldAllowStreamControls = () => {
    const localParticipant = TwilioService.getLocalParticipantInfo({
      withUserDetails: true
    });
    return (
      !this.props.isOPS && localParticipant.isTeacher && !this.props.isTeacher
      // !this.props.isSharingScreen
    );
  };

  onPinClick = () => {
    const {
      localUniqueId,
      isCasting,
      openDialog,
      isPinned,
      onPinClick
    } = this.props;
    if (isPinned && isCasting) {
      openDialog({
        title: "Stop Casting",
        content: <div>You want to stop casting?</div>,
        onConfirm: () => {
          onPinClick(localUniqueId);
          this.onCastClick();
        },
        onCancel: () => onPinClick(localUniqueId)
      });
    } else {
      onPinClick(localUniqueId);
    }
  };

  onCastClick = () => {
    this.props.onCastClick(this.props.localUniqueId);
  };

  onDoubleClick = () => {
    if (this.props.isTeacher && this.props.isLocalParticipant) {
      this.onPinClick();
    }
  };

  render() {
    const {
      name,
      email,
      isSharingScreen,
      identity,
      classes,
      isTeacher,
      isLocalParticipant,
      isPinned,
      openDialog,
      isCasting
    } = this.props;

    const { showSnackbar, snackbarMsg, snackbarType } = this.state;

    const videoTrackInfo = this.getVideoTrackInfo();
    const audioTrackInfo = this.getAudioTrackInfo();

    const isMuted = !audioTrackInfo.isEnabled;
    const isVideoOn = videoTrackInfo.isEnabled;

    const videoTrackSid = videoTrackInfo.trackSid;
    const audioTrackSid = audioTrackInfo.trackSid;

    // const allowStreamControls = true;
    const allowStreamControls = this.shouldAllowStreamControls();

    const shouldShowReconnectingScreen = this.props.state !== "connected";

    const isFullScreen = !!document.fullscreenElement;

    const cx = classnames(
      "ui-video-box",
      {
        "is-sharing-screen": isSharingScreen,
        "is-muted": isMuted,
        "is-reconnecting": shouldShowReconnectingScreen
      },
      this.props.className
    );

    return (
      <div
        className={cx}
        ref={node => {
          this.container = node;
        }}
      >
        <div
          className="ui-video-box-overlay"
          onDoubleClick={this.onDoubleClick}
        >
          <ParticipantInfo
            className="bottom-left"
            name={name}
            email={email}
            isTeacher={isTeacher}
            isSharingScreen={isSharingScreen}
            isLocalParticipant={isLocalParticipant}
          />
          {allowStreamControls && (
            <VideoBoxControls
              className="bottom-right"
              isScreenShareBoxControl={isSharingScreen}
              isPinned={isPinned}
              isCasting={isCasting}
              onPinToggle={this.onPinClick}
              onCastToggle={this.onCastClick}
              isAudioOn={!isMuted}
              onAudioToggle={this.toggleAudioTrack}
              isScreenShareOn={TwilioService.isParticipantSharingScreen(
                identity
              )}
              onScreenShareToggle={this.toggleScreenShare}
            />
          )}
          {/* {isSharingScreen && (
            <div className="ui-videobox-center-control">
              <PinControl isPinned={isPinned} onClick={this.onPinClick} />
            </div>
          )} */}
          {shouldShowReconnectingScreen && (
            <div className="ui-video-box-loader">
              <div className="bg-dark" />
              <CircularProgress color="primary" size={20} />
            </div>
          )}
        </div>
        <ParticipantBox
          identity={identity}
          videoTrackSid={videoTrackSid}
          audioTrackSid={audioTrackSid}
          isLocalParticipant={isLocalParticipant}
          isScreenShare={isSharingScreen}
          isTeacher={isTeacher}
          isVideoOn={isVideoOn}
          openDialog={openDialog}
        />
        {ReactDOM.createPortal(
          <FlashSnackbar
            message={snackbarMsg}
            variant={snackbarType || "info"}
            open={showSnackbar}
            timeout={2000}
            onClose={() => this.setState({ showSnackbar: false })}
          />,
          document.getElementById(
            isFullScreen ? "class-session-container" : "root"
          )
        )}
      </div>
    );
  }
}

export default VideoBox;
