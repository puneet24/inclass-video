import React, { useEffect } from "react";
//import SocketService from "../../../../services/socket/index";

export const useScreenShareEvent = (onScreenShare, dependencies) => {
  useEffect(() => {
    //SocketService.on(`COMMAND:SCREEN_SHARE`, onScreenShare);
    return () => {
      //SocketService.off(`COMMAND:SCREEN_SHARE`, onScreenShare);
    };
  }, dependencies);
};
