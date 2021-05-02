import React, { useState, useEffect } from "react";
import { getRoomVideosTracks } from "./twilio";

export const useTotalVideoTrackCount = room => {
  const [totalVideoTrackCount, setTotalVideoTrackCount] = useState(0);

  useEffect(() => {
    if (!room) return;
    const videoTracks = getRoomVideosTracks(room);
    setTotalVideoTrackCount(videoTracks.length);
    const addOne = track => {
      if (track.kind !== "audio") {
        setTotalVideoTrackCount(tc => tc + 1);
      }
    };
    const removeOne = track => {
      if (track.kind !== "audio") {
        setTotalVideoTrackCount(tc => tc - 1);
      }
    };
    room.on("trackSubscribed", addOne);
    room.on("trackUnsubscribed", removeOne);
    room.localParticipant.on("trackPublished", addOne);
    room.localParticipant.on("trackStopped", removeOne);
    return () => {
      room.off("trackSubscribed", addOne);
      room.off("trackUnsubscribed", removeOne);
      room.localParticipant.off("trackPublished", addOne);
      room.localParticipant.off("trackStopped", removeOne);
    };
  }, [room]);

  return [totalVideoTrackCount];
};
