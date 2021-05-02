import styled from "styled-components";

const pumpkinOrange = "#fb7a27";

export const StyledTextContainer = styled.span`
  color: ${props => props.color || pumpkinOrange};
`;
