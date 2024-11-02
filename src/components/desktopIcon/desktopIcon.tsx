import { useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./desktopIcon.module.css";

interface DesktopIconProps {
  icon: string;
  label: string;
  initialCoordinates: { x: number; y: number };
  onDoubleClick: () => void; // Keep this as onDoubleClick
}

export default function DesktopIcon({
  icon,
  label,
  initialCoordinates,
  onDoubleClick,
}: DesktopIconProps) {
  const [dragging, setDragging] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null); // Track the click timeout
  const [position, setPosition] = useState(initialCoordinates);

  const handleClick = () => {
    if (dragging) return; // Prevent action if dragging

    // Clear the timeout if a click is registered
    if (clickTimeout) {
      clearTimeout(clickTimeout); // Clear the previous click timeout
      setClickTimeout(null); // Reset timeout state
      onDoubleClick(); // Trigger double-click action
    } else {
      // Set a timeout to detect double click
      const timeout = setTimeout(() => {
        setClickTimeout(null); // Reset the timeout state
      }, 500); // Timeout duration for double-click detection

      setClickTimeout(timeout); // Store the timeout ID
    }
  };

  return (
    <Rnd
      bounds="parent"
      dragHandleClassName={styles.desktopIcon}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      enableResizing={false}
      position={position}
    >
      <div className={styles.desktopIcon} onClick={handleClick} title={label}>
        <img src={icon} alt={label} className={styles.icon} />
        <div className={styles.label}>{label}</div>
      </div>
    </Rnd>
  );
}
