import React from "react";
import ButtonComponent from "../../../../../components/buttons/ButtonComponent";

export const SettingInstructionsHeader = ({ text = "" }) => {
  return <div>{text}</div>;
};

export const SettingInstructionsSubHeader = ({
  text = "",
  className = "mt-2 mb-3"
}) => {
  return <div className={className}>{text}</div>;
};

export const SettingInstructionsConfirm = ({ label = "", handleClick }) => {
  return (
    <ButtonComponent
      text={label}
      background={"#1a73e8"}
      buttonClass={"font16 heading_bold p-2 px-4 border_radius5"}
      color={"#ffffff"}
      border={"none"}
      onClick={handleClick}
    />
  );
};
