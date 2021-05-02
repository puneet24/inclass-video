/**
 * Terminology:
 *
 * 1.
 */

import React from "react";
import _uniq from "lodash/uniq";
import _identity from "lodash/identity";
import _get from "lodash/get";
import _round from "lodash/round";
import _chunk from "lodash/chunk";
import _partition from "lodash/partition";
import _flatten from "lodash/flatten";
import {
  isLoggedInUserTeacher,
  isPaidTwilioClassOneToOneOROneToTwo
} from "../../../../helpers/utils";
import { makeDebugLogger } from "../../../../helpers/dev-utils";

const debug = makeDebugLogger("inclass:grid-utils");

const DEFAULT_PRIORITY = 10;
const DEFAULT_GRID_PROPS = {
  gridCellWidth: 100,
  gridCellHeight: 100
};

/**
 * @readonly
 * @enum
 */
export const ORIENTATIONS = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL"
};

export const TOTAL_COLS = 12;

const PARTICIPANT_PRIORITY_CHECKS = [
  {
    test: participant => participant.isTeacher && participant.isSharingScreen,
    value: 1
  },
  {
    test: (participant, isTeacherSharingScreen) =>
      !isTeacherSharingScreen && participant._isPinned,
    value: 2
  },
  {
    test: participant => participant.isTeacher,
    value: 3
  },
  {
    test: participant =>
      participant.isStudent &&
      participant.isSharingScreen &&
      !participant.isLocalParticipant,
    value: 4
  },
  {
    test: participant => participant.isStudent,
    value: 5
  }
];

export const getParticipantGridPriority = (
  participant,
  isTeacherSharingScreen,
  isLocalParticipantTeacher
) => {
  const priority = PARTICIPANT_PRIORITY_CHECKS.find(check =>
    check.test(participant, isTeacherSharingScreen, isLocalParticipantTeacher)
  );
  return priority ? priority.value : DEFAULT_PRIORITY;
};

const getCellsPerRow = (
  numParticipants,
  orientation = ORIENTATIONS.HORIZONTAL
) => {
  /**
   *  T T T T S1  or   T T T S1 S2
   *  T T T T S2       T T T S3 S4
   *  T T T T S3       T T T
   *  T T T T S4       T T T
   */
  if (orientation === ORIENTATIONS.HORIZONTAL) {
    return numParticipants > 3 ? 2 : 1;
  }

  /**
   * T  T  T
   * T  T  T
   * S1 S2 S3
   */
  return 6;
};

/**
 *  12 x 12 grid
 *  divisible by 2/3/4
 *
 *
 */

const getBigBoxRatio = (
  orientation = ORIENTATIONS.VERTICAL,
  isFullScreen = false,
  rowsNeeded
) => {
  if (orientation === ORIENTATIONS.VERTICAL) {
    return rowsNeeded === 1 ? 0.8 : 0.7;
  }
  return 0.6;
};

// Initial data for participant box layout
const buildParticipantBox = (
  participant,
  index,
  orientation,
  pinnedLocalUniqueId,
  isTeacherSharingScreen,
  isLocalParticipantTeacher,
  castedLocalUniqueId
) => {
  const priority = getParticipantGridPriority(
    participant,
    isTeacherSharingScreen,
    isLocalParticipantTeacher
  );
  const video = _get(participant, "trackInfo.video") || false;
  const dimensions = video && video.length > 0 ? video[0].dimensions : {};

  const box = {
    i: `${participant.identity}-${index}`,
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    _dimensions: {
      width: (dimensions && dimensions.width) || 320,
      height: (dimensions && dimensions.height) || 240
    },
    _aspectRatio: _round(
      ((dimensions && dimensions.width) || 320) /
        ((dimensions && dimensions.height) || 240),
      4
    ),
    _participant: {
      ...participant,
      orientation,
      isCasting: castedLocalUniqueId === participant.localUniqueId
    },
    _priority: priority
  };

  if (pinnedLocalUniqueId === participant.localUniqueId) {
    box._priority = 1;
    box._participant.isPinned = true;
  }

  return box;
};

