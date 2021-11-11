import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "@mantine/core";
import styles from "./faceSplicer.module.css";
import { fetchJsonData } from "./helpers/fetchJsonData";
import Draggable from "react-draggable";
import { CanvasSaver } from "./canvasSaver";

const picDirectoryPath = "./img/face-splicer/";
const outputWidth = 300;
const outputHeight = 350;

export default function FacePrepper() {
  const [photoData, setPhotoData] = useState([]);
  const [dragStartOffset, setDragStartOffset] = useState(null);
  const [currScale, setCurrScale] = useState(0.32);
  const [currRotate, setCurrRotate] = useState(0.21);
  const [currOffset, setCurrOffset] = useState({ x: 0.26, y: 0.19 });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);

  const canvasRef = useRef(null);
  const guideCanvasRef = useRef(null);

  // draw guide canvas face
  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    const halfX = outputWidth / 2;

    guideCanvas.width = outputWidth;
    guideCanvas.height = outputHeight;
    const ctx = guideCanvas.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    // eyes
    ctx.ellipse(halfX - 45, 150, 35, 20, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(195, 150, 35, 20, 0, 0, 2 * Math.PI);

    // nose
    ctx.moveTo(halfX, 150);
    ctx.lineTo(halfX, 220);
    ctx.lineTo(halfX - 20, 210);
    ctx.moveTo(halfX, 220);
    ctx.lineTo(halfX + 20, 210);
    ctx.stroke();

    // mouth
    ctx.beginPath();
    ctx.moveTo(halfX - 50, 235);
    ctx.quadraticCurveTo(halfX, 290, halfX + 50, 235);
    ctx.lineTo(halfX - 50, 235);
    ctx.stroke();

    // ears
    ctx.beginPath();
    ctx.ellipse(halfX - 100, 170, 15, 45, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(halfX + 100, 170, 15, 45, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }, []);

  // Set tab title and icon
  // useEffect(() => {
  //   document.title = "Face Splicer";
  //   document.getElementById("favicon").href = "./face-splicer.ico";
  // }, []);

  // load the image data
  useEffect(() => {
    fetchJsonData("/data/faceSplicer/data.xml", (data) => {
      setPhotoData(data.images);

      // reminder of values
      console.table(data.images[0]);

      // set default values
      setSelectedPerson(data.images[0].name);
    });
  }, []);

  // set current source image
  useEffect(() => {
    if (!photoData) return;
    if (!selectedPerson) return;

    const person1Data = photoData.find((p) => p.name === selectedPerson);

    if (!person1Data) return;

    // load image 1
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      // let newScale = outputWidth / image.width;
      // if (newScale * image.height < outputHeight) {
      //   newScale = outputHeight / image.height;
      // }

      // setCurrScale(newScale);

      setSourceImage(image);
    };

    image.src = picDirectoryPath + person1Data.fileName;
  }, [photoData, selectedPerson]);

  // create prep canvas
  useEffect(() => {
    if (!sourceImage) return;

    // rotate canvas
    const rotatedCanvas = document.createElement("canvas");
    rotatedCanvas.width = sourceImage.width;
    rotatedCanvas.height = sourceImage.height;
    const rotatedCtx = rotatedCanvas.getContext("2d");
    rotatedCtx.translate(sourceImage.width / 2, sourceImage.height / 2);
    rotatedCtx.rotate(currRotate);
    rotatedCtx.translate(0 - sourceImage.width / 2, 0 - sourceImage.height / 2);
    rotatedCtx.drawImage(sourceImage, 0, 0);

    const canvas = canvasRef.current;
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");

    const srcX = currOffset.x * sourceImage.width;
    const srcY = currOffset.y * sourceImage.height;
    const srcW = rotatedCanvas.width - srcX;
    const srcH = rotatedCanvas.height - srcY;
    const targX = 0;
    const targY = 0;
    const targW = srcW * currScale;
    const targH = srcH * currScale;

    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // ctx.translate(targW / 2, targH / 2);
    // ctx.rotate(Math.PI / 8);
    // ctx.translate(0 - targW / 2, 0 - targH / 2);

    ctx.drawImage(
      rotatedCanvas,
      srcX,
      srcY,
      srcW,
      srcH,
      targX,
      targY,
      targW,
      targH
    );

    //
  }, [sourceImage, currOffset, currScale, currRotate]);

  const names = photoData.map((person) => person.name);

  const handleStartDrag = () => {
    setDragStartOffset({ ...currOffset });
  };

  const handleDrag = (e, dragData) => {
    const { x, y } = dragData;
    const offsetXChange = x / outputWidth;
    const offsetYChange = y / outputHeight;

    setCurrOffset({
      x: dragStartOffset.x - offsetXChange,
      y: dragStartOffset.y - offsetYChange
    });
  };
  // const handleDragStop = (e, dragData) => {
  //   console.log("stop dragData: ", dragData);
  // };

  return (
    <div className={styles.faceSplicer}>
      <h1>Face Prep for Slicing</h1>

      <div className={styles.selectors}>
        <Autocomplete
          label="Person 1"
          placeholder="Pick one"
          value={selectedPerson}
          onChange={setSelectedPerson}
          data={names}
        />
        <label>
          Scale:
          <input
            type="range"
            value={currScale}
            min={0}
            max={1.5}
            step={0.01}
            onChange={(e) => setCurrScale(e.target.value)}
          />
          {parseFloat(currScale).toFixed(2)}
        </label>
        <label>
          Rotate:
          <input
            type="range"
            value={currRotate}
            min={0.01}
            max={Math.PI * 2}
            step={0.01}
            onChange={(e) => setCurrRotate(e.target.value)}
          />
          {parseFloat(currRotate).toFixed(2)}
        </label>
        <div>offset x:{parseFloat(currOffset.x).toFixed(2)}</div>
        <div>offset y:{parseFloat(currOffset.y).toFixed(2)}</div>
        {/* <label>
          xOffset:
          <input
            type="range"
            value={currOffset.x}
            min={0}
            max={0.9}
            step={0.01}
            onChange={(e) => setCurrXOffset(e.target.value)}
          />
          {currOffset.x}
        </label>
        <label>
          yOffset:
          <input
            type="range"
            value={currOffset.y}
            min={0}
            max={0.9}
            step={0.01}
            onChange={(e) => setCurrYOffset(e.target.value)}
          />
          {currOffset.y}
        </label> */}
      </div>

      <div className={styles.canvasHolder}>
        <Draggable
          handle=".handle"
          position={null}
          onStart={handleStartDrag}
          onDrag={handleDrag}
          // onStop={handleDragStop}
          position={{ x: 0, y: 0 }}
        >
          <div className={styles.draggableThing}>
            <div
              className="handle"
              style={{ width: outputWidth, height: outputHeight }}
            />
          </div>
        </Draggable>
        <canvas ref={guideCanvasRef} className={styles.guideCanvas} />
        <canvas ref={canvasRef} />
      </div>

      <CanvasSaver sourceCanvas={canvasRef.current} />

      {sourceImage && (
        <img src={sourceImage.src} alt="source" height={outputHeight} />
      )}
    </div>
  );
}
