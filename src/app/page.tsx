'use client'

import { useState } from 'react'
import { Search, Sparkles, Film, Tv, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MovieResult } from '@/lib/types'

export default function SearchInterface() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('all')
  const [results, setResults] = useState<MovieResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, platform }),
      })

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  const exampleSearches = [
    'filmes de ficção científica sobre batalhas espaciais',
    'eastwood a proteger o presidente',
    'comédia no Hawaii',
    'série sobre crime e drogas'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Descubra Agora 4U</h1>
              <p className="text-sm text-purple-300">Encontre seu próximo conteúdo favorito</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O que você quer assistir hoje?
            </h2>
            <p className="text-lg text-purple-200">
              Descreva o que procura e nossa IA encontrará o conteúdo perfeito
            </p>
          </div>

          {/* Search Bar */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      placeholder="Ex: filmes de ação com perseguições de carro..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="w-full sm:w-48 h-14 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Plataformas</SelectItem>
                      <SelectItem value="Netflix">Netflix</SelectItem>
                      <SelectItem value="Disney+">Disney+</SelectItem>
                      <SelectItem value="Prime Video">Prime Video</SelectItem>
                      <SelectItem value="HBO Max">HBO Max</SelectItem>
                      <SelectItem value="Apple TV+">Apple TV+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Buscar com IA
                    </>
                  )}
                </Button>
              </div>

              {/* Example Searches */}
              {!searched && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-purple-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Experimente pesquisar:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exampleSearches.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(example)}
                        className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-purple-200 transition-all duration-200 hover:scale-105"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {searched && (
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                    <div className="aspect-[2/3] bg-white/5 animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Encontramos {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                  </h3>
                  <p className="text-purple-300">Baseado na sua descrição</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((item) => (
                    <Card
                      key={item.id}
                      className="group bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {item.rating && (
                          <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-black font-bold">
                            ⭐ {item.rating}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-purple-300 mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-purple-400">
                          <span className="flex items-center gap-1">
                            {item.genre?.includes('Série') || item.title.includes('Breaking Bad') || item.title.includes('Mandalorian') ? (
                              <Tv className="w-3 h-3" />
                            ) : (
                              <Film className="w-3 h-3" />
                            )}
                            {item.year}
                          </span>
                          {item.platform && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                              {item.platform}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Search className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-purple-300">Tente descrever de outra forma ou escolha outra plataforma</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Features */}
        {!searched && (
          <div className="max-w-6xl mx-auto mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Busca Inteligente</h3>
                <p className="text-purple-300 text-sm">
                  Nossa IA entende descrições naturais e encontra exatamente o que você procura
                </p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Histórico Salvo</h3>
                <p className="text-purple-300 text-sm">
                  Todas suas pesquisas ficam salvas para você consultar depois
                </p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Múltiplas Plataformas</h3>
                <p className="text-purple-300 text-sm">
                  Busque em Netflix, Disney+, Prime Video e muito mais
                </p>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
