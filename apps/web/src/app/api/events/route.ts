import { NextRequest, NextResponse } from 'next/server';
import { eventQueries, db } from '@/lib/database';

// Get events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'upcoming' | 'past'
    const userId = searchParams.get('userId'); // Get user's events

    if (userId) {
      // Get user's registered events
      const events = await eventQueries.getUserEvents(userId);
      
      return NextResponse.json({
        success: true,
        events: events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          eventType: event.event_type,
          location: event.location,
          startDate: event.start_date,
          endDate: event.end_date,
          imageUrl: event.image_url,
          greenPointsReward: event.green_points_reward,
          attendanceStatus: event.attendance_status,
          registrationDate: event.registration_date
        }))
      });
    }

    // Get upcoming or past events
    let query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
      FROM events e
      WHERE e.status = $1
    `;
    
    const params = [type === 'past' ? 'completed' : 'upcoming'];
    
    if (type === 'upcoming') {
      query += ' AND e.start_date > CURRENT_TIMESTAMP';
    } else if (type === 'past') {
      query += ' AND e.end_date < CURRENT_TIMESTAMP';
    }
    
    query += ' ORDER BY e.start_date DESC LIMIT 50';

    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      events: result.rows.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.event_type,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        startDate: event.start_date,
        endDate: event.end_date,
        maxParticipants: event.max_participants,
        participantCount: event.participant_count,
        registrationDeadline: event.registration_deadline,
        entryFee: event.entry_fee,
        greenPointsReward: event.green_points_reward,
        imageUrl: event.image_url,
        status: event.status
      }))
    });

  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    );
  }
}

// Register for event
export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'User ID and event ID are required' },
        { status: 400 }
      );
    }

    // Check if event exists and is open for registration
    const eventResult = await db.query(`
      SELECT * FROM events 
      WHERE id = $1 AND status = 'upcoming'
      AND (registration_deadline IS NULL OR registration_deadline > CURRENT_TIMESTAMP)
    `, [eventId]);

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found or registration closed' },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Check if already registered
    const existingReg = await db.query(
      'SELECT * FROM event_participants WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (existingReg.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 409 }
      );
    }

    // Check if event is full
    if (event.max_participants) {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM event_participants WHERE event_id = $1',
        [eventId]
      );
      
      if (parseInt(countResult.rows[0].count) >= event.max_participants) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        );
      }
    }

    // Register user
    await eventQueries.registerForEvent(eventId, userId);

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event',
      event: {
        id: event.id,
        title: event.title,
        startDate: event.start_date,
        greenPointsReward: event.green_points_reward
      }
    });

  } catch (error) {
    console.error('Register for event error:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}