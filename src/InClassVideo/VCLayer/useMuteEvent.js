import React, { useEffect } from "react";
//import SocketService from "../../../../services/socket/index";

export const useMuteEvent = (onMute, dependencies = []) => {
  useEffect(() => {
    //SocketService.on(`COMMAND:MUTE_STUDENT`, onMute);
    return () => {
      //SocketService.off(`COMMAND:MUTE_STUDENT`, onMute);
    };
  }, dependencies);
};
