import React from "react";
import VideoSettingsDialogProvider from "./VideoSettingsDialog";
import UserActionRequestDialogProvider from "./UserActionRequestDialog";

const InClassVideoContextProviders = ({ children }) => (
  <UserActionRequestDialogProvider>
    <VideoSettingsDialogProvider>{children}</VideoSettingsDialogProvider>
  </UserActionRequestDialogProvider>
);

export default InClassVideoContextProviders;
