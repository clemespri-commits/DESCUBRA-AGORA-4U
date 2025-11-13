'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, Film, Tv, Clock, TrendingUp, LogOut, User, History, HelpCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { MovieResult } from '@/lib/types'

interface SearchHistory {
  id: string
  query: string
  platform: string
  created_at: string
  results_count: number
}

interface MovieIdentification {
  id: string
  user_description: string
  identified_title: string
  identified_year: number
  identified_synopsis: string
  confidence_score: number
  created_at: string
}

interface FoundContent {
  id: string
  title: string
  description: string
  year: number
  genre: string
  platform: string
  rating: number
  poster_url: string
  search_query: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('all')
  const [results, setResults] = useState<MovieResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [history, setHistory] = useState<SearchHistory[]>([])
  
  // Qual Filme Eu Vi?
  const [movieDescription, setMovieDescription] = useState('')
  const [identifyLoading, setIdentifyLoading] = useState(false)
  const [identificationResult, setIdentificationResult] = useState<any>(null)
  const [identificationHistory, setIdentificationHistory] = useState<MovieIdentification[]>([])
  
  // Conteúdos encontrados
  const [foundContents, setFoundContents] = useState<FoundContent[]>([])

  useEffect(() => {
    // Verificar autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadHistory(session.user.id)
        loadIdentificationHistory(session.user.id)
        loadFoundContents(session.user.id)
        setLoading(false)
      } else {
        router.push('/login')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadHistory(session.user.id)
        loadIdentificationHistory(session.user.id)
        loadFoundContents(session.user.id)
      } else {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setHistory(data)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const loadIdentificationHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('movie_identification')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setIdentificationHistory(data)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de identificações:', error)
    }
  }

