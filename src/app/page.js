'use client'
import styles from './page.module.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const ImageGenerator = () => {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default background color is white
  const [resolution, setResolution] = useState({ width: 800, height: 800 }); // Default resolution
  const [lineSpacing, setLineSpacing] = useState(20);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(18);
  const [tempWidth, setTempWidth] = useState(800);
  const [tempHeight, setTempHeight] = useState(800);
  const canvasRef = useRef();
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [tempP1, setTempP1] = useState(0);
  const [tempP2, setTempP2] = useState(0);

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
      <div className={styles.buttonRow}>
        <div className={styles.row}>
        <button className={styles.button} onClick={() => {
          handleResolutionChange('width', tempWidth)
          handleResolutionChange('height', tempHeight)
        }}>Apply Changes</button>
        <button className={styles.button} onClick={() => {
          setBackgroundColor('#FFFFFF'); // Reset to default white background color
          setTempWidth(800); // Reset to default width
          setTempHeight(800); // Reset to default height
          setLineSpacing(20); // Reset to default line spacing
          setTextColor('#000000'); // Reset to default text color (black)
          setFontSize(16); // Reset to default font size
          handleResolutionChange('width', 800)
          handleResolutionChange('height', 800)
          setScaleX(1);
          setScaleY(1);
        }}>Reset to Default</button>
        <button className={styles.button} onClick={handleDownload}>Download</button>
        </div>
        <div className={styles.row}>
        <button className={styles.button} onClick={() => zoomIn()}>Zoom In</button>
        <button className={styles.button} onClick={() => zoomOut()}>Zoom Out</button>
        <button className={styles.button} onClick={() => resetTransform()}>Reset</button>
        </div>
      </div>
    );
  };
  const handleResolutionChange = (dimension, newValue) => {
    const value = parseInt(newValue, 10); // Ensure the value is an integer
    setResolution(prevResolution => ({
      ...prevResolution,
      [dimension]: value,
    }));
  };
  const handleSetScaleX = (e) => {
    setScaleX(e.target.value);
  }
  const handleSetScaleY = (e) => {
    setScaleY(e.target.value);
  }
  const handleBackgroundColorChange = (e) => {
    setBackgroundColor(e.target.value);
  };
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'graph.jpeg';
    link.href = canvas.toDataURL('graph/jpeg');
    link.click();
  };
  const drawLine = (ctx, startX, startY, endX, endY, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // Clear the canvas
      ctx.clearRect(0, 0, resolution.width, resolution.height);
      // Set the background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, resolution.width, resolution.height);
      // Re-draw the center dot and grid lines to reflect the new lineSpacing
      const centerX = Math.floor(resolution.width / 2);
      const centerY = Math.floor(resolution.height / 2);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = textColor;

      // Draw axis labels and grid lines
      let i = 0;
      for (let x = 0; x <= resolution.width; x += lineSpacing) {
        drawLine(ctx, x, 0, x, resolution.height, i % 5 === 0 ? '#333' : '#ccc'); // Vertical lines
        if (i % 5 === 0) {
          const label = (x - centerX) * scaleY / (5 * lineSpacing);
          ctx.fillText(label.toString(), x, centerY + 20);
        }
        i++;
      }
      i = 0;
      for (let y = 0; y <= resolution.height; y += lineSpacing) {
        drawLine(ctx, 0, y, resolution.width, y, i % 5 === 0 ? '#333' : '#ccc'); // Horizontal lines
        if (i % 5 === 0) {
          const label = -(y - centerY) * scaleX / (5 * lineSpacing);
          if (label === 0) { '' }
          else {
            ctx.fillText(label.toString(), centerX + 1, y);
          }
        }
        i++;
      }
      //axis lines
      drawLine(ctx, 0, centerY, resolution.width, centerY, '#000000'); // X-axis
      drawLine(ctx, centerX, 0, centerX, resolution.height, '#000000'); // Y-axis
      // Draw a dot at ...
      ctx.fillStyle = 'red'; // Dot color
      ctx.beginPath();
      ctx.arc(((resolution.width / 2) + (p1 * 5 * lineSpacing) / scaleY), ((resolution.height / 2) - (p2 * 5 * lineSpacing) / scaleX), 3, 0, Math.PI * 2);
      ctx.fill()
    }
  }, [lineSpacing, backgroundColor, resolution, textColor, fontSize]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <label className={styles.label}>
          Background Color:
          <input className={styles.input} type="color" value={backgroundColor} onChange={handleBackgroundColorChange} />
        </label>
        <label className={styles.label}>
          Text Color:
          <input className={styles.input} type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </label>
        <label className={styles.label}>
          Font Size:
          <input className={styles.input} type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
        </label></div>
      <div className={styles.row}>
        <label className={styles.label}>
          Width:
          <input className={styles.input} type="number" value={tempWidth} onChange={(e) => setTempWidth(e.target.value)} />
        </label>
        <label className={styles.label}>
          Height:
          <input className={styles.input} type="number" value={tempHeight} onChange={(e) => setTempHeight(e.target.value)} />
        </label>
        <label className={styles.label}>
          Scale-X:
          <input className={styles.input} type="number" value={scaleY} onChange={handleSetScaleY} />
        </label>
        <label className={styles.label}>
          Scale-Y:
          <input className={styles.input} type="number" value={scaleX} onChange={handleSetScaleX} />
        </label>
        <label className={styles.label} type="number" value={p1} onChange={(e) => setP1(e.target.value)}>
          insert X
          <input className={styles.input}>
          </input>
        </label>
        <label className={styles.label} type="number" value={p2} onChange={(e) => setP2(e.target.value)}>
          insert Y
          <input className={styles.input}>
          </input>
        </label>
      </div >

      <div className={styles.row}>
        
        <div>
          <TransformWrapper>
            <Controls />
            <TransformComponent>
              <canvas className={styles.canvas} ref={canvasRef} width={resolution.width} height={resolution.height} style={{ backgroundColor }} />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;