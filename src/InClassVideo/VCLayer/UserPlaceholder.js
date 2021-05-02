import { UserProfileSvg } from "./UserProfileSvg";
import React from "react";

export const UserPlaceholder = function({ url, name, show }) {
  const styles = {
    video: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#fff",
      marginBottom: "2px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center"
    },
    placeholder: {
      background: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "35%",
      height: "35%",
      borderRadius: "50%"
    }
  };

  return show ? (
    <div style={styles.video}>
      {url ? <div style={styles.placeholder} /> : <UserProfileSvg />}
      <div>{name}</div>
    </div>
  ) : (
    <></>
  );
};
