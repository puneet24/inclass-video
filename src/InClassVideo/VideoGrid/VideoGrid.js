import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _get from "lodash/get";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import VideoBox from "./components/VideoBox";
import {
  TOTAL_COLS,
  ORIENTATIONS,
  generateLayout,
  getOrientation
} from "./utils";
import "./style.scss";

import { UserActionRequestDialogContext } from "../UserActionRequestDialog";
import { isLoggedInUserStudent } from "../../../../helpers/utils";

import TwilioService from "../../../../services/twilio";
import * as SocketActions from "../../../../services/socket/actions";

import FloatingParticipantGrid from "./FloatingParticipantGrid";
import { isNull } from "lodash";

const ReactGridLayout = WidthProvider(Responsive);

export default class VideoGridPOC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pinnedLocalUniqueId: null,
      castedLocalUniqueId: null
    };
  }

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
  };

  onBreakpointChange = (newBreakpoint, newCols) => {
    this.setState({
      currentBreakpoint: newBreakpoint,
      currentCols: newCols
    });
  };

  getParticipants = () => {
    const { participants, isFullScreen } = this.props;

    let floating;
    let others = [];

    const floatingViewValidations = [
      user => user.isTeacher,
      // There are multiple user boxes for each video stream a user has
      // Thus, even if teacher is sharing screen, her video box will still have isSharingScreen as false
      user =>
        !user.isSharingScreen &&
        TwilioService.isParticipantSharingScreen(user.identity),
      () => isLoggedInUserStudent(),
      () => isFullScreen
    ];

    participants.forEach(user => {
      const isUserFloating = floatingViewValidations.every(fn => fn(user));
      if (isUserFloating) {
        floating = user;
      } else {
        others.push(user);
      }
    });

    return {
      floatingParticipant: floating,
      participants: others
    };
  };

  setPinnedParticipant = participantLocalUniqueId => {
    const pinnedLocalUniqueId =
      this.state.pinnedLocalUniqueId === participantLocalUniqueId
        ? null
        : participantLocalUniqueId;

    this.setState({ pinnedLocalUniqueId });
  };

  setCastingParticipant = participantLocalUniqueId => {
    const castedLocalUniqueId =
      this.state.castedLocalUniqueId === participantLocalUniqueId
        ? null
        : participantLocalUniqueId;

    this.setState({ castedLocalUniqueId });

    if (castedLocalUniqueId === null) {
      // SocketActions.pinScreen({
      //   userId: null,
      //   isScreenShareTrack: false,
      //   trackSid: false
      // });
      return;
    }

    const participantInfo =
      TwilioService.staticParticipantsList.find(
        info => info.localUniqueId === castedLocalUniqueId
      ) || {};
    const videoInfoList = _get(participantInfo, "trackInfo.video", [{}]) || [
      {}
    ];
    const videoInfo = videoInfoList[0];
    const { isScreenShareTrack, trackSid } = videoInfo;

    // SocketActions.pinScreen({
    //   userId: participantInfo.identity,
    //   isScreenShareTrack,
    //   trackSid
    // });
  };

  getGridProps = (nonFloatingParticipants, floatingParticipant = null) => {
    const { isFullScreen, width, height, participants } = this.props;

    const breakpoints = {
      lg: 600
    };
    const cols = {
      lg: TOTAL_COLS
    };

    const isLocalParticipantTeacher = participants.some(
      p => p.isLocalParticipant && p.isTeacher
    );

    const orientation = getOrientation(participants, isFullScreen);

    const gridProps = {
      breakpoints,
      cols,
      margin: [0, 0],
      rowHeight: Math.floor(height / TOTAL_COLS),
      useCSSTransforms: true,
      measureBeforeMount: true,
      isResizable: false,
      isDraggable: false,
      autoSize: false,

      // Responsible for centering method
      compactType: "vertical",
      onBreakpointChange: this.onBreakpointChange,
      __orientation: orientation
    };

    const layouts = Object.keys(breakpoints).reduce((acc, key) => {
      const { layout, calculationOptions } = generateLayout({
        ...this.state,
        participants,
        width,
        height,
        isFullScreen,
        hasFloatingParticipant: !!floatingParticipant,
        isLocalParticipantTeacher
      });
      acc[key] = layout;
      return acc;
    }, {});

    gridProps.layouts = layouts;

    return gridProps;
  };

  renderOneVideoBox = (childGrid, index) => {
    const cx = classnames({
      "is-floating": childGrid._isFloatingParticipant,
      "is-screen-share": childGrid._participant.isSharingScreen,
      "is-student": childGrid._participant.isStudent,
      "is-teacher": childGrid._participant.isTeacher,
      "is-pinned": childGrid._participant.isPinned,
      "is-casting": childGrid._participant.isCasting
    });
    return (
      <div key={childGrid.i}>
        <UserActionRequestDialogContext.Consumer>
          {({ openDialog }) => (
            <VideoBox
              key={childGrid.i}
              openDialog={openDialog}
              onPinClick={this.setPinnedParticipant}
              onCastClick={this.setCastingParticipant}
              className={cx}
              allowControls
              isBigBox={childGrid._isBigBox}
              {...childGrid._participant}
            ></VideoBox>
          )}
        </UserActionRequestDialogContext.Consumer>
      </div>
    );
  };

  render() {
    if (!this.props.height) {
      return null;
    }

    const { floatingParticipant, participants } = this.getParticipants();

    const gridProps = this.getGridProps(participants, floatingParticipant);

    // Only first layout for now
    // If we decide later to have multiple layouts in multiple breakpoints
    // Fetch the one with current breakpoint
    const currentLayout = Object.keys(gridProps.layouts)
      .map(k => gridProps.layouts[k])
      .shift();

    const smallerControls = currentLayout.length > 6;

    const cx = classnames("ui-video-grid", {
      "orientation-horizontal":
        gridProps.__orientation === ORIENTATIONS.HORIZONTAL,
      "orientation-vertical": gridProps.__orientation === ORIENTATIONS.VERTICAL,
      "is-fullscreen": this.props.isFullScreen,
      "with-smaller-controls": smallerControls
    });

    return (
      <>
        <ReactGridLayout className={cx} {...gridProps}>
          {currentLayout.map(this.renderOneVideoBox)}
        </ReactGridLayout>
        {/* {!!floatingParticipant && (
          <FloatingParticipantGrid
            floatingParticipant={floatingParticipant}
            gridProps={gridProps}
            width={this.props.width}
            height={this.props.height}
            orientation={gridProps.__orientation}
          />
        )} */}
        {this.props.children}
      </>
    );
  }
}
