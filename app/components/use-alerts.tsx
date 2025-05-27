import { useEffect, useState } from "react";

export interface RiskIncident {
  id: string
  cameraId: string
  cameraName: string
  timestamp: Date
  imageUrl: string
  distance: number
  description: string
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<RiskIncident[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/alerts");

    socket.onmessage = (event) => {
      const alertData = JSON.parse(event.data) as RiskIncident;
      setAlerts((prev) => [alertData, ...prev]);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, []);

  return alerts;
}
