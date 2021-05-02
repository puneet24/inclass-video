import React, { useEffect, useRef, useState } from "react";

export const DragMe = ({ style = {}, children, show = true }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState(null);
  const [mouseDown, setMouseDown] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const container = useRef(null);

  const onMouseDown = ({ pageX, pageY }) => {
    const { left, top } = container.current.getBoundingClientRect();
    setOffset({
      x: pageX - left,
      y: pageY - top
    });
    setMouseDown(true);
  };

  const onMouseUp = () => {
    setMouseDown(false);
  };

  useEffect(() => {
    setRect(container.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (mouseDown) {
      const onMouseMove = ({ pageX, pageY }) => {
        setTranslate({
          x: pageX - rect.left - offset.x,
          y: pageY - rect.top - offset.y
        });
      };
      document.addEventListener("mousemove", onMouseMove);
      return () => {
        document.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [mouseDown, rect, offset]);

  return (
    <div
      ref={container}
      style={{
        ...style,
        transform: `translate(${translate.x}px,${translate.y}px)`,
        userSelect: "none"
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {show ? children : <></>}
    </div>
  );
};
