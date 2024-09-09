import { useState } from "react";
import Draggable from "react-draggable";
import styles from "./window.module.css";
import { Resizable } from "re-resizable";

interface WindowProps {
  title: string;
  onClose: () => void;
}

export default function Window({ title, onClose }: WindowProps) {
  const [dragging, setDragging] = useState(false);

  const handleStart = () => {
    setDragging(true);
  };

  const handleStop = () => {
    setDragging(false);
  };

  const [size, setSize] = useState({ width: 800, height: 400 });

  return (
    <Draggable
      handle={`.${styles.windowHeader}`} // Drag only the header
      bounds="body"
      onStart={handleStart}
      onStop={handleStop}
    >
      <div className={styles.window}>
        <Resizable
          size={size}
          onResizeStop={(e, direction, ref, d) => {
            setSize({
              width: size.width + d.width,
              height: size.height + d.height,
            });
          }}
          minWidth={300}
          minHeight={200}
          maxWidth={1200}
          maxHeight={800}
          className={styles.resizable}
        >
          <div className={styles.window}>
            <div className={styles.windowHeader}>
              <div className={styles.windowButtons}>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                ></button>
                <button className={styles.minimizeButton}></button>
                <button className={styles.maximizeButton}></button>
              </div>
              <div className={styles.windowTitle}>{title}</div>
            </div>
            <div className={styles.windowContent}>
              This is the content of the window
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}
