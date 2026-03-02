import { NextRequest, NextResponse } from 'next/server';
import { db, greenPointsQueries } from '@/lib/database';

// Submit solar connection request
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      propertyAddress,
      propertyType,
      estimatedConsumption,
      installationPreference
    } = await request.json();

    if (!userId || !propertyAddress) {
      return NextResponse.json(
        { error: 'User ID and property address are required' },
        { status: 400 }
      );
    }

    const result = await db.query(`
      INSERT INTO solar_connections (
        user_id, property_address, property_type, 
        estimated_consumption, installation_preference, status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `, [userId, propertyAddress, propertyType, estimatedConsumption, installationPreference]);

    const solarConnection = result.rows[0];

    // Award green points for submission
    await greenPointsQueries.addPoints(
      userId,
      50,
      'solar_connection',
      solarConnection.id,
      'Solar connection request submitted'
    );

    return NextResponse.json({
      success: true,
      message: 'Solar connection request submitted successfully',
      request: {
        id: solarConnection.id,
        status: solarConnection.status,
        createdAt: solarConnection.created_at
      },
      greenPointsEarned: 50
    });

  } catch (error) {
    console.error('Submit solar request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit solar connection request' },
      { status: 500 }
    );
  }
}

// Get user's solar connection requests
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
      SELECT * FROM solar_connections
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return NextResponse.json({
      success: true,
      requests: result.rows.map((req: any) => ({
        id: req.id,
        propertyAddress: req.property_address,
        propertyType: req.property_type,
        estimatedConsumption: req.estimated_consumption,
        status: req.status,
        estimatedCost: req.estimated_cost,
        installationDate: req.installation_date,
        completionDate: req.completion_date,
        greenPointsEarned: req.green_points_earned,
        createdAt: req.created_at
      }))
    });

  } catch (error) {
    console.error('Get solar requests error:', error);
    return NextResponse.json(
      { error: 'Failed to get solar connection requests' },
      { status: 500 }
    );
  }
}