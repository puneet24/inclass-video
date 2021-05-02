import React from "react";

import { UserActionRequestDialogContext } from "./UserActionRequestDialog";
import { SettingsDialogContext } from "./VideoSettingsDialog";

// Provides easy to read access to multiple contexts elsewhere in the app
const InClassVideoContextConsumer = ({ children }) => (
  <UserActionRequestDialogContext.Consumer>
    {userActionDialogProps => (
      <SettingsDialogContext.Consumer>
        {settingsDialogProps => {
          return children({
            openUserActionDialog: userActionDialogProps.openDialog,
            openVideoSettingsDialog: settingsDialogProps.openDialog
          });
        }}
      </SettingsDialogContext.Consumer>
    )}
  </UserActionRequestDialogContext.Consumer>
);

export default InClassVideoContextConsumer;
