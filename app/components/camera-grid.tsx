"use client"

import type React from "react"

import { useState } from "react"
import { CameraFeed } from "./camera-feed"
import { AddCameraCard } from "./add-camera-card"
import { Badge } from "@/components/ui/badge"
import { Move } from "lucide-react"
import type { CameraConnection } from "../page"


interface CameraGridProps {
  cameras: CameraConnection[]
  onUpdateCamera: (camera: CameraConnection) => void
  onConnect: (ipAddress: string, username: string, password: string, name: string) => void
  onDisconnect: (cameraId: string) => void
  onReorder: (draggedId: string, targetId: string) => void
}

export function CameraGrid({ cameras, onUpdateCamera, onConnect, onDisconnect, onReorder }: CameraGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, cameraId: string) => {
    setDraggedId(cameraId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", cameraId)
  }

  const handleDragOver = (e: React.DragEvent, cameraId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverId(cameraId)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const draggedCameraId = e.dataTransfer.getData("text/plain")

    if (draggedCameraId && draggedCameraId !== targetId) {
      onReorder(draggedCameraId, targetId)
    }

    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gestion des Caméras</h2>
          {cameras.length > 1 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Move className="h-4 w-4" />
              <span>Glissez les caméras pour les réorganiser</span>
            </div>
          )}
        </div>
          <div className="text-sm text-gray-600">
            {cameras.length} caméra{cameras.length !== 1 ? "s" : ""} configurée{cameras.length !== 1 ? "s" : ""}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddCameraCard onConnect={onConnect}/>
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className={`transition-all duration-200 ${draggedId === camera.id ? "opacity-50 scale-95" : ""} ${
              dragOverId === camera.id ? "scale-105" : ""
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, camera.id)}
            onDragOver={(e) => handleDragOver(e, camera.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, camera.id)}
            onDragEnd={handleDragEnd}
          >
            <CameraFeed
              camera={camera}
              onUpdateCamera={onUpdateCamera}
              onDisconnect={onDisconnect}
              isDragging={draggedId === camera.id}
              isDragOver={dragOverId === camera.id}
            />
          </div>
        ))}
      </div>

      {draggedId && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 shadow-lg">
            <Move className="h-3 w-3 mr-1" />
            Repositionnement de la caméra...
          </Badge>
        </div>
      )}
    </div>
  )
}
