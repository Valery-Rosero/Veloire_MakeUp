import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

interface PageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirectTo } = await searchParams
  return <LoginForm redirectTo={redirectTo ?? '/'} />
}
