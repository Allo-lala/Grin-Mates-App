import { NextRequest, NextResponse } from 'next/server';
import { userQueries, adminQueries, db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, role = 'admin', password } = await request.json();

    // Validate required fields
    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email and display name are required' },
        { status: 400 }
      );
    }

    // Simple password check for initial admin creation
    if (password !== process.env.ADMIN_SETUP_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid setup password' },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await userQueries.getUserByEmail(email);
    let user;

    if (existingUser) {
      user = existingUser;
    } else {
      // Create new user
      user = await userQueries.createUser(email, undefined, displayName);
      
      // Mark email as verified for admin users
      await userQueries.updateUser(user.id, { 
        email_verified: true,
        is_active: true 
      });
    }

    // Check if user is already an admin
    const existingAdmin = await db.query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [user.id]
    );

    if (existingAdmin.rows.length > 0) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      );
    }

    // Create admin user
    const adminUser = await db.query(`
      INSERT INTO admin_users (user_id, role, permissions, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [
      user.id,
      role,
      JSON.stringify({
        users: true,
        transactions: true,
        kyc: true,
        services: true,
        events: true,
        system: role === 'super_admin'
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: adminUser.rows[0].role
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}