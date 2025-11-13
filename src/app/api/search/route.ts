import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'
import { MovieResult } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Base de dados simulada de filmes/séries (em produção, seria uma API real como TMDB)
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
  }
]

export async function POST(request: NextRequest) {
  try {
    const { query, platform } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Descrição da pesquisa é obrigatória' },
        { status: 400 }
      )
    }

    // Usar OpenAI para analisar a query e extrair intenções
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em recomendar filmes, séries, novelas e minisséries.
Analise a descrição do usuário e extraia: gênero, tema, atores, diretor, época, plataforma de streaming.
Retorne um JSON com: { "genre": string, "themes": string[], "actors": string[], "director": string, "keywords": string[] }`
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

    // Filtrar conteúdo baseado na análise da IA
    let filteredContent = contentDatabase

    // Filtrar por plataforma se especificada
    if (platform && platform !== 'all') {
      filteredContent = filteredContent.filter(
        item => item.platform?.toLowerCase() === platform.toLowerCase()
      )
    }

    // Scoring simples baseado nas keywords da IA
    const scoredContent = filteredContent.map(item => {
      let score = 0
      const itemText = `${item.title} ${item.description} ${item.genre} ${item.director} ${item.cast?.join(' ')}`.toLowerCase()
      
      // Verificar keywords
      if (analysis.keywords) {
        analysis.keywords.forEach((keyword: string) => {
          if (itemText.includes(keyword.toLowerCase())) {
            score += 2
          }
        })
      }

      // Verificar gênero
      if (analysis.genre && itemText.includes(analysis.genre.toLowerCase())) {
        score += 3
      }

      // Verificar atores
      if (analysis.actors) {
        analysis.actors.forEach((actor: string) => {
          if (itemText.includes(actor.toLowerCase())) {
            score += 4
          }
        })
      }

      // Verificar diretor
      if (analysis.director && itemText.includes(analysis.director.toLowerCase())) {
        score += 4
      }

      return { ...item, score }
    })

    // Ordenar por score e pegar top resultados
    const results = scoredContent
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ score, ...item }) => item)

    // Se não encontrou resultados com score, retornar os mais populares
    const finalResults = results.length > 0 
      ? results 
      : contentDatabase.slice(0, 6)

    // Salvar no Supabase
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          query,
          platform: platform || 'all',
          results: finalResults,
          ai_analysis: analysis,
        })

      if (error) {
        console.error('Erro ao salvar no Supabase:', error)
      }
    } catch (supabaseError) {
      console.error('Erro de conexão com Supabase:', supabaseError)
    }

    return NextResponse.json({
      results: finalResults,
      analysis,
      total: finalResults.length,
    })

  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao processar busca' },
      { status: 500 }
    )
  }
}
