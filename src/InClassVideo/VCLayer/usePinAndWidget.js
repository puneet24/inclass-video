import React, { useEffect, useState } from "react";

export const usePinAndWidget = (
  oneToOne,
  oneToTwo,
  oneToMany,
  userIsTeacher,
  participants = [],
  teacherIdentity,
  participantVideoTrackCount,
  isSlideshowOn,
  broadcast,
  totalVideoTrackCount = 0,
  communication,
  getIdentityInfo
) => {
  // #############################################################################################################
  // #############################################################################################################
  // Broadcast Logic
  // #############################################################################################################
  // #############################################################################################################
  // CASES:
  // 1. ONE_TO_ONE  => No
  // 2. ONE_TO_TWO  => No
  // 3. ONE_TO_MANY => Yes
  // #############################################################################################################
  // #############################################################################################################
  // Breakout Room Logic
  // #############################################################################################################
  // #############################################################################################################
  // CASES:
  // 1. ONE_TO_ONE  => No
  // 2. ONE_TO_TWO  => No
  // 3. ONE_TO_MANY => Yes
  // #############################################################################################################
  // #############################################################################################################
  // Video Pinning Logic
  // #############################################################################################################
  // #############################################################################################################
  // CASES:
  // 1. ONE_TO_ONE
  //    a. Student => Handled by V2 UI.
  //    b. Teacher => By default teacher should see himself and if student is in class he should see student.
  // 2. ONE_TO_TWO
  //    a. Student => Handled by V2 UI.
  //    b. Teacher => By default teacher should see himself as pinned and can not unpin pinned video because in
  //                  this layout there always needs to be a pinned video. He can only pin another video to
  //                  change the pin.
  // 3. ONE_TO_MANY
  //    a. Student => By default student should see "Waiting for teacher to join" screen and if teacher joined
  //                  he should see the teachers screen share or webcam in this order.
  //    b. Teacher => By default teacher should have no pin. Teacher sees breakout room grid layout. (The one with
  //                  "Create Breakout Room" button)
  // #############################################################################################################
  // #############################################################################################################
  // Widget Logic
  // #############################################################################################################
  // #############################################################################################################
  // CASES:
  // 1. ONE_TO_ONE
  //    a. Student => Will see V2 UI which dose not have widget.
  //    b. Teacher => 1. Widget should show only when slideshow is on or manual pin. When slideshow is off we should
  //                  reset pin as above logic.
  //                  2. Teacher should see the student in the main component and herself in the widget. (v2)
  //                  3. Any action eg: slideshow should open widget with teacher and student video in the widget
  // 2. ONE_TO_TWO
  //    a. Student => Will see V2 UI which dose not have widget.
  //    b. Teacher => Widget should show only when slideshow is on or manual pin. When slideshow is off we should
  //                  reset pin as above logic.
  // 3. ONE_TO_MANY
  //    a. Student => Widget should show when slideshow is on, teacher presents screen, teacher broadcast.
  //                  When slideshow is off we should reset pin as above logic.
  //    b. Teacher => Widget should show when slideshow is on or manual pin. When slideshow is off we should
  //                  reset pin as above logic.
  // #############################################################################################################
  // #############################################################################################################

  const [pin, setPin] = useState(null);
  const [widget, setWidget] = useState(false);

  // ONE_TO_ONE

  useEffect(() => {
    if (oneToOne && !isSlideshowOn && userIsTeacher) {
      if (participants.length === 1) {
        setPin({ identity: participants[0].identity, track: "webcam" });
      }
      if (participants.length > 1) {
        const student = participants.slice(1).find(({ identity }) => {
          const info = getIdentityInfo(identity);
          return info.id;
        });
        if (student && communication[student.identity]) {
          setPin({
            identity: student.identity,
            track: communication[student.identity].isScreenOn
              ? "screen"
              : "webcam"
          });
        }
      }
    }
  }, [
    oneToOne,
    participants,
    communication,
    isSlideshowOn,
    userIsTeacher,
    totalVideoTrackCount
  ]);

  useEffect(() => {
    if (oneToOne && !isSlideshowOn && !userIsTeacher && teacherIdentity) {
      if (communication && communication[teacherIdentity]) {
        setPin({
          identity: teacherIdentity,
          track: communication[teacherIdentity].isScreenOn ? "screen" : "webcam"
        });
      }
    }
  }, [
    oneToOne,
    communication,
    isSlideshowOn,
    userIsTeacher,
    totalVideoTrackCount,
    teacherIdentity
  ]);

  // ONE_TO_TWO

  useEffect(() => {
    if (oneToTwo && !widget && userIsTeacher && participants.length) {
      setPin({ identity: participants[0].identity, track: "webcam" });
    }
  }, [oneToTwo, userIsTeacher, participants, widget, totalVideoTrackCount]);

  useEffect(() => {
    if (
      oneToTwo &&
      !widget &&
      !userIsTeacher &&
      teacherIdentity &&
      communication[teacherIdentity]
    ) {
      setPin({
        identity: teacherIdentity,
        track: communication[teacherIdentity].isScreenOn ? "screen" : "webcam"
      });
    }
  }, [
    oneToTwo,
    userIsTeacher,
    teacherIdentity,
    totalVideoTrackCount,
    communication,
    widget
  ]);

  // ONE_TO_MANY

  useEffect(() => {
    if (
      oneToMany &&
      !widget &&
      !userIsTeacher &&
      teacherIdentity &&
      !broadcast
    ) {
      setPin({
        identity: teacherIdentity,
        track:
          participantVideoTrackCount[teacherIdentity] > 1 ? "screen" : "webcam"
      });
    }
  }, [
    oneToMany,
    userIsTeacher,
    teacherIdentity,
    participantVideoTrackCount,
    widget,
    totalVideoTrackCount,
    broadcast
  ]);

  useEffect(() => {
    if (isSlideshowOn) {
      setWidget(true);
      setPin(null);
    } else {
      setWidget(false);
    }
  }, [isSlideshowOn]);

  useEffect(() => {
    if (userIsTeacher) {
      if (oneToMany && pin) {
        setWidget(true);
      } else {
        setWidget(false);
      }
    }
  }, [oneToMany, pin, userIsTeacher]);

  return [pin, setPin, widget, setWidget];
};
