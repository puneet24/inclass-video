import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import VideoBox from "./components/VideoBox";
import { TOTAL_COLS, ORIENTATIONS } from "./utils";
import "./style.scss";

const ReactGridLayout = WidthProvider(Responsive);

const GRID_SPACERS = new Array(15).fill(0).map((x, index) => {
  return {
    i: `spacer-${index}`,
    w: 3,
    h: 3,
    _type: "spacer",
    x: (Math.floor(index / 4) % 4) * 3,
    y: Math.floor(index / 4) * 3
  };
});

export default class FloatingVideoGrid extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
  };
  renderFloatingParticipant = (childGrid, index) => {
    const cx = classnames("ui-floating-participant-video-box");
    if (childGrid._type === "spacer") {
      return (
        <div key={childGrid.i}>
          <div className="ui-floating-grid-spacer"></div>
        </div>
      );
    }
    return (
      <div key={childGrid.i}>
        <VideoBox
          key={childGrid.i}
          className={cx}
          allowControls={false}
          {...childGrid._participant}
        />
      </div>
    );
  };

  render() {
    const { floatingParticipant, height, width, orientation } = this.props;
    if (!this.props.height || !floatingParticipant) {
      return null;
    }

    const cx = classnames("ui-video-grid ui-floating-video-grid", {
      "orientation-horizontal": orientation === ORIENTATIONS.HORIZONTAL,
      "orientation-vertical": orientation === ORIENTATIONS.VERTICAL
    });

    const gridProps = {
      breakpoints: { lg: 600 },
      cols: { lg: TOTAL_COLS },
      margin: [1, 1],
      rowHeight: Math.floor(height / TOTAL_COLS),
      useCSSTransforms: true,
      measureBeforeMount: true,
      isResizable: false,
      isDraggable: true,
      autoSize: false,
      compactType: "vertical"
    };

    gridProps.layouts = {
      lg: [
        ...GRID_SPACERS,
        {
          i: "floating-participant",
          w: 3,
          h: 3,
          y: 9,
          x: 9,
          _participant: floatingParticipant
        }
      ]
    };

    return (
      <>
        <ReactGridLayout className={cx} {...gridProps}>
          {gridProps.layouts.lg.map(this.renderFloatingParticipant)}
        </ReactGridLayout>
      </>
    );
  }
}
