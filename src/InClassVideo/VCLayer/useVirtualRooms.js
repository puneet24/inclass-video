import { useEffect, useState } from "react";
//import { buildMessage } from "../../../../services/socket/actions";
//import SocketService from "../../../../services/socket/index";
import { mapIdentity, removeAt, insertAt } from "./common";

const updateSocketState = state => {
  // const message = buildMessage({
  //   type: "COMMAND",
  //   payload: {
  //     action: "VIRTUAL_ROOMS",
  //     state,
  //     updateState: true
  //   },
  //   target: "*"
  // });
  //SocketService.sendMessage(message);
};

const requestSocketState = () => {
  // const message = buildMessage({
  //   type: "REQUEST_STATE",
  //   payload: {
  //     action: "GLOBAL_STATE",
  //     state: {}
  //   },
  //   target: "*"
  // });
  //SocketService.sendMessage(message);
};

const onSocketState = cb => {
  // SocketService.onEvent("REQUEST_STATE", ({ payload }) => {
  //   cb(payload.state.virtualRooms || []);
  // });
};

const onSocketChange = cb => {
  // SocketService.onEvent("COMMAND", ({ payload }) => {
  //   if (payload && payload.action === "VIRTUAL_ROOMS") {
  //     cb(payload.state.virtualRooms || []);
  //   }
  // });
};

export const useVirtualRooms = (initial, onLocalChange = () => {}) => {
  const [rooms, setRooms] = useState(initial);

  const removeFromVirtualRooms = (identity, virtualRooms) => {
    return virtualRooms.reduce((vrs, { participants }) => {
      const identities = mapIdentity(participants);
      const inRoom = identities.includes(identity);
      const list = inRoom
        ? participants.filter(p => p.identity !== identity)
        : participants;
      return [...vrs, { participants: list }];
    }, []);
  };

  const removeRoom = i => {
    const newVirtualRooms = removeAt(i, rooms);
    setRooms(newVirtualRooms);
    updateSocketState({ virtualRooms: newVirtualRooms });
    onLocalChange(newVirtualRooms);
  };

  const moveToRoom = (identity, i) => {
    const cleanVirtualRooms = removeFromVirtualRooms(identity, rooms);
    const newVirtualRooms =
      i < 0
        ? cleanVirtualRooms
        : insertAt(i, cleanVirtualRooms, {
            participants: [...cleanVirtualRooms[i].participants, { identity }]
          });
    setRooms(newVirtualRooms);
    updateSocketState({ virtualRooms: newVirtualRooms });
    onLocalChange(newVirtualRooms);
  };

  const addRoom = () => {
    const newVirtualRooms = [...rooms, { participants: [] }];
    setRooms(newVirtualRooms);
    updateSocketState({ virtualRooms: newVirtualRooms });
    onLocalChange(newVirtualRooms);
  };

  useEffect(() => {
    requestSocketState();
    onSocketState(setRooms);
    onSocketChange(setRooms);
  }, []);

  return [rooms, moveToRoom, addRoom, removeRoom];
};
