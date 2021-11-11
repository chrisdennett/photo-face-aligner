import React from "react";
import { saveAs } from "file-saver";

export const CanvasSaver = ({ sourceCanvas, filename = "artfly-thing" }) => {
  const onSave = () => {
    if (!sourceCanvas) return;
    sourceCanvas.toBlob(
      (blob) => {
        saveAs(blob, `${filename}.jpg`);
      },
      "image/jpeg",
      0.95
    );
  };

  return (
    <button onClick={onSave} style={{ opacity: sourceCanvas ? 1 : 0.3 }}>
      Save Canvas
    </button>
  );
};
