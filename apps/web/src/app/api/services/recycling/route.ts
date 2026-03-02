import { NextRequest, NextResponse } from 'next/server';
import { db, greenPointsQueries } from '@/lib/database';

// Submit recycling activity
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      materialType,
      quantity,
      unit,
      location,
      verificationData
    } = await request.json();

    if (!userId || !materialType || !quantity || !unit) {
      return NextResponse.json(
        { error: 'User ID, material type, quantity, and unit are required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      INSERT INTO recycling_activities (
        user_id, material_type, quantity, unit, location,
        verification_data, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [
      userId, materialType, quantity, unit, location,
      verificationData ? JSON.stringify(verificationData) : null
    ]);

    const activity = result.rows[0];

    // Calculate green points based on quantity and material type
    const pointsPerKg: Record<string, number> = {
      plastic: 10,
      paper: 5,
      glass: 8,
      metal: 12,
      electronics: 20
    };
    
    const basePoints = pointsPerKg[materialType.toLowerCase()] || 5;
    const points = Math.floor(parseFloat(quantity) * basePoints);

    // Award points (will be confirmed when verified)
    await db.query(`
      UPDATE recycling_activities 
      SET green_points_earned = $1 
      WHERE id = $2
    `, [points, activity.id]);

    return NextResponse.json({
      success: true,
      message: 'Recycling activity submitted successfully',
      activity: {
        id: activity.id,
        status: activity.status,
        estimatedPoints: points,
        createdAt: activity.created_at
      }
    });

  } catch (error) {
    console.error('Submit recycling activity error:', error);
    return NextResponse.json(
      { error: 'Failed to submit recycling activity' },
      { status: 500 }
    );
  }
}

// Get recycling activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      SELECT * FROM recycling_activities
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return NextResponse.json({
      success: true,
      activities: result.rows.map((activity: any) => ({
        id: activity.id,
        materialType: activity.material_type,
        quantity: activity.quantity,
        unit: activity.unit,
        location: activity.location,
        status: activity.status,
        greenPointsEarned: activity.green_points_earned,
        createdAt: activity.created_at,
        verifiedAt: activity.verified_at
      }))
    });

  } catch (error) {
    console.error('Get recycling activities error:', error);
    return NextResponse.json(
      { error: 'Failed to get recycling activities' },
      { status: 500 }
    );
  }
}