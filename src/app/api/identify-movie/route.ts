import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { description, userId } = await request.json()

    if (!description) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      )
    }

    // Usar OpenAI para identificar o filme baseado na descrição
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em cinema e televisão. Sua tarefa é identificar filmes, séries, novelas ou minisséries baseado em descrições vagas ou parciais fornecidas pelo usuário.

Analise a descrição e tente identificar:
- Título exato do filme/série
- Ano de lançamento
- Sinopse completa
- Diretor
- Elenco principal
- Gênero
- Plataforma de streaming onde está disponível (Netflix, Disney+, Prime Video, HBO Max, Apple TV+, Globoplay)

Retorne um JSON com:
{
  "identified": boolean,
  "confidence": number (0-100),
  "title": string,
  "year": number,
  "synopsis": string,
  "director": string,
  "cast": string[],
  "genre": string,
  "platform": string,
  "reasoning": string (explicação de como você identificou)
}

Se não conseguir identificar com certeza, retorne as 3 opções mais prováveis em um array "possibleMatches".`
        },
        {
          role: 'user',
          content: description
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const identification = JSON.parse(completion.choices[0].message.content || '{}')

    // Salvar no Supabase se userId fornecido
    if (userId && identification.identified) {
      try {
        await supabase
          .from('movie_identification')
          .insert({
            user_id: userId,
            user_description: description,
            identified_title: identification.title,
            identified_year: identification.year,
            identified_synopsis: identification.synopsis,
            confidence_score: identification.confidence,
            ai_analysis: identification,
          })
      } catch (supabaseError) {
        console.error('Erro ao salvar identificação:', supabaseError)
      }
    }

    return NextResponse.json({
      success: true,
      identification,
    })

  } catch (error) {
    console.error('Erro na identificação:', error)
    return NextResponse.json(
      { error: 'Erro ao processar identificação' },
      { status: 500 }
    )
  }
}
