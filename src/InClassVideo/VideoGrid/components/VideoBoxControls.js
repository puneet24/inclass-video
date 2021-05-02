import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _noop from "lodash/noop";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CastIcon from "@material-ui/icons/Cast";
import StopCastIcon from "@material-ui/icons/CancelPresentation";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import DesktopAccessDisabledIcon from "@material-ui/icons/DesktopAccessDisabled";
import Tooltip from "@material-ui/core/Tooltip";

const PinSVGIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 2 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 4V9C14 10.12 14.37 11.16 15 12H9C9.65 11.14 10 10.1 10 9V4H14ZM17 2H7C6.45 2 6 2.45 6 3C6 3.55 6.45 4 7 4H8V9C8 10.66 6.66 12 5 12V14H10.97V21L11.97 22L12.97 21V14H19V12C17.34 12 16 10.66 16 9V4H17C17.55 4 18 3.55 18 3C18 2.45 17.55 2 17 2Z"
      fill="currentColor"
    />
  </svg>
);

const UnpinSVGIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 2 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 2H17C17.55 2 18 2.45 18 3C18 3.55 17.55 4 17 4H16V6.29325L7.26569 14H5V12C6.66 12 8 10.66 8 9V4H7C6.45 4 6 3.55 6 3C6 2.45 6.45 2 7 2ZM10.97 14.7324V21L11.97 22L12.97 21V14H19V12C17.7318 12 16.6503 11.2178 16.2105 10.1084L10.97 14.7324Z"
      fill="currentColor"
    />
    <line
      x1="4.33838"
      y1="19.2502"
      x2="21.3384"
      y2="4.25016"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const ControlButton = ({
  children,
  className,
  active = false,
  title = "",
  onClick = _noop
}) => {
  const cx = classnames("ui-videobox-control-button", className, {
    "is-active": active
  });
  return (
    <Tooltip
      title={title}
      placement="top"
      disableFocusListener
      disableTouchListener
      interactive
      leaveDelay={100}
    >
      <div className={cx} onClick={onClick}>
        {children}
      </div>
    </Tooltip>
  );
};
ControlButton.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

const VideoBoxControls = ({
  className,
  isAudioOn,
  onAudioToggle,
  isScreenShareOn,
  onScreenShareToggle,
  isPinned,
  isCasting,
  onPinToggle,
  isScreenShareBoxControl,
  onCastToggle
}) => {
  const cx = classnames("ui-videobox-controls", className);
  return (
    <div className={cx}>
      <div className="controls">
        {!isScreenShareBoxControl && (
          <ControlButton
            onClick={onAudioToggle}
            active={!isAudioOn}
            title="Toggle Audio"
            className="is-audio-control"
          >
            {isAudioOn ? (
              <MicIcon fontSize="inherit" />
            ) : (
              <MicOffIcon fontSize="inherit" />
            )}
          </ControlButton>
        )}

        {!isScreenShareBoxControl && (
          <ControlButton
            onClick={onScreenShareToggle}
            active={isScreenShareOn}
            title="Request to toggle screen share"
            className="is-screen-share-control"
          >
            {isScreenShareOn ? (
              <DesktopWindowsIcon fontSize="inherit" />
            ) : (
              <DesktopAccessDisabledIcon fontSize="inherit" />
            )}
          </ControlButton>
        )}
        <ControlButton
          onClick={onPinToggle}
          active={isPinned}
          title="Pin this box"
          className="is-pin-control"
        >
          <span className="control-icon">
            {isPinned ? <UnpinSVGIcon /> : <PinSVGIcon />}
          </span>
        </ControlButton>
        {isPinned && (
          <ControlButton
            onClick={onCastToggle}
            active={isPinned}
            title={isCasting ? "Stop Broadcasting" : "Broadcasting this box"}
            className="is-cast-control"
          >
            {isCasting ? (
              <StopCastIcon fontSize="inherit" />
            ) : (
              <CastIcon fontSize="inherit" />
            )}
          </ControlButton>
        )}
      </div>
    </div>
  );
};

VideoBoxControls.propTypes = {
  isAudioOn: PropTypes.bool.isRequired,
  onAudioToggle: PropTypes.func.isRequired,
  isScreenShareOn: PropTypes.bool.isRequired,
  onScreenShareToggle: PropTypes.func.isRequired
};
export default VideoBoxControls;
