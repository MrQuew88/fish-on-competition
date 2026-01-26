export interface Profile {
  id: string
  email: string
  name: string | null
  punchline: string | null
  created_at: string
}

export interface Competition {
  id: string
  creator_id: string
  name: string
  description: string | null
  prize: string | null
  species: string
  location: string
  start_date: string
  end_date: string
  max_participants: number
  status: 'draft' | 'active' | 'finished'
  rule_top_x_biggest: number | null
  rule_total_count: boolean
  rule_record_size: boolean
  started_at: string | null
  finished_at: string | null
  created_at: string
}

export interface Participant {
  id: string
  competition_id: string
  user_id: string | null
  invitation_token: string
  status: 'invited' | 'accepted' | 'declined'
  joined_at: string | null
  created_at: string
}

export interface Catch {
  id: string
  competition_id: string
  user_id: string
  count: number
  size: number | null
  lure: string | null
  photo_url: string | null
  recorded_at: string
  created_at: string
}
