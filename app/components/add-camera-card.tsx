"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Wifi, Lock, User, MapPin, ChevronUp } from "lucide-react"

interface AddCameraCardProps {
  onConnect: (ipAddress: string, username: string, password: string, name: string) => void
}

export function AddCameraCard({ onConnect }: AddCameraCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    ipAddress: "192.168.1.102",
    username: "admin",
    password: "PII2025",
    name: "gare logistique - zone 1",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.ipAddress && formData.username && formData.password && formData.name) {
      onConnect(formData.ipAddress, formData.username, formData.password, formData.name)
      setFormData({ ipAddress: "", username: "", password: "", name: "" })
      setIsExpanded(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isExpanded) {
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
        <CardContent
          className="flex flex-col items-center justify-center h-80 text-gray-500 hover:text-blue-600 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ajouter une Nouvelle Caméra</h3>
          <p className="text-sm text-center">
            Cliquez pour connecter une nouvelle caméra IP au système de surveillance
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            Connecter une Nouvelle Caméra
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-8 w-8 p-0">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3" />
              Nom de la Caméra
            </Label>
            <Input
              id="name"
              placeholder="ex: Entrepôt A - Zone 1"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress" className="flex items-center gap-2 text-sm">
              <Wifi className="h-3 w-3" />
              Adresse IP
            </Label>
            <Input
              id="ipAddress"
              placeholder="192.168.1.100"
              value={formData.ipAddress}
              onChange={(e) => handleChange("ipAddress", e.target.value)}
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
              className="text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm">
                <User className="h-3 w-3" />
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                placeholder="admin"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                <Lock className="h-3 w-3" />
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="text-sm"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 text-sm">
              Connecter la Caméra
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsExpanded(false)} className="text-sm">
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
