import React from "react";
import LayoutManager from "./LayoutManager";
import VideoGrid from "./VideoGrid";

export default function VideoGridPOCContainer(props) {
  return (
    <LayoutManager>
      <VideoGrid {...props} />
    </LayoutManager>
  );
}
