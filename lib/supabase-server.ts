import { createClient } from '@supabase/supabase-js'
export function createServerClient(cookieHeader: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Si on a un cookie header, on l'utilise pour récupérer la session
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    // Chercher le token d'accès dans les cookies
    const accessToken = cookies['sb-access-token'] || cookies['sb-hijigtcarzzpoahfjdnc-auth-token']

    if (accessToken) {
      // Note: avec le client standard, on ne peut pas injecter directement le token
      // On va devoir utiliser une approche différente
    }
  }

  return supabase
}
