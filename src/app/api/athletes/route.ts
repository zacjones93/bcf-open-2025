import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('athletes')
      .select(`
        *,
        athlete_teams!inner(
          *,
          team:teams(*)
        ),
        athlete_points(
          *,
          point_type:point_types(*),
          workout:workouts(*)
        )
      `)
      .order('name')

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch athletes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    // First create the athlete
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .insert([{
        name: body.name,
        email: body.email,
        crossfit_id: body.crossfit_id,
        division: body.division,
        user_id: body.user_id
      }])
      .select()
      .single()

    if (athleteError) {
      throw athleteError
    }

    // If a team is specified, create the team association
    if (body.team_id) {
      const { error: teamError } = await supabase
        .from('athlete_teams')
        .insert([{
          athlete_id: athlete.id,
          team_id: body.team_id,
          is_active: true
        }])

      if (teamError) {
        throw teamError
      }
    }

    return NextResponse.json(athlete)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create athlete' },
      { status: 500 }
    )
  }
} 