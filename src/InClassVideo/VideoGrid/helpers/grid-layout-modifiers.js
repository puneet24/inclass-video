const MAX_X_BOXES = 3;

/**
 *
 * @param {LayoutPipelineContext} context
 */
export const calculateParameters = context => {
  const { boxes, width, height, bigBox, smallboxes } = context;

  let numBoxesInOneRow;
  if (boxes.length <= 3) {
    numBoxesInOneRow = 3;
  } else {
    numBoxesInOneRow = Math.floor(boxes.length / 3);
  }
};
