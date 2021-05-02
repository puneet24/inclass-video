import React, { useState } from "react";
import UserActionRequestDialog from "./UserActionRequestDialog";

import { UserActionRequestDialogContext } from "./index";

export default function UserActionRequestDialogContainer(props) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const DEFAULT_DIALOG_PROPS = {
    title: "Dialog Title",
    content: "Dialog Content",
    showCancelButton: true,
    onCancel: () => setDialogIsOpen(false),
    onConfirm: () => setDialogIsOpen(false)
  };

  const [dialogProps, setDialogProps] = useState({ ...DEFAULT_DIALOG_PROPS });

  const onConfirmDialog = e => {
    if (typeof dialogProps.onConfirm === "function") {
      dialogProps.onConfirm(e);
    }
    setDialogIsOpen(false);
  };
  const onCancelDialog = e => {
    if (typeof dialogProps.onCancel === "function") {
      dialogProps.onCancel(e);
    }
    setDialogProps({ ...DEFAULT_DIALOG_PROPS });
    setDialogIsOpen(false);
  };

  const openDialog = providedProps => {
    let dialogProps = { ...DEFAULT_DIALOG_PROPS, ...providedProps };
    setDialogProps(dialogProps);
    setDialogIsOpen(true);
  };

  return (
    <UserActionRequestDialogContext.Provider value={{ openDialog }}>
      {dialogIsOpen && (
        <UserActionRequestDialog
          {...dialogProps}
          onConfirm={onConfirmDialog}
          onCancel={onCancelDialog}
        />
      )}
      {props.children}
    </UserActionRequestDialogContext.Provider>
  );
}
