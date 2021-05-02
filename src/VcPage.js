import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import BaseDialog from "./InClassVideo/common/dialogs/BaseDialog";

import Video from './InClassVideo';
//import Video from "./InClassVideo/VCLayer/VideoChat";
//import StudentClassControlBar from "./InClassVideo/Assets/StudentClassControlBar";
//import TeacherClassControlBar from "./InClassVideo/Assets/TeacherClassControlBar";
import "./styles.scss";

const { v4: uuidv4 } = require("uuid");

export const VCPageSetup = ({ roomDetails, setRoomDetails }) => {
  const [modal, setModal] = useState(null);
  const [username, setusername] = useState(
    roomDetails ? roomDetails.currentUser.name : ""
  );
  const [vcMeetingId, setVcMeetingId] = useState(
    roomDetails ? roomDetails.vcMeetingId : ""
  );
  const [isTeacher, setIsTeacher] = useState(
    roomDetails ? roomDetails.currentUser.isTeacher : false
  );

  const onRoomBtnClick = type => {
    if (type === "create") {
      setVcMeetingId(uuidv4());
    }
    setModal(type);
  };

  const joinRoom = () => {
    const uid = `${uuidv4()}_${username}${isTeacher ? "_teacher" : ""}`;
    setModal(null);
    setRoomDetails({
      currentUser: { id: uid, userId: uid, isTeacher: isTeacher },
      vcMeetingId: vcMeetingId
    });
  };

  return (
    <>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
          }}
        >
          <div style={{ margin: 20 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                onRoomBtnClick("create");
              }}
            >
              CREATE ROOM
            </button>
          </div>
          <div style={{ margin: 20 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                onRoomBtnClick("join");
              }}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
      </div>

      <BaseDialog
        maxWidth={"sm"}
        open={modal}
        onClose={() => {
          setModal(null);
        }}
      >
        <div className="heading3_b mb-5">{`${modal === "create" ? "CREATE" : "JOIN"
          } ROOM`}</div>
        <div>
          <div className="pb-5">
            <TextField
              fullWidth
              className={`m-0 mb-3`}
              label={`Name`}
              placeholder="Enter your name"
              variant={`outlined`}
              onChange={e => {
                setusername(e.target.value);
              }}
              name="name"
              value={username}
            />
            <TextField
              fullWidth
              disabled={modal === "create"}
              className={`m-0 mb-3`}
              label={`VC MeetingId`}
              placeholder="Enter meeting id"
              variant={`outlined`}
              onChange={e => {
                setVcMeetingId(e.target.value);
              }}
              name="vcmeetingid"
              value={vcMeetingId}
            />
            <TextField
              name="role"
              select
              label={`Role`}
              fullWidth
              className={`m-0 mb-3`}
              onChange={e => {
                setIsTeacher(e.target.value === 0 ? true : false);
              }}
              variant={`outlined`}
              value={isTeacher ? 0 : 1}
              margin="normal"
            >
              <MenuItem key={"0"} value={0}>
                Teacher
              </MenuItem>
              <MenuItem key={"1"} value={1}>
                Student
              </MenuItem>
            </TextField>
            <button
              className="btn btn-primary"
              onClick={() => {
                joinRoom();
              }}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
      </BaseDialog>
    </>
  );
};

export const VCPage = ({ getTwilioToken, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [twilioToken, setTwilioToken] = useState(null);
  // useState({
  //     vcMeetingId: 'test',
  //     currentUser: {userId: `${uuidv4()}_ram_teacher`,id: `${uuidv4()}_ram_teacher`, isteacher: true  }
  // });
  const [messages, setMessages] = useState([]);
  const [locale, setLocale] = useState("en");
  const [page, setPage] = useState(0);

  const fetchData = async userId => {
    setIsLoading(true);
    let result = await fetch(`https://sandbox.whjr.one/api/V1/vcAdapter/getTwilioToken?id=${userId}`);
    result = await result.json();
    setTwilioToken(result.data.token)
    console.log(result)
    setIsLoading(false);
    setPage(1);
  };

  useEffect(() => {
    const details = localStorage.getItem("VCPageDetails");
    if (details) {
      setRoomDetails(JSON.parse(details));
    }
  }, []);

  useEffect(() => {
    if (roomDetails) {
      localStorage.setItem("VCPageDetails", JSON.stringify(roomDetails));
      fetchData(roomDetails.currentUser.userId);
    }
  }, [roomDetails]);

  const logout = () => {
    setPage(0);
    localStorage.removeItem("VCPageDetails");
    setRoomDetails(null);
    window.location.reload();
  };

  return (
    <div
      className="class-session-container"
      style={{
        height: "900px",
        background: "lightgrey",
        display: "flex",
        justifyContent: "center",
        alignContent: "ceneter",
        flexDirection: "column"
      }}
    >
      <>
        {!isLoading && page === 0 && (
          <>
            <VCPageSetup
              roomDetails={roomDetails}
              setRoomDetails={roomDetailsParam => {
                setRoomDetails(roomDetailsParam);
                setPage(1);
              }}
            ></VCPageSetup>
          </>
        )}
        {!isLoading && twilioToken && page === 1 && (
          <>
            <div style={{ height: "90%" }}>
              <div style={{ padding: 5, textAlign: "center" }}>
                <span style={{ marginRight: "20px" }}>
                  <b>MeetingID :- {roomDetails.vcMeetingId}</b>
                </span>
                <button
                  className={"btn btn-danger"}
                  onClick={() => {
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
              <Video
                userIsTeacher={true}
                twilioToken={twilioToken}
                isFullScreen={true}
                roomName={roomDetails.vcMeetingId}
              />
            </div>
            {/* {roomDetails && roomDetails.currentUser.isTeacher && (
              <TeacherClassControlBar></TeacherClassControlBar>
            )} */}
            {/* {roomDetails && !roomDetails.currentUser.isTeacher && (
              <StudentClassControlBar
                //classes={classes}
                onToggleFullScreen={() => {}}
                isFullScreen={true}
                isChatWindowVisible={false}
                onChatButtonClick={() => {
                  //   this.setState({
                  //     showChatWindow: !showChatWindow
                  //   });
                }}
              ></StudentClassControlBar>
            )} */}
          </>
        )}
      </>
    </div>
  );
};

export default VCPage;
