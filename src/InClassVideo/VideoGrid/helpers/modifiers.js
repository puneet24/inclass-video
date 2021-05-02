import _round from "lodash/round";
import _get from "lodash/get";
import _groupBy from "lodash/groupBy";
import _partition from "lodash/partition";
import _sortBy from "lodash/sortBy";
import _mapValues from "lodash/mapValues";
import * as Utils from "../utils";

/**
 *
 * @param {LayoutPipelineContext} context
 */
export const preProcessData = context => {
  let isTeacherSharingScreen = false;
  let isLocalParticipantTeacher = false;
  context.participants.forEach(participant => {
    if (
      !isTeacherSharingScreen &&
      participant.isTeacher &&
      participant.isSharingScreen
    ) {
      isTeacherSharingScreen = true;
    }
    if (
      !isLocalParticipantTeacher &&
      participant.isLocalParticipant &&
      participant.isTeacher
    ) {
      isLocalParticipantTeacher = true;
    }
  });

  context.isTeacherSharingScreen = isTeacherSharingScreen;
  context.isLocalParticipantTeacher = isLocalParticipantTeacher;

  return context;
};

/**
 *
 * @param {LayoutPipelineContext} context
 */

export const generateParticipantBoxes = context => {
  const boxes = context.participants.map((participant, index) => {
    const videoInfo = (_get(participant, "trackInfo.video") || [{}])[0];
    const dimensions = {
      width: _get(videoInfo, "dimensions.width") || 640,
      height: _get(videoInfo, "dimensions.height") || 480
    };

    const box = {
      i: `${participant.identity}-${index}`,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      _dimensions: dimensions,
      _aspectRatio: _round(dimensions.width / dimensions.height, 6),
      _participant: participant
    };

    return box;
  });

  context.boxes = boxes;

  // Always return context
  return context;
};

/**
 *
 * @param {LayoutPipelineContext} context
 */
export const assignBoxPriorities = context => {
  const { isTeacherSharingScreen, isLocalParticipantTeacher } = context;
  const uniquePriorities = new Set();
  context.boxes = context.boxes.map(box => {
    box._priority = Utils.getParticipantGridPriority(
      box._participant,
      isTeacherSharingScreen,
      isLocalParticipantTeacher
    );
    uniquePriorities.add(box._priority);
    return box;
  });

  context.uniquePriorities = Array.from(uniquePriorities.values());
  context.lowestPriorityNumber = context.uniquePriorities[0];

  return context;
};

/**
 *
 * @param {LayoutPipelineContext} context
 */
export const identifyBoxes = context => {
  const { boxes, lowestPriorityNumber, uniquePriorities } = context;
  let bigBox = false;
  let smallBoxes = [];

  boxes.forEach(box => {
    // Only one type of participant present
    // Make the first one big by default
    if (uniquePriorities.length < 2 && bigBox === null) {
      bigBox = box;
    } else {
      // bigBox is the highest priority box
      if (box._priority === lowestPriorityNumber && bigBox === null) {
        bigBox = box;
      } else {
        // all others will render as same size boxes in various fitting techniques
        smallBoxes.push(box);
      }
    }
  });

  context.bigBox = bigBox;
  context.smallBoxes = smallBoxes;

  return context;
};

/**
 *
 * @param {LayoutPipelineContext} context
 */
export const sortBoxes = context => {
  const { smallBoxes } = context;

  const [localParticipantBoxes, otherBoxes] = _partition(
    smallBoxes,
    box => box._participant.isLocalParticipant
  );

  const groupedByName = _groupBy(otherBoxes, box => box._participant.name);
  const groupedByBoxType = _mapValues(groupedByName, values => {
    // Order each participant's boxes in this order
    // [screenshare, video]
    return values[0]._participant.isSharingScreen
      ? [values[0], values[1]]
      : [values[1], values[0]];
  });

  const sortedGroupKeys = Object.keys(groupedByBoxType).sort();

  // Populate the correct order
  // You, ...Alphabetical boxes grouped by same participant name
  const sortedBoxes = [...localParticipantBoxes];
  sortedGroupKeys.forEach(key => {
    sortedBoxes.push(groupedByBoxType[key]);
  });

  context.smallBoxes = sortedBoxes;
  return context;
};
