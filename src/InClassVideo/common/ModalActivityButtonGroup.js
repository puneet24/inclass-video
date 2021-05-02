import { StyledTextContainer } from "./StyledTextContainer";
import ButtonComponent from "./ButtonComponent";
import CircularProgress from "@material-ui/core/CircularProgress";
import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = theme => ({
  [theme.breakpoints.down("sm")]: {
    saveButtonContainer: {
      width: "100%"
    }
  },
  saveButton: {
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  }
});

const ModalActivityButtonGroup = props => {
  const { isRespLoading, isDisabled, secondaryCTA, primaryCTA } = props;

  const b1Props = secondaryCTA || {
    className: "heading_bold font16 cursor_pointer",
    color: "#ff9055",
    text: "BACK"
  };
  const b2Props = primaryCTA || {
    text: "OK",
    buttonClass: `font16 heading_bold p-3 px-4 border_radius5`,
    border: "0"
  };
  b2Props.disable = isDisabled;
  b2Props.color = isDisabled ? "#989595" : "#fff";
  b2Props.background = isDisabled ? "#dedede" : "#ff9055";
  return (
    <div
      className={
        "d-flex align-items-center justify-content-center justify-content-sm-end mt-2"
      }
    >
      {!isRespLoading ? (
        <div
          className={
            "d-flex flex-column justify-content-center justify-content-sm-end flex-sm-row"
          }
        >
          <div
            className={
              "mr-sm-4 mb-3 mb-sm-0 align-items-center justify-content-center d-flex"
            }
          >
            <StyledTextContainer {...b1Props}>
              {b1Props.text || ""}
            </StyledTextContainer>
          </div>
          <div>
            <ButtonComponent {...b2Props} />
          </div>
        </div>
      ) : (
        <CircularProgress color="secondary" />
      )}
    </div>
  );
};

export default withStyles(styles)(ModalActivityButtonGroup);
