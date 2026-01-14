import { useState } from 'react'
import { config } from '@/lib/config'
import { authService } from '@/lib/auth'

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Consulta SUNAT</h1>
          <p className="text-gray-600 mb-6">Busca información de RUC o por DNI</p>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Selector de tipo de búsqueda */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="ruc"
                  checked={searchType === 'ruc'}
                  onChange={(e) => setSearchType(e.target.value as 'ruc' | 'dni')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Buscar por RUC</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="dni"
                  checked={searchType === 'dni'}
                  onChange={(e) => setSearchType(e.target.value as 'ruc' | 'dni')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Buscar por DNI</span>
              </label>
            </div>

            {/* Campo de búsqueda */}
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, ''))}
                placeholder={searchType === 'ruc' ? 'Ingrese RUC (11 dígitos)' : 'Ingrese DNI (8 dígitos)'}
                maxLength={searchType === 'ruc' ? 11 : 8}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className='flex items-center gap-2'>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
                {(result || error) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Información del RUC</h2>
            
            <div className="space-y-4">
              {/* Información básica */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Datos Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoItem label="RUC" value={result.ruc} />
                  <InfoItem label="Nombre / Razón Social" value={result.nombre_razon_social} className="md:col-span-2" />
                  <InfoItem label="Estado del Contribuyente" value={result.estado_contribuyente} />
                  <InfoItem label="Condición del Domicilio" value={result.condicion_domicilio} />
                </div>
              </div>

              {/* Ubicación */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {/* Información adicional */}
              {result.extra && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Información Adicional</h3>
                  <InfoItem label="Extra" value={result.extra} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para mostrar información
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
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
  )
}