/**
 * Identify the big box
 */
const differentiateBoxes = (boxes, pinnedLocalUniqueId) => {
  const prioritySet = new Set(_uniq(boxes.map(box => box._priority)));
  const firstPriority = Array.from(prioritySet.values())[0];
  let bigPinned = false;
  const sortedBoxes = boxes.sort((a, b) => {
    if (a._participant.localUniqueId === pinnedLocalUniqueId) {
      return -1;
    }
    return 1;
  });

  const result = sortedBoxes.reduce(
    (result, box) => {
      let isPinned = pinnedLocalUniqueId === box._participant.localUniqueId;
      if (isPinned && !bigPinned) {
        result.big = box;
        bigPinned = true;
        return result;
      }

      // If the bigger priority is not in room yet
      if (prioritySet.size < 2 && result.big === null) {
        result.big = box;
        return result;
      }

      if (box._priority === firstPriority && result.big === null) {
        result.big = box;
        return result;
      }

      result.others.push(box);
      return result;
    },
    { big: null, others: [] }
  );

  if (result.big) {
    result.big._isBigBox = true;
  }
  return result;
};

/**
 * Decides how the bigbox will be shown
 * B B B B    or    B B B S
 * B B B B          B B B S
 * S S S S          B B B S
 */
export const getOrientation = (participants, isFullScreen) => {
  const localParticipant =
    participants.find(participant => participant.isLocalParticipant) || {};

  if (!localParticipant.isTeacher && isFullScreen) {
    return ORIENTATIONS.HORIZONTAL;
  }

  return ORIENTATIONS.VERTICAL;
};

const getRowsNeeded = (numBoxes, numCellsPerRow, orientation) => {
  if (numBoxes <= numCellsPerRow) {
    return 1;
  }

  const ceil = Math.ceil(numBoxes / numCellsPerRow);

  if (numBoxes % numCellsPerRow === 0) {
    return ceil + 1;
  } else {
    return ceil;
  }
};

