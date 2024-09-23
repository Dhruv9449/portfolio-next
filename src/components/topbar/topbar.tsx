import { FaBatteryFull, FaWifi } from "react-icons/fa";
import { BsApple, BsBatteryFull } from "react-icons/bs";
import { CiBatteryFull } from "react-icons/ci";
import style from "./topbar.module.css";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const optionsDate: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const updateDateTime = () => {
      const date = new Date();
      setCurrentDate(date.toLocaleDateString(undefined, optionsDate));
      setCurrentTime(date.toLocaleTimeString(undefined, optionsTime));
    };

    updateDateTime(); // Set initial date and time
    const intervalId = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <div className={style.topbar}>
      <div className={style.left}>
        <img
          src="./logo-small.svg"
          alt="DS"
          width={16}
          className={style.logo}
        />
        <p>
          {" "}
          <strong>Dhruv Shah</strong>{" "}
        </p>
      </div>
      <div className={style.right}>
        <div className={style.iconGroup}>
          <p className={style.iconText}>100%</p>
          <BsBatteryFull className={style.batteryIcon} />
        </div>
        <div className={style.iconGroup}>
          <FaWifi className={style.wifiIcon} />
        </div>
        <div className={style.iconGroup}>
          <p className={style.date}>{currentDate}</p>
          <p className={style.time}>{currentTime}</p>
        </div>
      </div>
    </div>
  );
}
