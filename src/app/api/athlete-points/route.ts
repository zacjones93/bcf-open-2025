import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('athlete_id')
    const workoutId = searchParams.get('workout_id')

    const supabase = createClient()
    let query = supabase
      .from('athlete_points')
      .select(`
        *,
        athlete:athletes(*),
        point_type:point_types(*),
        workout:workouts(*)
      `)

    if (athleteId) {
      query = query.eq('athlete_id', athleteId)
    }

    if (workoutId) {
      query = query.eq('workout_id', workoutId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch athlete points' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.athlete_id || !body.point_type_id) {
      return NextResponse.json(
        { error: 'athlete_id and point_type_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('athlete_points')
      .insert([body])
      .select(`
        *,
        athlete:athletes(*),
        point_type:point_types(*),
        workout:workouts(*)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create athlete points' },
      { status: 500 }
    )
  }
} 