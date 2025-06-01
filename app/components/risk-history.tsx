"use client"

import {useEffect, useState} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Ruler, Download } from "lucide-react"
import Image from "next/image"
import {RiskIncident} from "@/app/components/use-alerts";
import {RiskHistoryContent} from "@/app/components/risk-history-content";

interface RiskHistoryProps {
  incidents: RiskIncident[]
}

export function RiskHistory({ incidents }: RiskHistoryProps) {

  const [selectedIncident, setSelectedIncident] = useState<RiskIncident | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formerIncidents, setFormerIncidents] = useState<RiskIncident[]>([])

  useEffect(() => {
    const getAlerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/alerts");
        if (!res.ok) {
          throw new Error("Failed to fetch alerts")
        } else {
          const data: RiskIncident[] = await res.json();
          setFormerIncidents(data);
        }
      } catch (err) {
        console.error("🔴 Erreur restauration des alertes :", err);
      }
    }
    getAlerts();
  }, []);

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

  const handleDownloadImage = async () => {
    if (!selectedIncident) return

    const imageUrl = `http://localhost:8000${selectedIncident.imageUrl}`
    const fileName = `incident-${selectedIncident.id}-${formatFullDate(selectedIncident.timestamp)}.jpg`

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erreur lors du téléchargement de l'image :", err)
    }
  }

  return (
    <div>
      {incidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">Aucun risque d'incident en direct</div>
            <div className="text-gray-500 text-sm">
              Les situations à risque apparaîtront ici lorsqu'elles seront détectées
            </div>
          </div>
      ) :
        (
        <RiskHistoryContent title={'Situations à risque en direct'} incidents={incidents} handleImageClick={handleImageClick}></RiskHistoryContent>
        )
      }
      {formerIncidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">L'historique est vide</div>
            <div className="text-gray-500 text-sm">
              On dirait que tout se passe bien ! Aucun incident enregistré dans l'historique.
            </div>
          </div>
        ) :
        (
          <RiskHistoryContent title={'Historique des situations à risque'} incidents={formerIncidents} handleImageClick={handleImageClick}></RiskHistoryContent>
        )
      }
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
                      <Download className="h-4 w-4 mr-2"/>
                      Télécharger
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6">
                {/* Affichage de Grande Image */}
                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <Image
                    src={`http://localhost:8000${selectedIncident.imageUrl}`}
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
                        <Ruler className="h-5 w-5 text-gray-500"/>
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
