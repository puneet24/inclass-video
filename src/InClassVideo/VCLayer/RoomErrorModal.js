import React, { useEffect, useRef, useState } from "react";
import WarningIcon from "@material-ui/icons/Warning";
import RoomErros from "./RoomErrors";

export const RoomErrorModal = ({ errorInfo, styleClass = "" }) => {
  const styles = {
    warningIcon: {
      color: "orange",
      fontSize: "40px",
      textAlign: "center"
    },
    roomErrorContainer: {
      padding: 25,
      background: "white",
      borderRadius: "6px",
      width: "95%",
      margin: "0 auto",
      maxHeight: "95%",
      overflowY: "auto"
    },
    errorMainMessage: {
      textAlign: "center",
      fontWeight: 800
    },
    section: {
      marginTop: "20px"
    },
    sectionheading: {
      fontWeight: 600
    }
  };

  const roomErrorInformation = RoomErros[errorInfo.name]
    ? RoomErros[errorInfo.name]
    : {
        cause: [],
        solution: [
          "User should close all other apps and tabs that have reserved the input device and reload your app, or worst case, restart the browser"
        ]
      };

  return (
    <div className={`d-flex align-items-center h-100 ${styleClass}`}>
      <div style={styles.roomErrorContainer}>
        <div style={styles.warningIcon}>
          <WarningIcon style={styles.warningIcon}></WarningIcon>
        </div>
        <h4 style={styles.errorMainMessage}>{errorInfo.message}</h4>
        {roomErrorInformation.cause.length > 0 && (
          <div style={styles.section}>
            <h6 style={styles.sectionheading}>Why this error?</h6>
            {roomErrorInformation.cause.map((cause, index) => (
              <div key={`cause_${index}`}>{`${index + 1}. ${cause}.`}</div>
            ))}
          </div>
        )}
        {roomErrorInformation.solution.length > 0 && (
          <div style={styles.section}>
            <h6 style={styles.sectionheading}>How can you resolve it?</h6>
            {roomErrorInformation.solution.map((solution, index) => (
              <div key={`solution_${index}`}>{`${index +
                1}. ${solution}.`}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