export const generateLayout = ({
  participants,
  height,
  width,
  isFullScreen,
  hasFloatingParticipant,
  isLocalParticipantTeacher,
  pinnedLocalUniqueId,
  castedLocalUniqueId
}) => {
  const numParticipants = participants.length;

  const maxXCols = TOTAL_COLS;
  const maxYCols = TOTAL_COLS;

  const orientation = getOrientation(participants, isFullScreen);
  const isTeacherSharingScreen =
    !isLocalParticipantTeacher &&
    participants.some(user => user.isTeacher && user.isSharingScreen);
  const boxes = participants.map((p, index) =>
    buildParticipantBox(
      p,
      index,
      orientation,
      pinnedLocalUniqueId,
      isTeacherSharingScreen,
      isLocalParticipantTeacher,
      castedLocalUniqueId
    )
  );
  const sortedByPriority = boxes.sort(
    (box1, box2) => box1._priority - box2._priority
  );
  const { big, others } = differentiateBoxes(
    sortedByPriority,
    pinnedLocalUniqueId
  );

  /**
   * On TeacherClass instead of showing the bigbox/smallbox layout
   * A simple grid is shown
   */
  const anyParticipantPinned = participants.some(
    participant => participant.localUniqueId === pinnedLocalUniqueId
  );

  let numCellsPerRow = getCellsPerRow(others.length, orientation);
  let rowsNeeded = getRowsNeeded(others.length, numCellsPerRow, orientation);

  let isTeacherBoxNormalSize = false;
  if (
    !isPaidTwilioClassOneToOneOROneToTwo() &&
    big._participant.isTeacher &&
    isLocalParticipantTeacher
  ) {
    isTeacherBoxNormalSize = true;
  } else if (isLocalParticipantTeacher && participants.length === 1) {
    isTeacherBoxNormalSize = true;
  }

  if (
    orientation === ORIENTATIONS.VERTICAL &&
    others.length === 12 &&
    !isTeacherBoxNormalSize &&
    rowsNeeded > 2
  ) {
    rowsNeeded = 2;
  } else if (
    orientation === ORIENTATIONS.VERTICAL &&
    others.length > 12 &&
    !isTeacherBoxNormalSize &&
    rowsNeeded !== 3
  ) {
    rowsNeeded = 3;
  }

  /**
   * We need to re-adjust the parameters for teacher grid ( non-fullscreen )
   */
  if (isTeacherBoxNormalSize) {
    // numCellsPerRow = participants.length < 3 ? 2 : 3;
    // rowsNeeded = getRowsNeeded(others.length + 1, numCellsPerRow, orientation);
    numCellsPerRow = participants.length < 3 ? 2 : 4;
    rowsNeeded =
      participants.length + 1 <= numCellsPerRow
        ? 1
        : Math.ceil(participants.length / numCellsPerRow) === 1
        ? 2
        : Math.ceil(participants.length / numCellsPerRow);
  }

  const bigBoxRatio = getBigBoxRatio(orientation, isFullScreen, rowsNeeded);

  const fitLayoutOptions = {
    maxXCols,
    maxYCols,
    bigBox: big,
    others,
    numCellsPerRow,
    rowsNeeded,
    width,
    height,
    orientation,
    bigBoxRatio,
    hasFloatingParticipant,
    isLocalParticipantTeacher,
    isTeacherBoxNormalSize,
    anyParticipantPinned,
    pinnedLocalUniqueId,
    participants,
    isFullScreen
  };
  let fittedLayoutList = fitLayout(fitLayoutOptions);

  if (hasFloatingParticipant) {
    fittedLayoutList = fittedLayoutList.map(layout => {
      if (layout._isBigBox && layout._participant.isSharingScreen) {
        layout.w = 12;
        layout.h = 12;
        layout.minW = 12;
        layout.minH = 12;
      } else {
        layout.w = 0;
        layout.h = 0;
      }
      return layout;
    });
  }

  debug("final-layout", { ...fitLayoutOptions, fittedLayoutList });

  return {
    layout: fittedLayoutList,
    calculationOptions: fitLayoutOptions
  };
};

/**
 * Horizontally centers the row
 */
const centerFitRow = (row, maxXCols) => {
  const oneRowWidth = row.reduce((sum, box) => sum + box.w, 0);
  const offset = _round((maxXCols - oneRowWidth) / 2, 2);
  row = row.map((box, index) => {
    box.x = offset + box.x;
    return box;
  });
  return row;
};

/**
 * Scales box width optimistically=
 * Default is to scale the box with aspect ratio of the playing video
 * ( not the video element, but the aspect ratio of video stream )
 *
 * If the aspect ratios of boxes become more than available width
 * Clamp the max width of boxes by 20%
 *
 * Could be used for better looking crops in the grid
 */
const scaleAvailableBoxWidth = (box, numCellsPerRow) => {
  const expectedWidth = _round(box.h * box._aspectRatio, 2);
  const totalXColsTaken = expectedWidth * numCellsPerRow;
  if (totalXColsTaken >= TOTAL_COLS) {
    return _round(box.h * (box._aspectRatio * 0.8), 2);
  }
  return expectedWidth;
};

// Box takes max space in both x and y
const maximizeBox = (box, maxXCols, maxYCols) => {
  box.h = maxYCols;
  box.w = maxXCols;
  box.minW = box.w;
  box.maxW = box.w;
  box.minH = box.h;
  box.maxH = box.h;
  box.x = 0;
  box.y = 0;

  return box;
};

/**
 *
 * @param {Array<Box>} others
 * @param {*} bigBox
 * @param {*} maxXCols
 * @param {*} maxYCols
 * @param {*} bigBoxRatio
 * @param {*} orientation
 */
