import React, { useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import _get from "lodash/get";
import ClassRoomBridge from "./VCLayer/ClassRoomBridge";
import { getIdentityInfo } from "./helpers/utils"

let InClassVideo = ({
  classInterfaceData,
  userIsTeacher = false,
  twilioToken,
  isFullScreen,
  roomName
}) => {
  let {
    vcMeetingId = ""
  } = classInterfaceData || {};

  return <>
    {twilioToken ? (
      <>
        <ClassRoomBridge
          isSlideshowOn={false}
          oneToOne={false}
          oneToTwo={false}
          oneToMany={true}
          twilioToken={twilioToken}
          postVcSessionEvent={() => { }}
          getIdentityInfo={getIdentityInfo}
          userIsTeacher={userIsTeacher}
          updateRoomState={() => { }}
          roomName={roomName}
          isFullScreen={isFullScreen}
          userIsTeacher={userIsTeacher}
          disableBreakout={true}
        />
      </>
    ) : (
      <CircularProgress className="m-auto" color="secondary" />
    )}
  </>
};

export default InClassVideo;
