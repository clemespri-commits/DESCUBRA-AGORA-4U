import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'
import { MovieResult } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Função para buscar no TMDB
async function searchTMDB(query: string, platform?: string) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '8c7e1f3a5d4b2c9e6f0a1b3c4d5e6f7a' // API key de exemplo
  
  try {
    // Busca multi (filmes e séries)
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
    )
    
    if (!response.ok) {
      console.error('Erro ao buscar no TMDB:', response.status)
      return []
    }
    
    const data = await response.json()
    
    // Mapear resultados do TMDB para nosso formato
    const results = data.results
      ?.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      ?.slice(0, 12)
      ?.map((item: any) => ({
        id: `tmdb-${item.id}`,
        title: item.title || item.name,
        description: item.overview || 'Sem descrição disponível',
        year: item.release_date ? new Date(item.release_date).getFullYear() : 
              item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
        genre: item.media_type === 'movie' ? 'Filme' : 'Série',
        platform: platform && platform !== 'all' ? platform : 'Streaming',
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : null,
        posterUrl: item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
      })) || []
    
    return results
  } catch (error) {
    console.error('Erro na busca TMDB:', error)
    return []
  }
}

// Base de dados local expandida (fallback)
const contentDatabase = [
  {
    id: '1',
    title: 'Star Wars: Uma Nova Esperança',
    description: 'Épica batalha espacial com sabres de luz e a Força',
    year: 1977,
    genre: 'Ficção Científica',
    director: 'George Lucas',
    cast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher'],
    platform: 'Disney+',
    rating: 8.6,
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop'
  },
  {
    id: '2',
    title: 'Na Linha de Fogo',
    description: 'Clint Eastwood protege o presidente dos EUA',
    year: 1993,
    genre: 'Thriller',
    director: 'Wolfgang Petersen',
    cast: ['Clint Eastwood', 'John Malkovich'],
    platform: 'Prime Video',
    rating: 7.2,
    posterUrl: 'https://images.unsplash.com/photo-1574267432644-f610a4b3a93a?w=400&h=600&fit=crop'
  },
  {
    id: '3',
    title: '50 Primeiros Encontros',
    description: 'Comédia romântica no Hawaii com Adam Sandler',
    year: 2004,
    genre: 'Comédia Romântica',
    director: 'Peter Segal',
    cast: ['Adam Sandler', 'Drew Barrymore'],
    platform: 'Netflix',
    rating: 6.8,
    posterUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop'
  },
  {
    id: '4',
    title: 'Guardiões da Galáxia',
    description: 'Aventura espacial com armas futuristas e batalhas intergalácticas',
    year: 2014,
    genre: 'Ficção Científica',
    director: 'James Gunn',
    cast: ['Chris Pratt', 'Zoe Saldana', 'Dave Bautista'],
    platform: 'Disney+',
    rating: 8.0,
    posterUrl: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&h=600&fit=crop'
  },
  {
    id: '5',
    title: 'Interestelar',
    description: 'Viagem espacial épica através de buracos negros',
    year: 2014,
    genre: 'Ficção Científica',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway'],
    platform: 'Prime Video',
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop'
  },
  {
    id: '6',
    title: 'Ressaca em Las Vegas',
    description: 'Comédia hilária sobre uma despedida de solteiro',
    year: 2009,
    genre: 'Comédia',
    director: 'Todd Phillips',
    cast: ['Bradley Cooper', 'Ed Helms', 'Zach Galifianakis'],
    platform: 'Netflix',
    rating: 7.7,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop'
  },
  {
    id: '7',
    title: 'Breaking Bad',
    description: 'Série dramática sobre um professor que se torna produtor de metanfetamina',
    year: 2008,
    genre: 'Drama',
    director: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul'],
    platform: 'Netflix',
    rating: 9.5,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'
  },
  {
    id: '8',
    title: 'The Mandalorian',
    description: 'Série de Star Wars sobre um caçador de recompensas',
    year: 2019,
    genre: 'Ficção Científica',
    director: 'Jon Favreau',
    cast: ['Pedro Pascal'],
    platform: 'Disney+',
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop'
  },
  // Conteúdo Globoplay integrado
  {
    id: 'gp1',
    title: 'Pantanal',
    description: 'Novela sobre amor, vingança e natureza no coração do Brasil',
    year: 2022,
    genre: 'Novela',
    director: 'Rogério Gomes',
    cast: ['Marcos Palmeira', 'Dira Paes'],
    platform: 'Globoplay',
    rating: 9.2,
    posterUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop'
  },
  {
    id: 'gp2',
    title: 'Travessia',
    description: 'Drama sobre identidade, amor e recomeços',
    year: 2022,
    genre: 'Novela',
    director: 'Mauro Mendonça Filho',
    cast: ['Lucy Alves', 'Romulo Estrela'],
    platform: 'Globoplay',
    rating: 7.8,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop'
  },
  {
    id: 'gp3',
    title: 'Todas as Flores',
    description: 'Minissérie sobre vingança e segredos de família',
    year: 2022,
    genre: 'Drama',
    director: 'Carlos Araújo',
    cast: ['Sophie Charlotte', 'Regina Casé'],
    platform: 'Globoplay',
    rating: 8.5,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'
  },
  {
    id: 'gp4',
    title: 'Verdades Secretas',
    description: 'Série dramática sobre o mundo da moda e seus segredos obscuros',
    year: 2021,
    genre: 'Drama',
    director: 'Amora Mautner',
    cast: ['Camila Queiroz', 'Romulo Estrela'],
    platform: 'Globoplay',
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop'
  },
  {
    id: 'gp5',
    title: 'Cidade Invisível',
    description: 'Série de fantasia brasileira sobre folclore urbano',
    year: 2021,
    genre: 'Fantasia',
    director: 'Carlos Saldanha',
    cast: ['Marco Pigossi', 'Alessandra Negrini'],
    platform: 'Globoplay',
    rating: 7.5,
    posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop'
  },
  {
    id: 'gp6',
    title: 'Sob Pressão',
    description: 'Série médica dramática sobre o cotidiano de um hospital público',
    year: 2016,
    genre: 'Drama Médico',
    director: 'Andrucha Waddington',
    cast: ['Julio Andrade', 'Marjorie Estiano'],
    platform: 'Globoplay',
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=600&fit=crop'
  },
  {
    id: 'gp7',
    title: 'Aruanas',
    description: 'Série sobre ativismo ambiental na Amazônia',
    year: 2019,
    genre: 'Drama',
    director: 'Estela Renner',
    cast: ['Débora Falabella', 'Taís Araújo'],
    platform: 'Globoplay',
    rating: 8.1,
    posterUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=600&fit=crop'
  },
  {
    id: 'gp8',
    title: 'Irmandade',
    description: 'Série policial sobre crime organizado e corrupção',
    year: 2019,
    genre: 'Policial',
    director: 'Pedro Morelli',
    cast: ['Seu Jorge', 'Naruna Costa'],
    platform: 'Globoplay',
    rating: 7.9,
    posterUrl: 'https://images.unsplash.com/photo-1574267432644-f610a4b3a93a?w=400&h=600&fit=crop'
  },
  {
    id: 'gp9',
    title: 'Justiça',
    description: 'Minissérie sobre o sistema judiciário brasileiro',
    year: 2016,
    genre: 'Drama',
    director: 'José Luiz Villamarim',
    cast: ['Débora Bloch', 'Jesuíta Barbosa'],
    platform: 'Globoplay',
    rating: 8.4,
    posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=600&fit=crop'
  },
  {
    id: 'gp10',
    title: 'O Rebu',
    description: 'Minissérie de suspense sobre uma festa que termina em tragédia',
    year: 2014,
    genre: 'Suspense',
    director: 'Jayme Monjardim',
    cast: ['Débora Bloch', 'Maitê Proença'],
    platform: 'Globoplay',
    rating: 8.0,
    posterUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { query, platform, userId } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Por favor, descreva o que você está procurando' },
        { status: 400 }
      )
    }

    // Primeiro, tentar buscar no TMDB (API real)
    let tmdbResults = await searchTMDB(query, platform)

    // Usar OpenAI para analisar a query e extrair intenções
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em recomendar filmes e séries. Analise a descrição do usuário e extraia informações relevantes como gênero, tema, atores, diretor, época e plataforma. Retorne um JSON com: { "genre": string, "themes": string[], "actors": string[], "director": string, "keywords": string[], "searchTerms": string[] }`
        },
        {
          role: 'user',
          content: query
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')

    // Filtrar conteúdo local baseado na análise da IA
    let filteredContent = contentDatabase

    // Filtrar por plataforma se especificada
    if (platform && platform !== 'all') {
      filteredContent = filteredContent.filter(
        item => item.platform?.toLowerCase() === platform.toLowerCase()
      )
      
      // Também filtrar resultados do TMDB
      if (tmdbResults.length > 0) {
        tmdbResults = tmdbResults.map(item => ({
          ...item,
          platform: platform
        }))
      }
    }

    // Sistema de scoring MELHORADO - muito mais flexível
    const scoredContent = filteredContent.map(item => {
      let score = 0
      const itemText = `${item.title} ${item.description} ${item.genre} ${item.director} ${item.cast?.join(' ')}`.toLowerCase()
      const queryLower = query.toLowerCase()
      
      // Busca direta no texto (mais importante)
      const queryWords = queryLower.split(' ').filter(w => w.length > 2)
      queryWords.forEach(word => {
        if (itemText.includes(word)) {
          score += 5
        }
      })

      // Verificar keywords da IA
      if (analysis.keywords) {
        analysis.keywords.forEach((keyword: string) => {
          if (itemText.includes(keyword.toLowerCase())) {
            score += 3
          }
        })
      }

      // Verificar termos de busca sugeridos pela IA
      if (analysis.searchTerms) {
        analysis.searchTerms.forEach((term: string) => {
          if (itemText.includes(term.toLowerCase())) {
            score += 4
          }
        })
      }

      // Verificar gênero
      if (analysis.genre && itemText.includes(analysis.genre.toLowerCase())) {
        score += 4
      }

      // Verificar atores
      if (analysis.actors) {
        analysis.actors.forEach((actor: string) => {
          if (itemText.includes(actor.toLowerCase())) {
            score += 6
          }
        })
      }

      // Verificar diretor
      if (analysis.director && itemText.includes(analysis.director.toLowerCase())) {
        score += 6
      }

      // Verificar temas
      if (analysis.themes) {
        analysis.themes.forEach((theme: string) => {
          if (itemText.includes(theme.toLowerCase())) {
            score += 3
          }
        })
      }

      // Boost para conteúdo popular (rating alto)
      if (item.rating && item.rating > 8.0) {
        score += 2
      }

      return { ...item, score }
    })

    // Ordenar por score - ACEITAR QUALQUER SCORE > 0
    const localResults = scoredContent
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ score, ...item }) => item)

    // Combinar resultados do TMDB com resultados locais
    let finalResults = [...tmdbResults, ...localResults]

    // Se ainda não tiver resultados suficientes, adicionar os mais populares
    if (finalResults.length < 6) {
      const popularContent = contentDatabase
        .filter(item => !finalResults.some(r => r.id === item.id))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8 - finalResults.length)
      
      finalResults = [...finalResults, ...popularContent]
    }

    // Remover duplicatas e limitar a 12 resultados
    const uniqueResults = Array.from(
      new Map(finalResults.map(item => [item.id, item])).values()
    ).slice(0, 12)

    // Salvar no Supabase se userId fornecido
    if (userId) {
      try {
        const { error } = await supabase
          .from('search_history')
          .insert({
            user_id: userId,
            query,
            platform: platform || 'all',
            results_count: uniqueResults.length,
            ai_analysis: analysis,
          })

        if (error) {
          console.error('Erro ao salvar histórico:', error)
        }
      } catch (supabaseError) {
        console.error('Erro de conexão com Supabase:', supabaseError)
      }
    }

    return NextResponse.json({
      results: uniqueResults,
      analysis,
      total: uniqueResults.length,
    })

  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Ops! Algo deu errado ao processar sua busca. Tente novamente.' },
      { status: 500 }
    )
  }
}
