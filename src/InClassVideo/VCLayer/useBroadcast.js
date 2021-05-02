import React, { useEffect, useState } from "react";
//import SocketService from "../../../../services/socket/index";
//import * as SocketActions from "../../../../services/socket/actions";

export const useBroadcast = (init = null) => {
  const [broadcast, setBroadcast] = useState(init);

  const sendBroadcast = v => {
    setBroadcast(v);
    //SocketActions.broadCastVideo(v);
  };

  useEffect(() => {
    const onUpdate = ({ payload = {} }) => {
      setBroadcast(payload.state);
    };

    //SocketService.onEvent(`COMMAND:BROADCAST_SCREEN`, onUpdate);
    return () => {
      //SocketService.off(`COMMAND:BROADCAST_SCREEN`, onUpdate);
    };
  }, []);

  return [broadcast, sendBroadcast];
};
