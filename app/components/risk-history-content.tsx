"use client"

import {RiskIncident} from "@/app/components/use-alerts";
import {AlertTriangle, Clock, Ruler, ZoomIn} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useEffect} from "react";

interface RiskHistoryContentProps {
  title: string;
  incidents: RiskIncident[];
  handleImageClick: (incident: RiskIncident) => void;
}

export function RiskHistoryContent({ title, incidents, handleImageClick }: RiskHistoryContentProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const getSeverityColor = (distance: number) => {
    if (distance < 1) return "bg-red-100 text-red-800"
    if (distance < 2) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getSeverityText = (distance: number) => {
    if (distance < 1) return "Critique"
    if (distance < 1.5) return "Élevé"
    return "Moyen"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-red-500"/>
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary">
          {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-6">
        {incidents.map((incident) => (
          <Card key={incident.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Image de l'Incident - Maintenant Plus Grande et Plus Proéminente */}
                <div className="relative group cursor-pointer" onClick={() => handleImageClick(incident)}>
                  <div className="w-full lg:w-80 h-64 relative bg-gray-100 flex-shrink-0">
                    <Image
                      src={`http://localhost:8000${incident.imageUrl}`}
                      alt="Image de l'incident"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Superposition avec icône de zoom */}
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-6 w-6 text-gray-800"/>
                      </div>
                    </div>

                    {/* Badge de Gravité */}
                    <div className="absolute top-3 left-3">
                      <Badge className={getSeverityColor(incident.distance)}>
                        {getSeverityText(incident.distance)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Détails de l'Incident */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{incident.cameraName}</h3>
                      <p className="text-gray-600 text-base leading-relaxed">{incident.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4"/>
                        {formatDate(incident.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-gray-500"/>
                      <span className="font-medium text-base">Distance :</span>
                      <Badge variant="outline" className="text-red-600 border-red-200 text-base px-3 py-1">
                        {incident.distance.toFixed(1)}m
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageClick(incident)}
                      className="flex items-center gap-2"
                    >
                      <ZoomIn className="h-4 w-4"/>
                      Voir les Détails
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}