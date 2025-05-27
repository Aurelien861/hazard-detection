"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Clock, Ruler, ZoomIn, Download } from "lucide-react"
import Image from "next/image"
import {RiskIncident} from "@/app/components/use-alerts";

interface RiskHistoryProps {
  incidents: RiskIncident[]
}

export function RiskHistory({ incidents }: RiskHistoryProps) {

  const [selectedIncident, setSelectedIncident] = useState<RiskIncident | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleImageClick = (incident: RiskIncident) => {
    setSelectedIncident(incident)
    setIsModalOpen(true)
  }

  const handleDownloadImage = () => {
    if (selectedIncident) {
      // Dans une vraie application, ceci déclencherait un téléchargement réel
      const link = document.createElement("a")
      link.href = selectedIncident.imageUrl
      link.download = `incident-${selectedIncident.id}-${selectedIncident.timestamp.getTime()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-400 text-lg mb-2">Aucun incident de risque enregistré</div>
        <div className="text-gray-500 text-sm">
          Les incidents de sécurité apparaîtront ici lorsqu'ils seront détectés
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="text-xl font-semibold">Historique des Incidents de Risque</h2>
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
                      src={incident.imageUrl || "/placeholder.svg"}
                      alt="Image de l'incident"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Superposition avec icône de zoom */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-6 w-6 text-gray-800" />
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
                        <Clock className="h-4 w-4" />
                        {formatDate(incident.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-gray-500" />
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
                      <ZoomIn className="h-4 w-4" />
                      Voir les Détails
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal d'Image */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
          {selectedIncident && (
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      Détails de l'Incident - {selectedIncident.cameraName}
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">{formatFullDate(selectedIncident.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(selectedIncident.distance)}>
                      {getSeverityText(selectedIncident.distance)}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleDownloadImage}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6">
                {/* Affichage de Grande Image */}
                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <Image
                    src={selectedIncident.imageUrl || "/placeholder.svg"}
                    alt="Image de l'incident - vue agrandie"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Informations sur l'Incident */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description de l'Incident</h4>
                      <p className="text-gray-700">{selectedIncident.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Emplacement de la Caméra</h4>
                      <p className="text-gray-700">{selectedIncident.cameraName}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Métriques de Sécurité</h4>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-gray-500" />
                        <span>Distance entre humain et chariot élévateur :</span>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {selectedIncident.distance.toFixed(1)}m
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Niveau de Risque</h4>
                      <Badge className={getSeverityColor(selectedIncident.distance)}>
                        Risque {getSeverityText(selectedIncident.distance)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
