import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import green from "@material-ui/core/colors/green";
import amber from "@material-ui/core/colors/amber";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { withStyles } from "@material-ui/core/styles";
import { MySnackbarContentWrapper } from "./snackbar";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const styles1 = theme => ({
  root: {
    width: "100%"
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    //backgroundColor: theme.palette.error.dark
    backgroundColor: "#FF6400"
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  warning: {
    backgroundColor: "#1a91a9"
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
});

const FlashSnackbar = props => {
  const {
    message,
    onClose,
    variant,
    open,
    classes,
    timeout = 4000,
    anchorOrigin = { vertical: "top", horizontal: "center" },
    disableClickAway = false
  } = props;
  const Icon = variantIcon[variant];

  const handleClose = (e, reason) => {
    if (!(disableClickAway && reason === "clickaway")) onClose(e, reason);
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={open}
      autoHideDuration={timeout}
      onClose={handleClose}
      className={classes}
    >
      <MySnackbarContentWrapper
        onClose={handleClose}
        variant={variant}
        message={message}
      />
    </Snackbar>
  );
};

FlashSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.object,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired
};

export default withStyles(styles1)(FlashSnackbar);
