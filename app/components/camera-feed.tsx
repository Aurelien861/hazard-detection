"use client"

import React, {useEffect, useRef, useState} from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {Camera, Wifi, WifiOff, Users, Truck, AlertTriangle, X, Loader2, GripVertical, RefreshCw} from "lucide-react"
import type { CameraConnection } from "../page"
import {on} from "next/dist/client/components/react-dev-overlay/pages/bus";

interface CameraFeedProps {
  camera: CameraConnection
  onUpdateCamera?: (camera: CameraConnection) => void
  onDisconnect: (cameraId: string) => void
  isDragging?: boolean
  isDragOver?: boolean
}

export function CameraFeed({ camera, onUpdateCamera, onDisconnect, isDragging, isDragOver }: CameraFeedProps) {
  const [imageError, setImageError] = useState(false)

  const reloadVideo = () => {
    if(onUpdateCamera && camera.status !== "error") {
      loadVideo().then(() => {
        onUpdateCamera({
          ...camera,
          status: "connected",
          videoUrl: `webrtc-${camera.id}`
        })
      });
    }
  }

  const loadVideo = async () => {

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });
    pc.oniceconnectionstatechange = () => {
      console.log("🧊 ICE state:", pc.iceConnectionState);
    };

    pc.onicecandidate = (event) => {
      console.log("🧊 ICE candidate:", event.candidate);
    };
    pc.addTransceiver("video", { direction: "recvonly" });


    pc.ontrack = (event) => {
      const videoElement = document.getElementById(`video-${camera.id}`) as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = event.streams[0];
      }
    };

    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    // Envoyer l'offre au serveur
    const offerRes = await fetch(`http://localhost:8000/offer/${camera.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sdp: pc.localDescription?.sdp,
        type: pc.localDescription?.type,
      }),
    });

    if (!offerRes.ok) throw new Error("Offer exchange failed");

    const answer = await offerRes.json();
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  useEffect(() => {
    if(camera.status === "loading") {
      reloadVideo()
    }
  }, [camera]);

  const getStatusIcon = () => {
    switch (camera.status) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "connecting":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "loading":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "error":
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (camera.status) {
      case "connected":
        return "Connectée"
      case "connecting":
        return "Connexion en cours..."
      case "loading":
        return "Connectée";
      case "error":
        return "Échec de connexion"
      default:
        return "Déconnectée"
    }
  }

  const getStatusColor = () => {
    switch (camera.status) {
      case "connected":
        return "bg-green-100 text-green-800"
      case "connecting":
        return "bg-blue-100 text-blue-800"
      case "loading":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card
      className={`overflow-hidden cursor-move transition-all duration-200 ${
        isDragging ? "shadow-2xl ring-2 ring-blue-400 bg-blue-50" : "hover:shadow-lg"
      } ${isDragOver ? "ring-2 ring-green-400 bg-green-50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400"/>
              <Camera className="h-5 w-5"/>
            </div>
            {camera.name}
          </CardTitle>
          <div className="flex items-center gap-4">
            {(camera.status === "connected") &&
              (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    reloadVideo()
                  }}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600"/>
                </Button>
              )
            }
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDisconnect(camera.id)
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4"/>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
            {camera.status === "connecting" && (
              <span className="text-xs text-gray-500">Établissement de la connexion sécurisée...</span>
            )}
          </div>
          <span className="text-sm text-gray-500">{camera.ipAddress}</span>
        </div>
        {camera.status === "error" && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Échec de connexion. Veuillez vérifier l'adresse IP et les identifiants.
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flux Vidéo */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {camera.status === "connected" && camera.videoUrl ? (
            <>
              {!imageError ? (
                <video
                  id={`video-${camera.id}`}
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm">Flux vidéo indisponible</div>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  EN DIRECT
                </Badge>
              </div>
            </>
          ) : camera.status === "connecting" ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <div className="text-sm">Établissement de la connexion...</div>
              </div>
            </div>
          ) : camera.status === "loading" ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              </div>
            </div>
          ) : camera.status === "error" ? (
            <div className="flex items-center justify-center h-full text-red-400">
              <div className="text-center">
                <WifiOff className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Échec de connexion</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Aucun signal</div>
              </div>
            </div>
          )}
        </div>

        {/* Compteurs de Détection */}
        {/*{camera.status === "connected" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{camera.detections.humans}</div>
                <div className="text-xs text-blue-600">Humains</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <Truck className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{camera.detections.forklifts}</div>
                <div className="text-xs text-orange-600">Chariots élévateurs</div>
              </div>
            </div>
          </div>
        )}

         Alerte de Danger
        {camera.alerts.isDanger && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>DANGER DÉTECTÉ :</strong> {camera.alerts.message}
            </AlertDescription>
          </Alert>
        )}*/}

        {/* Indicateur de Glissement */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center rounded-lg">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Repositionnement...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