const getBigBoxDimensions = (
  others,
  bigBox,
  maxXCols,
  maxYCols,
  bigBoxRatio,
  orientation
) => {
  // Single participant is present
  // Maximize the bigbox
  if (!others.length) {
    return maximizeBox(bigBox, maxXCols, maxYCols);
  }

  if (orientation === ORIENTATIONS.VERTICAL) {
    bigBox.h = _round(maxYCols * bigBoxRatio, 2);
    bigBox.w = _round(maxXCols);
    bigBox.minW = bigBox.w;
    bigBox.maxH = bigBox.h;
    bigBox.minH = bigBox.h;
    bigBox.x = 0;
    bigBox.y = 0;
  }
  if (orientation === ORIENTATIONS.HORIZONTAL) {
    bigBox.h = _round(maxYCols);
    bigBox.w = _round(maxXCols * bigBoxRatio, 2);
    bigBox.minW = bigBox.w;
    bigBox.maxH = bigBox.h;
    bigBox.minH = bigBox.h;
    bigBox.x = 0;
    bigBox.y = 0;
  }

  return bigBox;
};

// const positionOneSmallBox = (box, index) => {
//   box.w = _round(maxXCols / widthDivider, 2);
//     // box.h = _round((box.w / box._aspectRatio)/rowsNeeded, 2);
//   box.h = _round((maxYCols * (1 - bigBoxRatio)) / rowsNeeded, 2);
//   // box.w = _round(box.h * (box._aspectRatio * 0.8), 2);
//   // box.w = scaleAvailableBoxWidth(box, numCellsPerRow);
//   box.x = box.w * Math.floor(index % numCellsPerRow);
//   // box.x = 0
//   if (bigBox) {
//     box.y = bigBox.h + Math.floor(index / numCellsPerRow) * box.h;
//   } else {
//     box.y = Math.floor(index / numCellsPerRow) * box.h;
//   }
//   return box;
// }

const positionVerticalOneBox = (
  box,
  index,
  {
    bigBox,
    widthDivider,
    othersLength,
    maxXCols,
    maxYCols,
    bigBoxRatio,
    rowsNeeded,
    numCellsPerRow
  }
) => {
  box.w = _round(maxXCols / widthDivider, 2);
  if (bigBox) {
    box.h = _round((maxYCols * (1 - bigBoxRatio)) / rowsNeeded, 2);
  } else {
    box.h = _round(maxYCols / (othersLength <= 3 ? 2 : rowsNeeded), 2);
  }

  box.x = box.w * Math.floor(index % numCellsPerRow);
  if (bigBox) {
    box.y = bigBox.h + Math.floor(index / numCellsPerRow) * box.h;
  } else {
    box.y = Math.floor(index / numCellsPerRow) * box.h;
  }
  return box;
};

const positionHorizontalOneBox = (
  box,
  index,
  {
    bigBox,
    heightDivider,
    maxXCols,
    maxYCols,
    bigBoxRatio,
    rowsNeeded,
    numCellsPerRow
  }
) => {
  box.h = _round(maxYCols / heightDivider, 2);
  box.w = _round((maxXCols * (1 - bigBoxRatio)) / numCellsPerRow, 2);
  box.y = (box.h * Math.floor(index / numCellsPerRow)) % numCellsPerRow;

  if (bigBox) {
    box.x = bigBox.w + Math.floor(index % numCellsPerRow) * box.w;
  } else {
    box.x = Math.floor(index / numCellsPerRow) * box.w;
  }
  return box;
};

const cropFitBigBox = (bigBox, orientation, numCellsPerRow) => {
  if (orientation === ORIENTATIONS.HORIZONTAL) {
    return bigBox;
  }
  const isScreenShare = bigBox._participant.isSharingScreen;
  bigBox.w = scaleAvailableBoxWidth(bigBox, numCellsPerRow);
  return bigBox;
};

const cropFitOneRow = (row, orientation, numCellsPerRow) => {
  return row.map(box => {
    box.w = scaleAvailableBoxWidth(box, numCellsPerRow);
    return box;
  });
};

