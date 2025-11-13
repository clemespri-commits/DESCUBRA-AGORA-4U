import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Base de dados simulada do Globoplay (em produção seria API real)
const globoplayContent = [
  {
    id: 'gp1',
    title: 'Pantanal',
    description: 'Novela sobre amor, vingança e natureza no coração do Brasil',
    year: 2022,
    genre: 'Novela',
    type: 'Novela',
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
    type: 'Novela',
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
    type: 'Minissérie',
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
    type: 'Série',
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
    type: 'Série',
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
    type: 'Série',
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
    type: 'Série',
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
    type: 'Série',
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
    type: 'Minissérie',
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
    type: 'Minissérie',
    platform: 'Globoplay',
    rating: 8.0,
    posterUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Descrição da pesquisa é obrigatória' },
        { status: 400 }
      )
    }

    // Usar OpenAI para analisar a query
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em conteúdo brasileiro do Globoplay (novelas, séries, minisséries).
Analise a descrição do usuário e extraia: gênero, tema, tipo de conteúdo (novela/série/minissérie), atores, época.
Retorne um JSON com: { "genre": string, "type": string, "themes": string[], "keywords": string[] }`
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
    const scoredContent = globoplayContent.map(item => {
      let score = 0
      const itemText = `${item.title} ${item.description} ${item.genre} ${item.type}`.toLowerCase()
      
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

      // Verificar tipo (novela/série/minissérie)
      if (analysis.type && itemText.includes(analysis.type.toLowerCase())) {
        score += 4
      }

      // Verificar temas
      if (analysis.themes) {
        analysis.themes.forEach((theme: string) => {
          if (itemText.includes(theme.toLowerCase())) {
            score += 2
          }
        })
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
      : globoplayContent.slice(0, 6)

    return NextResponse.json({
      results: finalResults,
      analysis,
      total: finalResults.length,
      platform: 'Globoplay'
    })

  } catch (error) {
    console.error('Erro na busca Globoplay:', error)
    return NextResponse.json(
      { error: 'Erro ao processar busca no Globoplay' },
      { status: 500 }
    )
  }
}
