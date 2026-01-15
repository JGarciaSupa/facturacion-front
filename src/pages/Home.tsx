import { useState } from 'react'
import { config } from '@/lib/config'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Search, X, AlertCircle } from 'lucide-react'

interface RucData {
  ruc: string
  nombre_razon_social: string | null
  estado_contribuyente: string | null
  condicion_domicilio: string | null
  ubigeo: string | null
  tipo_via: string | null
  nombre_via: string | null
  codigo_zona: string | null
  tipo_zona: string | null
  numero: string | null
  interior: string | null
  lote: string | null
  departamento: string | null
  manzana: string | null
  kilometro: string | null
  extra: string | null
}

export default function Page() {
  const [searchType, setSearchType] = useState<'ruc' | 'dni'>('ruc')
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RucData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const token = authService.getToken()
      const endpoint = searchType === 'ruc' 
        ? `${config.API_URL}/api/ruc/${searchValue}`
        : `${config.API_URL}/api/ruc/dni/${searchValue}`

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la consulta')
      }

      const data = await response.json()
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSearchValue('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Consulta SUNAT</CardTitle>
            <CardDescription>Busca información de RUC o por DNI</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-3">
                <Label>Tipo de búsqueda</Label>
                <RadioGroup
                  value={searchType}
                  onValueChange={(value) => setSearchType(value as 'ruc' | 'dni')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ruc" id="ruc" />
                    <Label htmlFor="ruc" className="cursor-pointer">Buscar por RUC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dni" id="dni" />
                    <Label htmlFor="dni" className="cursor-pointer">Buscar por DNI</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, ''))}
                  placeholder={searchType === 'ruc' ? 'Ingrese RUC (11 dígitos)' : 'Ingrese DNI (8 dígitos)'}
                  maxLength={searchType === 'ruc' ? 11 : 8}
                  required
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
                {(result || error) && (
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Información del RUC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos Básicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="RUC" value={result.ruc} />
                    <InfoItem label="Nombre / Razón Social" value={result.nombre_razon_social} className="md:col-span-2" />
                    <InfoItem label="Estado del Contribuyente" value={result.estado_contribuyente} />
                    <InfoItem label="Condición del Domicilio" value={result.condicion_domicilio} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ubicación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Ubigeo" value={result.ubigeo} />
                    <InfoItem label="Departamento" value={result.departamento} />
                    <InfoItem label="Tipo de Vía" value={result.tipo_via} />
                    <InfoItem label="Nombre de Vía" value={result.nombre_via} />
                    <InfoItem label="Número" value={result.numero} />
                    <InfoItem label="Interior" value={result.interior} />
                    <InfoItem label="Código Zona" value={result.codigo_zona} />
                    <InfoItem label="Tipo Zona" value={result.tipo_zona} />
                    <InfoItem label="Lote" value={result.lote} />
                    <InfoItem label="Manzana" value={result.manzana} />
                    <InfoItem label="Kilómetro" value={result.kilometro} />
                  </div>
                </div>

                {result.extra && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información Adicional</h3>
                    <InfoItem label="Extra" value={result.extra} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function InfoItem({ 
  label, 
  value, 
  className = '' 
}: { 
  label: string
  value: string | null | undefined
  className?: string 
}) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground">{label}</Label>
      <p className="text-foreground font-medium mt-1">{value || 'N/A'}</p>
    </div>
  )
}
