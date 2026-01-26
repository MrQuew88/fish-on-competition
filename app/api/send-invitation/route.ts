import { NextResponse } from 'next/server'
import { Resend } from 'resend'
export async function POST(request: Request) {
  console.log('=== API send-invitation appelée ===')

  try {
    const { email, token, competition } = await request.json()
    console.log('Email destinataire:', email)
    console.log('Token:', token)
    console.log('Resend API Key présente:', !!process.env.RESEND_API_KEY)
    console.log('Resend API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`
    console.log('URL invitation:', inviteUrl)
    console.log('Tentative d\'envoi email...')
    const result = await resend.emails.send({
      from: 'Fish On! Competition <onboarding@resend.dev>',
      to: email,
      subject: `Invitation : ${competition.name}`,
      html: `
        <h1>Vous êtes invité à une compétition de pêche !</h1>
        <p><strong>${competition.name}</strong></p>
        <p>📅 Du ${new Date(competition.start_date).toLocaleDateString('fr-FR')} au ${new Date(competition.end_date).toLocaleDateString('fr-FR')}</p>
        <p>📍 ${competition.location}</p>
        <p>🐟 Espèce : ${competition.species}</p>
        ${competition.prize ? `<p>🏆 Récompense : ${competition.prize}</p>` : ''}
        <br/>
        <p><a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accepter l'invitation</a></p>
      `,
    })
    console.log('Résultat Resend:', result)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('=== ERREUR envoi email ===')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Error object:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
