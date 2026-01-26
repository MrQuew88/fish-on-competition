import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
export async function POST(request: Request) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')

    // Parser les cookies pour trouver le token Supabase
    let accessToken = null
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = decodeURIComponent(value)
        return acc
      }, {} as Record<string, string>)

      // Trouver le token dans les cookies (le nom peut varier)
      for (const [key, value] of Object.entries(cookies)) {
        if (key.includes('auth-token') && value.startsWith('base64-')) {
          try {
            const decoded = JSON.parse(atob(value.replace('base64-', '')))
            accessToken = decoded.access_token
            break
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const body = await request.json()

    // Créer la compétition
    const { data, error } = await supabase
      .from('competitions')
      .insert({
        creator_id: user.id,
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date,
        description: body.description || null,
        prize: body.prize || null,
        species: 'Brochet',
        location: body.location,
        max_participants: body.max_participants,
        status: 'draft',
        rule_top_x_biggest: body.rule_top_x_biggest || null,
        rule_total_count: body.rule_total_count || false,
        rule_record_size: body.rule_record_size || false,
      })
      .select()
      .single()
    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
