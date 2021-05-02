import React from "react";
import TeacherNotJoined from "./../../common/TeacherNotJoined";

const styles = {
  bigBox: {
    width: "100%",
    height: "100%"
  }
};

export const BigBox = ({ pin = null, getParticipant }) => {
  return (
    <div style={styles.bigBox}>
      {pin ? (
        getParticipant({
          participant: pin,
          containerStyles: { width: "100%", height: "100%" },
          usedForPin: true,
          forceAllowUnpin: true
        })
      ) : (
        <TeacherNotJoined />
      )}
    </div>
  );
};
