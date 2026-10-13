import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function RegistroPage() {
  return <RegisterForm />
}