  const loadFoundContents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('found_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setFoundContents(data)
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos encontrados:', error)
    }
  }

  const saveFoundContent = async (content: MovieResult) => {
    if (!user) return

    try {
      await supabase
        .from('found_content')
        .insert({
          user_id: user.id,
          content_id: content.id,
          title: content.title,
          description: content.description,
          year: content.year,
          genre: content.genre,
          platform: content.platform,
          rating: content.rating,
          poster_url: content.posterUrl,
          search_query: query,
        })

      loadFoundContents(user.id)
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error)
    }
  }

  const handleSearch = async () => {
    if (!query.trim() || !user) return

    setSearchLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, platform, userId: user.id }),
      })

      const data = await response.json()
      setResults(data.results || [])
      
      loadHistory(user.id)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleIdentifyMovie = async () => {
    if (!movieDescription.trim() || !user) return

    setIdentifyLoading(true)

    try {
      const response = await fetch('/api/identify-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: movieDescription, userId: user.id }),
      })

      const data = await response.json()
      setIdentificationResult(data.identification)
      
      loadIdentificationHistory(user.id)
    } catch (error) {
      console.error('Erro na identificação:', error)
    } finally {
      setIdentifyLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const loadHistorySearch = (historyItem: SearchHistory) => {
    setQuery(historyItem.query)
    setPlatform(historyItem.platform)
  }

  const exampleSearches = [
    'filmes de ação com perseguições',
    'comédia romântica leve',
    'série sobre crime',
    'novela brasileira',
    'filme de terror',
    'documentário interessante'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Descubra Agora 4U</h1>
                <p className="text-xs text-purple-300">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">{user?.email}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 text-white text-xs sm:text-sm">
              <Search className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Buscar</span>
            </TabsTrigger>
            <TabsTrigger value="identify" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 text-white text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Qual Filme?</span>
            </TabsTrigger>
            <TabsTrigger value="found" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 text-white text-xs sm:text-sm">
              <Star className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Encontrados</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 text-white text-xs sm:text-sm">
              <History className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
            <div className="max-w-4xl mx-auto mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  O que você quer assistir hoje?
                </h2>
                <p className="text-lg text-purple-200">
                  Descreva o que procura e nossa IA encontrará o conteúdo perfeito
                </p>
              </div>

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
                          <SelectItem value="Globoplay">Globoplay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={searchLoading || !query.trim()}
                      className="h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {searchLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Procurando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Buscar com IA
                        </>
                      )}
                    </Button>
                  </div>

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

            {searched && (
              <div className="max-w-7xl mx-auto">
                {searchLoading ? (
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
                            <Button
                              size="sm"
                              onClick={() => saveFoundContent(item)}
                              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-purple-500 hover:bg-purple-600"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-sm text-purple-300 mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between text-xs text-purple-400">
                              <span className="flex items-center gap-1">
                                {item.genre?.includes('Série') || item.genre?.includes('Novela') || item.title.includes('Breaking Bad') || item.title.includes('Mandalorian') ? (
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
                        <h3 className="text-xl font-bold text-white mb-2">Hmm, não encontramos nada</h3>
                        <p className="text-purple-300">Tente descrever de outra forma ou escolha outra plataforma</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Identify Movie Tab */}
          <TabsContent value="identify">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Qual Filme Eu Vi?
                </h2>
                <p className="text-lg text-purple-200">
                  Descreva o que você lembra e nossa IA identificará o filme ou série
                </p>
              </div>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <Textarea
                      placeholder="Ex: Um filme onde um cara acorda todo dia no mesmo dia e tem que salvar uma cidade..."
                      value={movieDescription}
                      onChange={(e) => setMovieDescription(e.target.value)}
                      className="min-h-32 bg-white/5 border-white/10 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                    <Button
                      onClick={handleIdentifyMovie}
                      disabled={identifyLoading || !movieDescription.trim()}
                      className="h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {identifyLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Identificando...
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-5 h-5 mr-2" />
                          Identificar com IA
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {identificationResult && (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl mb-8">
                  <CardContent className="p-6">
                    {identificationResult.identified ? (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{identificationResult.title}</h3>
                            <p className="text-purple-300">Ano: {identificationResult.year}</p>
                          </div>
                          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/50">
                            {identificationResult.confidence}% confiança
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">Sinopse:</h4>
                            <p className="text-white">{identificationResult.synopsis}</p>
                          </div>
                          
                          {identificationResult.director && (
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-1">Diretor:</h4>
                              <p className="text-white">{identificationResult.director}</p>
                            </div>
                          )}
                          
                          {identificationResult.cast && identificationResult.cast.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-1">Elenco:</h4>
                              <p className="text-white">{identificationResult.cast.join(', ')}</p>
                            </div>
                          )}
                          
                          {identificationResult.platform && (
                            <div>
                              <h4 className="text-sm font-semibold text-purple-300 mb-1">Disponível em:</h4>
                              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                {identificationResult.platform}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="pt-4 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">Como identificamos:</h4>
                            <p className="text-sm text-purple-200">{identificationResult.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                          <HelpCircle className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Não conseguimos identificar com certeza</h3>
                        <p className="text-purple-300 mb-4">Mas aqui estão algumas possibilidades:</p>
                        
                        {identificationResult.possibleMatches && identificationResult.possibleMatches.length > 0 && (
                          <div className="space-y-3 text-left">
                            {identificationResult.possibleMatches.map((match: any, index: number) => (
                              <Card key={index} className="bg-white/5 border-white/10 p-4">
                                <h4 className="font-bold text-white mb-1">{match.title} ({match.year})</h4>
                                <p className="text-sm text-purple-300">{match.synopsis}</p>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {identificationHistory.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Identificações Anteriores</h3>
                  <div className="space-y-3">
                    {identificationHistory.map((item) => (
                      <Card key={item.id} className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-purple-300">
                                  {new Date(item.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-purple-200 mb-2 italic">"{item.user_description}"</p>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-green-400" />
                                <p className="text-white font-medium">{item.identified_title} ({item.identified_year})</p>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                                  {item.confidence_score}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Found Content Tab */}
          <TabsContent value="found">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Conteúdos Encontrados</h2>
                <p className="text-purple-300">Seus filmes e séries salvos</p>
              </div>

              {foundContents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {foundContents.map((item) => (
                    <Card
                      key={item.id}
                      className="group bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <img
                          src={item.poster_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {item.rating && (
                          <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-black font-bold">
                            ⭐ {item.rating}
                          </Badge>
                        )}
                        <Badge className="absolute top-3 left-3 bg-purple-500/90 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Salvo
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-purple-300 mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-purple-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            {item.year}
                          </span>
                          {item.platform && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                              {item.platform}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-purple-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Nenhum conteúdo salvo ainda</h3>
                      <p className="text-purple-300">Clique na estrela nos resultados de busca para salvar</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Histórico de Pesquisas</h2>
                <p className="text-purple-300">Suas últimas buscas salvas</p>
              </div>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                      onClick={() => loadHistorySearch(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-purple-300">
                                {new Date(item.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-white font-medium mb-1">{item.query}</p>
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                {item.platform === 'all' ? 'Todas Plataformas' : item.platform}
                              </Badge>
                              <span>•</span>
                              <span>{item.results_count} resultados</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-400 hover:text-purple-300 hover:bg-white/5"
                          >
                            Buscar novamente
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <History className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Nenhuma pesquisa ainda</h3>
                      <p className="text-purple-300">Faça sua primeira busca para começar seu histórico</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
