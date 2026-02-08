import logging
import threading
import time

import cv2
import httpx

from app.core.config import settings
from app.services import face_engine, storage

logger = logging.getLogger(__name__)

DEDUP_WINDOW_SECONDS = 300  # 5 minutes


class StreamWorker:
    """Background thread that processes an RTSP stream for face recognition."""

    def __init__(
        self,
        camera_id: str,
        rtsp_url: str,
        company_id: str,
        location_id: str,
        callback_url: str,
        frame_interval: int = 30,
    ):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.company_id = company_id
        self.location_id = location_id
        self.callback_url = callback_url
        self.frame_interval = frame_interval
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._last_seen: dict[str, float] = {}  # employee_id -> timestamp

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=10)

    @property
    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def _is_dedup(self, employee_id: str) -> bool:
        now = time.time()
        last = self._last_seen.get(employee_id)
        if last and (now - last) < DEDUP_WINDOW_SECONDS:
            return True
        self._last_seen[employee_id] = now
        return False

    def _run(self) -> None:
        logger.info("Starting stream worker for camera %s", self.camera_id)
        enrolled = storage.load_all_encodings(self.company_id)
        if not enrolled:
            logger.warning("No enrolled faces for company %s", self.company_id)
            return

        reconnect_attempts = 0
        max_reconnects = 5

        while not self._stop_event.is_set() and reconnect_attempts < max_reconnects:
            cap = cv2.VideoCapture(self.rtsp_url)
            if not cap.isOpened():
                reconnect_attempts += 1
                logger.warning(
                    "Failed to open RTSP stream %s (attempt %d/%d)",
                    self.rtsp_url,
                    reconnect_attempts,
                    max_reconnects,
                )
                time.sleep(5)
                continue

            reconnect_attempts = 0
            frame_count = 0

            while not self._stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    logger.warning("Failed to read frame from %s, reconnecting...", self.rtsp_url)
                    break

                frame_count += 1
                if frame_count % self.frame_interval != 0:
                    continue

                try:
                    _, buffer = cv2.imencode(".jpg", frame)
                    image_bytes = buffer.tobytes()
                    result = face_engine.identify_face(image_bytes, enrolled)

                    if result["identified"] and result["employee_id"]:
                        if not self._is_dedup(result["employee_id"]):
                            self._send_callback(result)
                except Exception as e:
                    logger.error("Error processing frame: %s", e)

            cap.release()

        logger.info("Stream worker stopped for camera %s", self.camera_id)

    def _send_callback(self, result: dict) -> None:
        try:
            payload = {
                "employee_id": result["employee_id"],
                "camera_id": self.camera_id,
                "company_id": self.company_id,
                "location_id": self.location_id,
                "confidence": result["confidence"],
                "type": "check_in",
                "source": "rtsp",
            }
            headers = {}
            if settings.internal_api_secret:
                headers["x-api-secret"] = settings.internal_api_secret
            httpx.post(self.callback_url, json=payload, headers=headers, timeout=10)
        except Exception as e:
            logger.error("Failed to send callback: %s", e)


class StreamManager:
    """Singleton managing all active RTSP stream workers."""

    def __init__(self) -> None:
        self._workers: dict[str, StreamWorker] = {}

    def start_stream(
        self,
        camera_id: str,
        rtsp_url: str,
        company_id: str,
        location_id: str,
        callback_url: str,
        frame_interval: int = 30,
    ) -> bool:
        if camera_id in self._workers and self._workers[camera_id].is_running:
            return False

        worker = StreamWorker(
            camera_id=camera_id,
            rtsp_url=rtsp_url,
            company_id=company_id,
            location_id=location_id,
            callback_url=callback_url,
            frame_interval=frame_interval,
        )
        worker.start()
        self._workers[camera_id] = worker
        return True

    def stop_stream(self, camera_id: str) -> bool:
        worker = self._workers.pop(camera_id, None)
        if worker:
            worker.stop()
            return True
        return False

    def stop_all(self) -> None:
        for camera_id in list(self._workers.keys()):
            self.stop_stream(camera_id)

    def get_status(self) -> list[dict]:
        return [
            {"camera_id": cid, "running": w.is_running}
            for cid, w in self._workers.items()
        ]


# Singleton instance
stream_manager = StreamManager()
