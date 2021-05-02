import React from "react";
import SelectControl from "../SelectControl";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";

const DeviceSelector = ({
  SELECTIONS = [],
  selectedIO = {},
  selectionMap = {},
  handleUpdate,
  handlePlayAudio
}) => {
  return (
    <>
      <div className={"font22 mb-3 col-12 text-center"}>Your devices</div>
      <div className={"d-flex col-12 p-0 justify-content-between"}>
        {SELECTIONS.map(({ kind, label = "", isSpeaker }, i) => {
          return (
            <div className="col-4 pr-1 d-flex align-items-center">
              {
                <div className={`col-${isSpeaker ? 9 : 12} p-0`}>
                  <SelectControl
                    handleChange={e => handleUpdate(e.target.value, kind)}
                    options={selectionMap[kind] || []}
                    label={label}
                    kind={kind}
                    selected={selectedIO[kind]}
                  />
                </div>
              }
              {isSpeaker && (
                <div
                  onClick={() => handlePlayAudio(selectedIO[kind].deviceId)}
                  className={"col-3 pr-0 cursor_pointer"}
                >
                  <VolumeUpIcon />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DeviceSelector;
