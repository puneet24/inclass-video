import React from "react";
import PropTypes from "prop-types";

import * as DeviceUtils from "../../../../services/twilio/device-utils";
import { h__updateRtcChannels } from "../rtcSourceControl";
import SelectControl from "./SelectControl";
import { StyledVideoSettingsDialog } from "./styles";
import withSystemNetworkLogger from "../../../../components/_HOC/withSystemNetworkLogger";
import DefaultDialog from "../../../../components/dialogs/DefaultDialog";
import CancelIcon from "@material-ui/icons/Cancel";

class VideoSettingsDialog extends React.Component {
  state = {
    loading: false,
    error: false,
    options: {
      audioinput: [],
      audiooutput: [],
      videoinput: []
    },
    selected: {
      videoinput: null,
      audioinput: null,
      audiooutput: null
    },
    videoEl: null
  };

  componentDidMount = async () => {
    this.setState({ loading: true, error: false });
    try {
      await DeviceUtils.populateDevices();
      this.setState({
        loading: false,
        selected: DeviceUtils.getDefaultDeviceOptionByType(),
        options: DeviceUtils.getDeviceOptionsByType()
      });
    } catch (err) {
      this.setState({ error: err, loading: false });
    }
  };

  componentDidUpdate = () => {
    if (this.videoEl && !this.videoEl.srcObject) {
      this.setVideoStream();
    }
  };

  setVideoStream = () => {
    if (!this.videoEl) {
      return;
    }

    if (this.videoEl.srcObject) {
      this.videoEl.srcObject.getTracks().forEach(track => track.stop());
    }

    const stream = new MediaStream();
    stream.addTrack(DeviceUtils.getTestStream().getVideoTracks()[0]);
    this.videoEl.srcObject = stream;
  };

  /**
   *
   * @param {MediaStreamConstraints} constraints
   * @param {MediaStreamTrack} track
   */
  applyConstraints = (constraints, track) => {
    try {
      track.applyConstraints(constraints);
      return true;
    } catch (err) {
      return false;
    }
  };

  clearStreams = () => {
    if (this.videoEl && this.videoEl.srcObject) {
      this.videoEl.srcObject.getTracks().forEach(track => track.stop());
    }
    DeviceUtils.clearTestStreams();
  };

  componentWillUnmount = () => {
    this.clearStreams();
  };

  onConfirm = () => {
    Object.keys(this.state.selected).forEach(kind => {
      DeviceUtils.setDefaultDevice(kind, this.state.selected[kind]);
    });

    this.props.onConfirm();
  };

  applyAudioOutputConstraints = targetVal => {
    const audioDestination = targetVal;
  };

  updateTargetAndLog = newTarget => {
    if (!newTarget.kind || !newTarget.deviceId) return;
    const { handleSubmitRTClog } = this.props;
    this.setState(
      {
        selected: {
          ...this.state.selected,
          [newTarget.kind]: { ...newTarget, value: newTarget.deviceId }
        }
      },
      () =>
        handleSubmitRTClog({
          metricAdditional: {
            selectedMediaDevice: this.state.selected,
            metricSource: "LANDING_VIDEO_SETTINGS_MODAL"
          }
        })
    );
  };

  handleSelectChange = async event => {
    const targetVal = event.target.value;
    h__updateRtcChannels(targetVal, newTarget =>
      this.updateTargetAndLog(newTarget)
    );
  };

  renderSelectControl = (kind, label) => {
    const selected =
      (this.state.selected && this.state.selected[kind]) || undefined;
    const options = (this.state.options && this.state.options[kind]) || [];
    if (!options.length) return null;
    return (
      <SelectControl
        handleChange={this.handleSelectChange}
        options={options}
        label={label}
        kind={kind}
        selected={selected}
      />
    );
  };

  renderDialogBody = () => {
    return (
      <>
        <div className={"close-modal-icon z_1"}>
          <CancelIcon
            onClick={this.props.onClose}
            fontSize={"large"}
            color={"inherit"}
          />
        </div>
        <div className="settings-video">
          <video
            className={"h-100 w-100"}
            id="settings-video"
            autoPlay
            playsInline
            ref={node => {
              this.videoEl = node;
              if (!this.state.videoEl) this.setState({ videoEl: node });
            }}
          />
        </div>
        <div className={"heading_reg py-3 col-12 p-0"}>
          <div className={"font22 mb-3 col-12 text-center"}>Your devices</div>
          <div className={"d-flex col-12 p-0 justify-content-between"}>
            <div className="col-4 pr-1">
              {this.renderSelectControl("videoinput", "Camera")}
            </div>
            <div className="col-4 px-1">
              {this.renderSelectControl("audioinput", "Microphone")}
            </div>
            <div className="col-4 pl-1">
              {this.renderSelectControl("audiooutput", "Sound Ouput")}
            </div>
          </div>
        </div>
      </>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <DefaultDialog
        open={this.props.open}
        onClose={this.props.onClose}
        classes={{
          container: "d-flex align-items-center justify-content-center p-0"
        }}
        dialogContentClassName={"p-0"}
        disableDialogTitle={true}
        maxWidth={"md"}
      >
        <StyledVideoSettingsDialog>
          {loading ? "Loading..." : this.renderDialogBody()}
        </StyledVideoSettingsDialog>
      </DefaultDialog>
    );
  }
}

VideoSettingsDialog.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default withSystemNetworkLogger(VideoSettingsDialog);
