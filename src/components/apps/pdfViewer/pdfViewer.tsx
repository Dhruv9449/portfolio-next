import { useState } from "react";
import { Rnd } from "react-rnd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import styles from "./pdfViewer.module.css";
import "./pdfViewBg.css";
import { MdOutlineFileDownload, MdZoomIn, MdZoomOut } from "react-icons/md";
import {
  RenderZoomInProps,
  RenderZoomOutProps,
  zoomPlugin,
} from "@react-pdf-viewer/zoom";
import {
  pageNavigationPlugin,
  RenderCurrentPageLabelProps,
} from "@react-pdf-viewer/page-navigation";
import { HiOutlineDownload, HiOutlineZoomOut } from "react-icons/hi";
import { RxDownload, RxZoomIn, RxZoomOut } from "react-icons/rx";

interface PDFViewerProps {
  file: string;
  defaultPosition: { x: number; y: number };
  hideTopbarAndDock: (hide: boolean) => void;
  onClose: () => void;
}

export default function PDFViewer({
  file,
  defaultPosition,
  hideTopbarAndDock,
  onClose,
}: PDFViewerProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [position, setPosition] = useState(defaultPosition);

  const toggleMaximize = () => {
    if (isMaximized) {
      hideTopbarAndDock(false);
      setSize({ width: 800, height: 600 });
      setPosition(defaultPosition);
    } else {
      hideTopbarAndDock(true);
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut } = zoomPluginInstance;
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { CurrentPageLabel } = pageNavigationPluginInstance;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      bounds="parent"
      enableResizing
      onResizeStop={(e, direction, ref) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      dragHandleClassName={styles.centerHeader}
    >
      <div className={styles.pdfViewer}>
        <div className={styles.header}>
          <div className={styles.windowButtons}>
            <button className={styles.closeButton} onClick={onClose} />
            <button className={styles.minimizeButton} />
            <button
              className={styles.maximizeButton}
              onClick={toggleMaximize}
            />
          </div>
          <div className={styles.centerHeader}>
            <div className={styles.windowTitle}>{file}</div>
            <CurrentPageLabel>
              {(props: RenderCurrentPageLabelProps) => (
                <div className={styles.currentPageLabel}>
                  {`Page ${props.currentPage + 1} of ${props.numberOfPages}`}
                </div>
              )}
            </CurrentPageLabel>
          </div>
          <div className={styles.previewOptions}>
            {/* Zoom In, Zoom out and Download options */}
            <ZoomOut>
              {(props: RenderZoomOutProps) => (
                <RxZoomOut
                  onClick={props.onClick}
                  className={styles.zoomButtons + " " + styles.previewButtons}
                />
              )}
            </ZoomOut>
            <ZoomIn>
              {(props: RenderZoomInProps) => (
                <RxZoomIn
                  onClick={props.onClick}
                  className={styles.zoomButtons + " " + styles.previewButtons}
                />
              )}
            </ZoomIn>
            <RxDownload
              className={styles.previewButtons}
              onClick={() => {
                const a = document.createElement("a");
                a.href = file;
                a.download = "Dhruv_Resume.pdf"; // Replace 'my-file.pdf' with your desired filename
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
          </div>
        </div>
        <div className={styles.viewerContainer}>
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
          >
            <Viewer
              fileUrl={file}
              plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
            />
          </Worker>
        </div>
      </div>
    </Rnd>
  );
}
