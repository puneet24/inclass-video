import React from "react";
import Select from "@material-ui/core/Select";
import { MenuItem } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

const SelectControl = ({
  handleChange,
  selected = {},
  options = [],
  label,
  kind
}) => {
  return selected.deviceId ? (
    <div className="select-control">
      <TextField
        label={label || kind}
        id={`select-for-${kind}`}
        className={"select-menu-root w-100"}
        variant="outlined"
        size="small"
        value={selected.deviceId}
        onChange={handleChange}
        select
      >
        {options.map(option => {
          return (
            <MenuItem key={option.deviceId} value={option.deviceId}>
              {option.label}
            </MenuItem>
          );
        })}
      </TextField>
    </div>
  ) : null;
};

export default SelectControl;
