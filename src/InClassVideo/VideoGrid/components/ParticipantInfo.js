import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

const ParticipantInfo = ({
  className,
  name,
  email,
  isTeacher,
  isOperations,
  isLocalParticipant,
  isSharingScreen,
  isStudent
}) => {
  const cx = classnames("ui-participant-info", className);
  const prefix = isTeacher ? "(Teacher)" : isLocalParticipant ? "(You)" : "";

  const text = isSharingScreen
    ? `${isTeacher ? `Teacher` : name || email}'s Screen`
    : `${prefix} ${name || email}`;

  return (
    <div className={cx} title={text}>
      {text}
    </div>
  );
};

ParticipantInfo.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  isTeacher: PropTypes.bool,
  isOperations: PropTypes.bool,
  isStudent: PropTypes.bool
};

export default ParticipantInfo;
