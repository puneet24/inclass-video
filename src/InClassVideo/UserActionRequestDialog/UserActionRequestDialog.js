import React from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

class UserActionRequestDialog extends React.Component {
  render() {
    const {
      title,
      content,
      showCancelButton,
      onCancel,
      onConfirm,
      confirmText = "Confirm"
    } = this.props;

    return (
      <Dialog
        maxWidth="sm"
        aria-labelledby="confirmation-user-action"
        open
        container={() => document.getElementById("class-session-container")}
      >
        <DialogTitle id="confirmation-user-action">{title}</DialogTitle>
        <DialogContent dividers>{content}</DialogContent>
        <DialogActions>
          {showCancelButton && <Button onClick={onCancel}>Cancel</Button>}
          <Button variant="contained" onClick={onConfirm} color="primary">
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

UserActionRequestDialog.propTypes = {
  title: PropTypes.string,
  content: PropTypes.any,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default UserActionRequestDialog;
