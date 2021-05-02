import React from "react";
import styled from "styled-components";
import CircularProgress from "@material-ui/core/CircularProgress";

const StyledTeacherNotJoinedPage = styled.div`
  height: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: #222;

  display: flex;
  align-items: center;
  justify-content: center;

  .teacher-message {
    display: flex;
    align-items: center;
  }
  .message {
    margin-left: 20px;
  }
`;

const TeacherNotJoinedPage = () => {
  return (
    <StyledTeacherNotJoinedPage>
      <div className="inner-section">
        <div className="teacher-message">
          <CircularProgress />
          <div className="text-white message">
            Waiting for teacher to join
          </div>
        </div>
      </div>
    </StyledTeacherNotJoinedPage>
  );
};

export default TeacherNotJoinedPage;