const fitLayout = ({
  maxXCols,
  maxYCols,
  numCellsPerRow,
  rowsNeeded,
  bigBox,
  others,
  orientation,
  bigBoxRatio,
  isTeacherBoxNormalSize,
  isLocalParticipantTeacher,
  anyParticipantPinned,
  participants
}) => {
  // All boxes would get the same treatment
  if (isTeacherBoxNormalSize) {
    others.unshift(bigBox);
    bigBox = null;
  }

  // Group each users screen share and video
  // Sorting will be done on group instead of individual boxes
  // Group has a certain order too. ( screen-share and then video )
  const screenGroups = others.reduce((result, otherBox) => {
    let key = otherBox._participant.identity;
    let isScreenShareKey = otherBox._participant.isSharingScreen
      ? "screen"
      : "video";
    result[key] = {
      ...result[key],
      name: otherBox._participant.name,
      [isScreenShareKey]: otherBox
    };
    return result;
  }, {});

  // Alphabetical sort on students
  // LoggedIn student group will always be shown first
  let screenGroupsArray = Object.keys(screenGroups).map(key => {
    return [
      (screenGroups[key].screen || screenGroups[key].video)._participant,
      screenGroups[key].screen,
      screenGroups[key].video
    ];
  });

  screenGroupsArray = screenGroupsArray.sort((a, b) => {
    if (a[0].isLocalParticipant && !a[0].isTeacher) {
      return -1;
    }
    return (a[0].name || "").toLowerCase() > (b[0].name || "").toLowerCase()
      ? 1
      : -1;
  });

  others = _flatten(
    screenGroupsArray.map(groupArray => [groupArray[1], groupArray[2]])
  ).filter(_identity);

  // If this is a bigbox/smallbox layout
  // Set position/scale for the bigger box
  // Smaller boxes are positioned and scaled relative to this
  if (bigBox) {
    bigBox = getBigBoxDimensions(
      others,
      bigBox,
      maxXCols,
      maxYCols,
      bigBoxRatio,
      orientation
    );
  }

  // For vertical layouts
  // How much divisions should be present horizontally
  let widthDivider = Math.min(others.length, numCellsPerRow);
  if (widthDivider < 3 && isTeacherBoxNormalSize) {
    widthDivider = numCellsPerRow;
  } else if (!isTeacherBoxNormalSize) {
    widthDivider = 6;
  }

  // For horizontal layouts
  // How much divions should be present vertically
  let heightDivider = Math.min(others.length, rowsNeeded);
  if (heightDivider < 3) {
    heightDivider = others.length < 3 ? others.length : rowsNeeded;
  }

  // Position the smaller boxes
  others = others.map((box, index) => {
    if (orientation === ORIENTATIONS.VERTICAL) {
      return positionVerticalOneBox(box, index, {
        bigBox,
        othersLength: others.length,
        widthDivider,
        maxXCols,
        maxYCols,
        bigBoxRatio,
        rowsNeeded,
        numCellsPerRow
      });
    } else {
      return positionHorizontalOneBox(box, index, {
        bigBox,
        othersLength: others.length,
        heightDivider,
        maxXCols,
        maxYCols,
        bigBoxRatio,
        rowsNeeded,
        numCellsPerRow
      });
    }
  });

  // CropFitting
  if (bigBox && orientation === ORIENTATIONS.VERTICAL) {
    bigBox = cropFitBigBox(bigBox, orientation, 1);
  }

  if (rows) {
    rows = rows.map(row => cropFitOneRow(row, orientation, numCellsPerRow));
  }

  if (bigBox && orientation === ORIENTATIONS.VERTICAL) {
    bigBox = centerFitRow([bigBox], maxXCols);
  }

  // For vertical layouts
  let rows = _chunk(others, numCellsPerRow).map(row => {
    if (isTeacherBoxNormalSize) {
      return row;
    } else if (orientation === ORIENTATIONS.HORIZONTAL) {
      return row;
    } else {
      return centerFitRow(row, maxXCols);
    }
  });

  const fittedLayout = _flatten([bigBox, ...rows].filter(_identity));
  return fittedLayout;
};
