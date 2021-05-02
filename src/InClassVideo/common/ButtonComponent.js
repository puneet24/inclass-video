import React from "react";
import styled from "styled-components";
const StyledButton = styled.button`
  background: ${props =>
    props.disabled ? "#e7e7e7" : props.background || "#fff"};
  border: ${props => props.border || ""};
  color: ${props => (props.disabled ? "#bcb9b9" : props.color)};
  transition: 0.3s ease-in;
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")}
  :hover {
    color: ${props => (props.disabled ? "none" : props.color)}!important;
  }
  outline: none !important;
`;
const ButtonComponent = props => {
  const {
    text = "",
    icon = null,
    onClick,
    background = null,
    color = "#fb7a27",
    buttonClass = "font16 heading_bold p-3 px-4 border_radius5",
    border = "1px solid #fb7a27",
    disable = false,
    disabled = false,
    children
  } = props;
  return (
    <StyledButton
      className={buttonClass}
      onClick={onClick ? onClick : undefined}
      background={background}
      color={color}
      border={border}
      disabled={disable || disabled}
    >
      {icon}
      {text}
      {children}
    </StyledButton>
  );
};

export default ButtonComponent;
