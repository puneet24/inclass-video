import React, { useState, useEffect } from "react";
import { getParticipantVideoTrackCount } from "./twilio";

export const useParticipantTrackCount = (room, fn) => {
  const [participantVideoTrackCount, setParticipantVideoTrackCount] = useState(
    {}
  );

  useEffect(() => {
    setParticipantVideoTrackCount(getParticipantVideoTrackCount(room));

    const trackSubscribed = (track, publication, participant) => {
      if (fn(track)) {
        setParticipantVideoTrackCount(v => ({
          ...v,
          [participant.identity]: getParticipantVideoTrackCount(room)[
            participant.identity
          ]
        }));
      }
    };

    const trackUnsubscribed = (track, publication, participant) => {
      if (fn(track)) {
        setParticipantVideoTrackCount(v => ({
          ...v,
          [participant.identity]: getParticipantVideoTrackCount(room)[
            participant.identity
          ]
        }));
      }
    };

    const trackPublished = () => {
      setParticipantVideoTrackCount(v => ({
        ...v,
        [room.localParticipant.identity]: getParticipantVideoTrackCount(room)[
          room.localParticipant.identity
        ]
      }));
    };

    const trackStopped = () => {
      setParticipantVideoTrackCount(v => ({
        ...v,
        [room.localParticipant.identity]: getParticipantVideoTrackCount(room)[
          room.localParticipant.identity
        ]
      }));
    };

    room.on("trackSubscribed", trackSubscribed);
    room.on("trackUnsubscribed", trackUnsubscribed);
    room.localParticipant.on("trackPublished", trackPublished);
    room.localParticipant.on("trackStopped", trackStopped);
    return () => {
      room.off("trackSubscribed", trackSubscribed);
      room.off("trackUnsubscribed", trackUnsubscribed);
      room.localParticipant.off("trackPublished", trackPublished);
      room.localParticipant.off("trackStopped", trackStopped);
    };
  }, [room]);

  return [participantVideoTrackCount];
};
