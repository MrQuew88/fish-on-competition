import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieHeader = request.headers.get('cookie')
    const supabase = createServerClient(cookieHeader)
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/competitions', requestUrl.origin))
}
