'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Film, Clock, TrendingUp, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Descubra Agora 4U</h1>
                <p className="text-sm text-purple-300">Encontre seu próximo conteúdo favorito</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Busca Inteligente com IA</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Encontre o conteúdo perfeito
            <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              com Inteligência Artificial
            </span>
          </h2>
          
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Descreva o que você quer assistir em linguagem natural e nossa IA encontrará filmes, séries, novelas e minisséries perfeitos para você
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              variant="outline"
              className="h-14 px-8 border-white/10 text-white hover:bg-white/10"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Busca Inteligente</h3>
            <p className="text-purple-300">
              Nossa IA entende descrições naturais e encontra exatamente o que você procura, analisando títulos, atores, diretores e gêneros
            </p>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Histórico Salvo</h3>
            <p className="text-purple-300">
              Todas suas pesquisas ficam salvas no seu perfil para você consultar e repetir depois quando quiser
            </p>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Múltiplas Plataformas</h3>
            <p className="text-purple-300">
              Busque em Netflix, Disney+, Prime Video, HBO Max, Apple TV+ e descubra onde assistir seu conteúdo favorito
            </p>
          </Card>
        </div>

        {/* Examples */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-3">Como funciona?</h3>
            <p className="text-purple-300">Exemplos de buscas que você pode fazer</p>
          </div>

          <div className="space-y-4">
            {[
              {
                query: 'filmes de ficção científica sobre batalhas espaciais e armas laser',
                icon: TrendingUp,
              },
              {
                query: 'eastwood a proteger o presidente',
                icon: TrendingUp,
              },
              {
                query: 'comédia no Hawaii',
                icon: TrendingUp,
              },
              {
                query: 'série sobre crime e drogas',
                icon: TrendingUp,
              },
            ].map((example, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-xl border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <example.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-white font-medium">{example.query}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-300 text-sm">
            <p>© 2024 Descubra Agora 4U. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
