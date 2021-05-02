import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import VideoChat from "./VideoChat";
import FlashSnackbar from "./../common/snackbar/FlashSnackbar";
//import DefaultDialog from "../../../../components/dialogs/DefaultDialog";
import participantJoinSound from "./../common/participantJoined.wav";
import { UserActionRequestDialogContext } from "../UserActionRequestDialog";

// import {
//   getParticipantInfoById,
//   isOneToMany,
//   isOneToOne,
//   isOneToTwo
// } from "../../../../helpers/utils";
import { useIntl } from "./../helpers/utils";
import ModalActivityButtonGroup from "./../common/ModalActivityButtonGroup";

const ClassRoomBridge = ({
  roomName,
  isFullScreen,
  isSlideshowOn = false,
  oneToOne = false,
  oneToTwo = false,
  oneToMany = false,
  twilioToken,
  postVcSessionEvent = () => {},
  getIdentityInfo,
  userIsTeacher = false,
  updateRoomState,
  disableBreakout = false,
  children
}) => {
  const intl = useIntl();

  const participantSound = useRef(null);

  const [snackbar, setSnackbar] = useState({
    message: "",
    variant: "info",
    open: false,
    disableClickAway: false,
    timeout: 2000,
    anchorOrigin: { vertical: "top", horizontal: "right" }
  });

  const [broadcastDialog, setBroadcastDialog] = useState({
    message: "",
    open: false,
    onConfirm: () => {}
  });

  return (
    <>
      <UserActionRequestDialogContext.Consumer>
        {({ openDialog }) => (
          <VideoChat
            roomName={roomName}
            isFullScreen={isFullScreen}
            isSlideshowOn={isSlideshowOn}
            oneToOne={oneToOne}
            oneToTwo={oneToTwo}
            oneToMany={oneToMany}
            twilioToken={twilioToken}
            disableBreakout={disableBreakout}
            sendClassSessionEvent={data =>
              postVcSessionEvent(data)
            }
            getIdentityInfo={getIdentityInfo}
            userIsTeacher={userIsTeacher}
            setSnackbar={data => {
              setSnackbar({ ...snackbar, ...data });
            }}
            setBroadcastDialog={data => {
              setBroadcastDialog({ ...broadcastDialog, ...data });
            }}
            playParticipantJoinSound={() => {
              participantSound.current.play();
            }}
            openDialog={openDialog}
            updateRoomState={updateRoomState}
          >
            {children}
          </VideoChat>
        )}
      </UserActionRequestDialogContext.Consumer>

      <audio id="participant-joined" ref={participantSound}>
        <source src={participantJoinSound} />
        Your browser isn't invited for super fun audio time.
      </audio>
      {ReactDOM.createPortal(
        <FlashSnackbar
          {...snackbar}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />,
        document.getElementById(
           "root"
        )
      )}

      {/* <DefaultDialog
        open={broadcastDialog.open}
        classes={{
          container: "d-flex align-items-center justify-content-center"
        }}
        onClose={() => {
          setBroadcastDialog({ ...broadcastDialog, open: false });
        }}
      >
        <div>{broadcastDialog.message}</div>
        <ModalActivityButtonGroup
          primaryCTA={{
            text: intl.formatMessage({
              id: "confirmCta.CONFIRM",
              defaultMessage: "Confirm"
            }),
            buttonClass: `font16 heading_bold p-2 px-4 border_radius5`,
            border: "0",
            onClick: () => {
              broadcastDialog.onConfirm();
              setBroadcastDialog({ ...broadcastDialog, open: false });
            }
          }}
          secondaryCTA={{
            className: "heading_bold font16 cursor_pointer",
            color: "#ff9055",
            text: intl.formatMessage({
              id: "cancelCta.CANCEL",
              defaultMessage: "Cancel"
            }),
            onClick: () => {
              setBroadcastDialog({ ...broadcastDialog, open: false });
            }
          }}
        />
      </DefaultDialog>
     */}
    </>
  );
};

export default ClassRoomBridge;
