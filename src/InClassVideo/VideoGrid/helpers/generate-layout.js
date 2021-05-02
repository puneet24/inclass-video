import _identity from "lodash/identity";
import _flow from "lodash/flowRight";
import _noop from "lodash/noop";

import { makeDebugLogger } from "../../../../../../helpers/dev-utils";
import * as Modifiers from "./modifiers";

const logger =
  process.env.NODE_ENV === "production"
    ? _noop
    : makeDebugLogger("inclassvideo:grid");

const _withLog = (fn, prefix) => (...args) => {
  const result = fn(...args);
  logger(`${prefix} result`, result);
  return result;
};

/**
 *
 * @param {Array<object>} participants
 * @param {LayoutGenerationPipelineOptions} options
 */
function execLayoutGenerationPipeline(participants, options = {}) {
  const {
    // Modifiers
    // Defaulted to _identity function ( this is just a pass through )
    fnPreProcess = _identity,
    fnGenerateBoxes = _identity,
    fnAssignPriorities = _identity,
    fnIdentifyBoxes = _identity,
    fnSortBoxes = _identity,
    fnCalculateParameters = _identity,
    fnCalculatePositions = _identity,
    fnPostProcess = _identity,

    ...context
  } = options || {};

  context = {
    ...context,
    participants
  };

  // FIFO, first function is executed first
  // Result of each function passed onto the next
  const pipeline = _flow(
    _withLog(fnPreProcess, "fnPreProcess"),
    _withLog(fnGenerateBoxes, "fnGenerateBoxes"),
    _withLog(fnAssignPriorities, "fnAssignPriorities"),
    _withLog(fnIdentifyBoxes, "fnIdentifyBoxes"),
    _withLog(fnSortBoxes, "fnSortBoxes"),
    _withLog(fnCalculateParameters, "fnCalculateParameters"),
    _withLog(fnCalculatePositions, "fnCalculatePositions"),
    _withLog(fnPostProcess, "fnPostProcess")
  );

  context = pipeline(context);
  return context;
}

/**
 *
 * @param {Array<ParticipantData>} participants
 * @param {LayoutMethodOptions} options
 */
const GenerateGridLayout = (
  participants,
  { height, width, pinnedLocalUniqueId }
) => {
  return execLayoutGenerationPipeline(participants, {
    width,
    height,
    pinnedLocalUniqueId,

    fnPreProcess: Modifiers.preProcessData,
    fnGenerateBoxes: Modifiers.generateParticipantBoxes,
    fnAssignPriorities: Modifiers.assignBoxPriorities,
    fnIdentifyBoxes: Modifiers.identifyBoxes,
    fnSortBoxes: Modifiers.sortBoxes,
    fnCalculateParameters: Modifiers.calculateParameters
  });
};

/**
 *
 * @param {Array<ParticipantData>} participants
 * @param {LayoutMethodOptions} options
 */
const GenerateVerticalLayout = (
  participants,
  { height, width, pinnedLocalUniqueId }
) => {
  return execLayoutGenerationPipeline(participants, {
    width,
    height,
    pinnedLocalUniqueId,

    fnPreProcess: Modifiers.preProcessData,
    fnGenerateBoxes: Modifiers.generateParticipantBoxes,
    fnAssignPriorities: Modifiers.assignBoxPriorities,
    fnIdentifyBoxes: Modifiers.identifyBoxes,
    fnSortBoxes: Modifiers.sortBoxes,
    fnCalculateParameters: Modifiers.calculateParameters
  });
};

/**
 *
 * @param {Array<ParticipantData>} participants
 * @param {LayoutMethodOptions} options
 */
const GenerateHorizontalLayout = (
  participants,
  { height, width, pinnedLocalUniqueId }
) => {
  return execLayoutGenerationPipeline(participants, {
    width,
    height,
    pinnedLocalUniqueId,

    fnPreProcess: Modifiers.preProcessData,
    fnGenerateBoxes: Modifiers.generateParticipantBoxes,
    fnAssignPriorities: Modifiers.assignBoxPriorities,
    fnIdentifyBoxes: Modifiers.identifyBoxes,
    fnSortBoxes: Modifiers.sortBoxes,
    fnCalculateParameters: Modifiers.calculateParameters
  });
};

/**
 *
 * @param {Array<ParticipantData>} participants
 * @param {LayoutMethodOptions} options
 */
const GenerateFloatingLayout = (
  participants,
  { height, width, pinnedLocalUniqueId }
) => {
  return execLayoutGenerationPipeline(participants, {
    width,
    height,
    pinnedLocalUniqueId,

    fnPreProcess: Modifiers.preProcessData,
    fnGenerateBoxes: Modifiers.generateParticipantBoxes,
    fnAssignPriorities: Modifiers.assignBoxPriorities,
    fnIdentifyBoxes: Modifiers.identifyBoxes,
    fnSortBoxes: Modifiers.sortBoxes,
    fnCalculateParameters: Modifiers.calculateParameters
  });
};

/**
 *
 * @param {GenerateLayoutOptions} options
 */
export default function generateLayout({
  participants,
  height,
  width,
  isFullScreen,
  hasFloatingParticipant,
  pinnedLocalUniqueId
} = {}) {
  const isLocalParticipantTeacher = participants.some(
    participant => participant.isLocalParticipant && participant.isTeacher
  );
  const isLocalParticipantStudent = participants.some(
    participant => participant.isLocalParticipant && participant.isStudent
  );
  const atLeastOneStudentSharingScreen = participants.some(
    participant => participant.isStudent && participant.isSharingScreen
  );

  let isGridLayout =
    isLocalParticipantTeacher && !atLeastOneStudentSharingScreen;
  let isVerticalLayout =
    !isLocalParticipantTeacher && atLeastOneStudentSharingScreen;
  let isHorizontalLayout = isFullScreen && isLocalParticipantStudent;
  let isFloatingLayout = hasFloatingParticipant && isHorizontalLayout;

  if (isGridLayout) {
    return GenerateGridLayout(participants, {
      width,
      height,
      pinnedLocalUniqueId
    });
  }

  if (isVerticalLayout) {
    return GenerateVerticalLayout(participants, {
      width,
      height,
      pinnedLocalUniqueId
    });
  }

  if (isFloatingLayout) {
    return GenerateFloatingLayout(participants, {
      width,
      height,
      pinnedLocalUniqueId
    });
  }

  return GenerateHorizontalLayout(participant, {
    width,
    height,
    pinnedLocalUniqueId
  });
}
