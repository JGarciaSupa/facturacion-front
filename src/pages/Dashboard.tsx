import { useState, useEffect, useCallback } from 'react'
import { config } from '../lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, LogOut, User } from 'lucide-react'

interface ApiLog {
  id: string
  endpoint: string
  parameter: string | null
  ip: string | null
  userAgent: string | null
  country: string | null
  statusCode: number
  responseTime: number | null
  success: boolean
  createdAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ApiLogsResponse {
  data: ApiLog[]
  pagination: PaginationData
}

export default function Dashboard() {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    endpoint: 'all',
    success: 'all',
    ip: '',
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const fetchLogs = useCallback(async (page: number = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.endpoint && filters.endpoint !== 'all') params.append('endpoint', filters.endpoint)
      if (filters.success && filters.success !== 'all') params.append('success', filters.success)
      if (filters.ip) params.append('ip', filters.ip)

      const response = await fetch(`${config.API_URL}/api/logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar los logs')
      }

      const data: ApiLogsResponse = await response.json()
      setLogs(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, filters.endpoint, filters.success, filters.ip, token])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    fetchLogs(1)
  }

  const handleClearFilters = () => {
    setFilters({ endpoint: 'all', success: 'all', ip: '' })
    setTimeout(() => fetchLogs(1), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Dashboard - Logs de API</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Endpoint</label>
                  <Select value={filters.endpoint} onValueChange={(value) => handleFilterChange('endpoint', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="consulta_ruc">Consulta RUC</SelectItem>
                      <SelectItem value="consulta_dni">Consulta DNI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Exitoso</SelectItem>
                      <SelectItem value="false">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">IP</label>
                  <Input
                    type="text"
                    value={filters.ip}
                    onChange={(e) => handleFilterChange('ip', e.target.value)}
                    placeholder="Ej: 192.168.1.1"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Aplicar
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Logs de API ({pagination.total} registros)</CardTitle>
              <Button
                onClick={() => fetchLogs(pagination.page)}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refrescar
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="inline-block animate-spin h-8 w-8 text-primary mb-2" />
                  <p className="text-muted-foreground">Cargando logs...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => fetchLogs(pagination.page)}>
                    Reintentar
                  </Button>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No se encontraron logs
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Parámetro</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>País</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Tiempo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {formatDate(log.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.endpoint === 'consulta_ruc' ? 'default' : 'secondary'}>
                                {log.endpoint}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.parameter || '-'}
                            </TableCell>
                            <TableCell className="text-sm">{log.ip || '-'}</TableCell>
                            <TableCell className="text-sm">{log.country || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={log.success ? 'default' : 'destructive'}>
                                {log.success ? 'Exitoso' : 'Fallido'}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.statusCode}</TableCell>
                            <TableCell className="text-sm">
                              {log.responseTime ? `${log.responseTime}ms` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando{' '}
                      <span className="font-medium text-foreground">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium text-foreground">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de <span className="font-medium text-foreground">{pagination.total}</span> registros
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fetchLogs(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        variant="outline"
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNumber: number
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNumber = pagination.totalPages - 4 + i
                          } else {
                            pageNumber = pagination.page - 2 + i
                          }

                          return (
                            <Button
                              key={pageNumber}
                              onClick={() => fetchLogs(pageNumber)}
                              variant={pagination.page === pageNumber ? 'default' : 'outline'}
                              size="sm"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        onClick={() => fetchLogs(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        variant="outline"
                        size="sm"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
