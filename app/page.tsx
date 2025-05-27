"use client"

import {useState, useEffect} from "react"
import { CameraGrid } from "./components/camera-grid"
import { RiskHistory } from "./components/risk-history"
import { Header } from "./components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, AlertTriangle } from "lucide-react"
import {useAlerts} from "@/app/components/use-alerts";

export interface CameraConnection {
  id: string
  ipAddress: string
  name: string
  status: "connected" | "connecting" | "loading" | "disconnected" | "error"
  videoUrl?: string
  detections: {
    humans: number
    forklifts: number
  }
  alerts: {
    isDanger: boolean
    message?: string
    distance?: number
  }
  order: number
  refreshToken?: number
}

export default function SurveillanceDashboard() {
  const [cameras, setCameras] = useState<CameraConnection[]>([])
  /*const [riskHistory, setRiskHistory] = useState<RiskIncident[]>([
    {
      id: "1",
      cameraId: "cam-1",
      cameraName: "Entrepôt A - Zone 1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300&query=industrial warehouse forklift danger",
      distance: 1.2,
      description: "Humain détecté dans la zone de sécurité de 2m d'un chariot élévateur actif",
    },
    {
      id: "2",
      cameraId: "cam-2",
      cameraName: "Quai de Chargement B",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300&query=loading dock safety incident",
      distance: 0.8,
      description: "Travailleur entré dans l'angle mort du chariot élévateur pendant l'opération",
    },
    {
      id: "3",
      cameraId: "cam-1",
      cameraName: "Entrepôt A - Zone 1",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300&query=warehouse safety violation",
      distance: 1.5,
      description: "Piéton a traversé le passage d'un chariot élévateur actif",
    },
  ])*/

  const riskHistory = useAlerts();

  useEffect(() => {
    console.log("🔵 Initialisation du tableau de caméras")
    const restoreActiveCameras = async () => {
      try {
        const res = await fetch("http://localhost:8000/active-cameras");
        if (!res.ok) throw new Error("Failed to fetch active cameras");

        const data = await res.json();

        const activeCameras: CameraConnection[] = [];
                data.active_cameras.forEach((camera: { id: string; url: string; name: string }) => {
          let ipAddress = 'restored';
          if(camera.url === './video1.mp4') {
            ipAddress = '192.168.1.100'
          } else if(camera.url === './video3.mp4') {
            ipAddress = '192.168.1.101'
          } else if(camera.url === './video1-long.mp4') {
            ipAddress = '192.168.1.102'
          }
          activeCameras.push({
            id: camera.id,
            ipAddress: ipAddress,
            name: camera.name,
            status: "loading",
            detections: { humans: 0, forklifts: 0 },
            alerts: { isDanger: false },
            order: cameras.length,
          });
        });
        setCameras(activeCameras);
      } catch (err) {
        console.error("🔴 Erreur restauration caméras :", err);
      }
    };

    restoreActiveCameras();
  }, []);

  useEffect(() => {
    console.log("🔵 Caméras actives restaurées :", cameras);
  }, [cameras]);

  const handleCameraConnect = async (ipAddress: string, username: string, password: string, name: string) => {
    const newCamera: CameraConnection = {
      id: `cam-${Date.now()}`,
      ipAddress,
      name,
      status: "connecting",
      detections: { humans: 0, forklifts: 0 },
      alerts: { isDanger: false },
      order: cameras.length,
    };

    setCameras((prev) => [...prev, newCamera]);

    try {
      // Étape 1 : démarrer le flux RTSP côté serveur
      const startRes = await fetch("http://localhost:8000/start-stream/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCamera.id,
          url: `rtsp://${username}:${password}@${ipAddress}/stream`,
          name: name
        }),
      });

      if (!startRes.ok) {
        setCameras((prev) => prev.map((cam) => (cam.id === newCamera.id ? { ...cam, status: "error" } : cam)))
      } else {
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === newCamera.id
              ? {
                ...cam,
                status: "loading",
                videoUrl: `webrtc-${cam.id}`,
              }
              : cam,
          ),
        )
      }
    } catch (error) {
      console.error("Camera connection error:", error);
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === newCamera.id ? { ...cam, status: "error" } : cam
        )
      );
    }
  };

  const handleCameraDisconnect = async (cameraId: string) => {
    const res = await fetch(`http://localhost:8000/stop-stream/${cameraId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.json();
      console.error("❌ Erreur côté serveur :", error.detail || error);
      return;
    } else {
      setCameras((prev) => prev.filter((cam) => cam.id !== cameraId))
    }
  }

  const handleCameraReorder = (draggedId: string, targetId: string) => {
    setCameras((prev) => {
      const draggedIndex = prev.findIndex((cam) => cam.id === draggedId)
      const targetIndex = prev.findIndex((cam) => cam.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      const newCameras = [...prev]
      const [draggedCamera] = newCameras.splice(draggedIndex, 1)
      newCameras.splice(targetIndex, 0, draggedCamera)

      // Mise à jour des valeurs d'ordre
      return newCameras.map((camera, index) => ({
        ...camera,
        order: index,
      }))
    })
  }

  const handleUpdateCamera = (updatedCamera: CameraConnection) => {
    setCameras((prev) =>
      prev.map((cam) => (cam.id === updatedCamera.id ? updatedCamera : cam)),
    )
  }

  // Simulation des mises à jour de détection en temps réel
  /*useEffect(() => {
    const interval = setInterval(() => {
      setCameras((prev) =>
        prev.map((camera) => {
          if (camera.status !== "connected") return camera

          const humans = Math.floor(Math.random() * 5)
          const forklifts = Math.floor(Math.random() * 3)
          const isDanger = humans > 0 && forklifts > 0 && Math.random() > 0.7
          const distance = isDanger ? Math.random() * 2 + 0.5 : undefined

          // Ajouter à l'historique des risques si danger détecté
          if (isDanger && !camera.alerts.isDanger) {
            const newIncident: RiskIncident = {
              id: `incident-${Date.now()}`,
              cameraId: camera.id,
              cameraName: camera.name,
              timestamp: new Date(),
              imageUrl: `/placeholder.svg?height=200&width=300&query=danger detection ${camera.name}`,
              distance: distance!,
              description: `Humain détecté à ${distance!.toFixed(1)}m d'un chariot élévateur actif`,
            }
            setRiskHistory((prev) => [newIncident, ...prev])
          }

          return {
            ...camera,
            detections: { humans, forklifts },
            alerts: {
              isDanger,
              message: isDanger ? `DANGER : Humain à ${distance!.toFixed(1)}m du chariot élévateur` : undefined,
              distance,
            },
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])*/

  const activeCameras = cameras.filter((cam) => cam.status === "connected")
  const totalAlerts = activeCameras.filter((cam) => cam.alerts.isDanger).length

  // Trier les caméras par ordre
  const sortedCameras = [...cameras].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalCameras={activeCameras.length} totalAlerts={totalAlerts} />

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="cameras" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cameras" className="flex items-center gap-2">
              <Camera className="h-4 w-4"/>
              Gestion des Caméras
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4"/>
              Historique des Risques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cameras">
            <CameraGrid
              cameras={sortedCameras}
              onUpdateCamera={handleUpdateCamera}
              onConnect={handleCameraConnect}
              onDisconnect={handleCameraDisconnect}
              onReorder={handleCameraReorder}
            />
          </TabsContent>

          <TabsContent value="history">
            <RiskHistory incidents={riskHistory}/>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
