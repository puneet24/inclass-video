import React, { useState } from "react";
import VideoSettingsV2 from "./VideoSettingsV2";

import { SettingsDialogContext } from "./index";

export default function VideoSettingsDialogContainer(props) {
  const [selectedIO, setSelectedIO] = useState({});
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const DEFAULT_DIALOG_PROPS = {
    title: "Settings",
    content: "Dialog Content",
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
    setSelectedIO(e);
    setDialogProps({ ...DEFAULT_DIALOG_PROPS });
    setDialogIsOpen(false);
  };

  const openDialog = providedProps => {
    let dialogProps = { ...DEFAULT_DIALOG_PROPS, ...providedProps };
    setDialogProps(dialogProps);
    setDialogIsOpen(true);
  };

  return (
    <SettingsDialogContext.Provider value={{ openDialog }}>
      {dialogIsOpen && (
        <VideoSettingsV2
          {...dialogProps}
          selectedIOOptions={selectedIO}
          onConfirm={onConfirmDialog}
          onCancel={onCancelDialog}
        />
      )}
      {props.children}
    </SettingsDialogContext.Provider>
  );
}
