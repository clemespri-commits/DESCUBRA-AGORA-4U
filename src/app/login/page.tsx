'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    })

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Descubra Agora 4U</h1>
          <p className="text-purple-300">Entre para salvar suas pesquisas</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-purple-300">
              Faça login ou crie sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#a855f7',
                      brandAccent: '#9333ea',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'rgba(255, 255, 255, 0.05)',
                      defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.1)',
                      defaultButtonBorder: 'rgba(255, 255, 255, 0.1)',
                      defaultButtonText: 'white',
                      dividerBackground: 'rgba(255, 255, 255, 0.1)',
                      inputBackground: 'rgba(255, 255, 255, 0.05)',
                      inputBorder: 'rgba(255, 255, 255, 0.1)',
                      inputBorderHover: 'rgba(168, 85, 247, 0.5)',
                      inputBorderFocus: 'rgba(168, 85, 247, 0.8)',
                      inputText: 'white',
                      inputLabelText: 'rgba(216, 180, 254, 1)',
                      inputPlaceholder: 'rgba(216, 180, 254, 0.5)',
                    },
                    space: {
                      inputPadding: '12px',
                      buttonPadding: '12px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  container: 'auth-container',
                  button: 'auth-button',
                  input: 'auth-input',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    social_provider_text: 'Criar conta com {{provider}}',
                    link_text: 'Não tem uma conta? Cadastre-se',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    button_label: 'Enviar instruções',
                    loading_button_label: 'Enviando...',
                    link_text: 'Esqueceu sua senha?',
                  },
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/dashboard`}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-purple-300 mt-6">
          Ao continuar, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  )
}
