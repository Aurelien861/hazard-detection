import { Shield, Camera, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  totalCameras: number
  totalAlerts: number
}

export function Header({ totalCameras, totalAlerts }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SafeWatch</h1>
              <p className="text-sm text-gray-600">Gestion Unifiée des Caméras & Surveillance de Sécurité</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {totalCameras} Caméra{totalCameras !== 1 ? "s" : ""} Active{totalCameras !== 1 ? "s" : ""}
              </span>
            </div>

            {/*<div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <Badge variant={totalAlerts > 0 ? "destructive" : "secondary"}>
                {totalAlerts} Alerte{totalAlerts !== 1 ? "s" : ""}
              </Badge>
            </div>*/}
          </div>
        </div>
      </div>
    </header>
  )
}
