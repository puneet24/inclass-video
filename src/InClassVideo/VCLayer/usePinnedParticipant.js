import React, { useState, useEffect } from "react";
import { findByIdentity } from "./common";

export const usePinnedParticipant = participants => {
  const [pin, setPin] = useState(null);
  const [pinnedParticipant, setPinnedParticipant] = useState(null);

  useEffect(() => {
    if (pin) {
      setPinnedParticipant(lastPP => {
        if (lastPP.identity !== pin.identity) {
          return findByIdentity(pin.identity, participants);
        } else {
          return lastPP;
        }
      });
    }
  }, [pin, participants]);

  return [pin, setPin, pinnedParticipant];
};
