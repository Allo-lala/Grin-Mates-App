import { NextRequest, NextResponse } from 'next/server';
import { db, greenPointsQueries } from '@/lib/database';

// Submit animal rescue report
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      animalType,
      locationDescription,
      latitude,
      longitude,
      urgencyLevel,
      description,
      imageUrls
    } = await request.json();

    if (!userId || !locationDescription) {
      return NextResponse.json(
        { error: 'User ID and location description are required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      INSERT INTO animal_rescues (
        user_id, animal_type, location_description, latitude, longitude,
        urgency_level, description, image_urls, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'reported')
      RETURNING *
    `, [
      userId, animalType, locationDescription, latitude, longitude,
      urgencyLevel || 'medium', description, 
      imageUrls ? JSON.stringify(imageUrls) : null
    ]);

    const rescue = result.rows[0];

    // Award green points based on urgency
    const pointsMap: Record<string, number> = {
      low: 20,
      medium: 30,
      high: 50,
      critical: 75
    };
    const points = pointsMap[urgencyLevel || 'medium'];

    await greenPointsQueries.addPoints(
      userId,
      points,
      'animal_rescue',
      rescue.id,
      `Animal rescue report: ${animalType || 'Unknown animal'}`
    );

    return NextResponse.json({
      success: true,
      message: 'Animal rescue report submitted successfully',
      report: {
        id: rescue.id,
        status: rescue.status,
        urgencyLevel: rescue.urgency_level,
        createdAt: rescue.created_at
      },
      greenPointsEarned: points
    });

  } catch (error) {
    console.error('Submit animal rescue error:', error);
    return NextResponse.json(
      { error: 'Failed to submit animal rescue report' },
      { status: 500 }
    );
  }
}

// Get animal rescue reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM animal_rescues';
    const params: any[] = [];

    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    if (status) {
      query += userId ? ' AND status = $2' : ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await db.query(query, params);

    return NextResponse.json({
      success: true,
      reports: result.rows.map((report: any) => ({
        id: report.id,
        animalType: report.animal_type,
        locationDescription: report.location_description,
        latitude: report.latitude,
        longitude: report.longitude,
        urgencyLevel: report.urgency_level,
        description: report.description,
        imageUrls: report.image_urls,
        status: report.status,
        rescuerAssigned: report.rescuer_assigned,
        rescueDate: report.rescue_date,
        greenPointsEarned: report.green_points_earned,
        createdAt: report.created_at
      }))
    });

  } catch (error) {
    console.error('Get animal rescue reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get animal rescue reports' },
      { status: 500 }
    );
  }
}