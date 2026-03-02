import { Pool, PoolClient } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'grinmates_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.DATABASE_HOST?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Database connection wrapper
export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Execute a query
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Execute a transaction
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Close all connections
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Database utility functions
export const db = Database.getInstance();

// User management functions
export const userQueries = {
  // Create new user
  async createUser(email: string, walletAddress?: string, displayName?: string) {
    const query = `
      INSERT INTO users (email, wallet_address, display_name, email_verified)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [email, walletAddress, displayName, false]);
    return result.rows[0];
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  // Get user by wallet address
  async getUserByWallet(walletAddress: string) {
    const query = 'SELECT * FROM users WHERE wallet_address = $1 AND is_active = true';
    const result = await db.query(query, [walletAddress]);
    return result.rows[0];
  },

  // Update user profile
  async updateUser(userId: string, updates: any) {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const query = `
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await db.query(query, [userId, ...values]);
    return result.rows[0];
  },

  // Get user portfolio
  async getUserPortfolio(userId: string) {
    const query = `
      SELECT * FROM user_portfolio WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
};

// Balance management functions
export const balanceQueries = {
  // Get user balances
  async getUserBalances(userId: string) {
    const query = `
      SELECT b.*, t.symbol, t.name as token_name, n.name as network_name
      FROM balances b
      JOIN tokens t ON b.token_id = t.id
      JOIN networks n ON t.network_id = n.id
      WHERE b.user_id = $1 AND b.balance > 0
      ORDER BY b.balance DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  // Update balance
  async updateBalance(userId: string, tokenId: string, amount: string, operation: 'add' | 'subtract') {
    const operator = operation === 'add' ? '+' : '-';
    const query = `
      INSERT INTO balances (user_id, token_id, balance)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, token_id)
      DO UPDATE SET 
        balance = balances.balance ${operator} $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await db.query(query, [userId, tokenId, amount]);
    return result.rows[0];
  }
};

// Transaction functions
export const transactionQueries = {
  // Create transaction
  async createTransaction(data: {
    userId: string;
    type: string;
    amount: string;
    tokenId: string;
    networkId: string;
    fromAddress?: string;
    toAddress?: string;
    transactionHash?: string;
    metadata?: any;
  }) {
    const query = `
      INSERT INTO transactions (
        user_id, type, amount, token_id, network_id, 
        from_address, to_address, transaction_hash, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.userId, data.type, data.amount, data.tokenId, data.networkId,
      data.fromAddress, data.toAddress, data.transactionHash, 
      data.metadata ? JSON.stringify(data.metadata) : null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get user transactions
  async getUserTransactions(userId: string, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM recent_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  },

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: string, transactionHash?: string) {
    const query = `
      UPDATE transactions 
      SET status = $2, transaction_hash = COALESCE($3, transaction_hash),
          ${status === 'confirmed' ? 'confirmed_at = CURRENT_TIMESTAMP,' : ''}
          ${status === 'failed' ? 'failed_at = CURRENT_TIMESTAMP,' : ''}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [transactionId, status, transactionHash]);
    return result.rows[0];
  }
};

// KYC functions
export const kycQueries = {
  // Submit KYC
  async submitKyc(data: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    documentType: string;
    documentNumber?: string;
    selfProtocolSessionId?: string;
  }) {
    const query = `
      INSERT INTO kyc_submissions (
        user_id, first_name, last_name, email, date_of_birth,
        street, city, state, zip_code, country, document_type,
        document_number, self_protocol_session_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        first_name = $2, last_name = $3, email = $4, date_of_birth = $5,
        street = $6, city = $7, state = $8, zip_code = $9, country = $10,
        document_type = $11, document_number = $12, self_protocol_session_id = $13,
        status = 'pending', submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [
      data.userId, data.firstName, data.lastName, data.email, data.dateOfBirth,
      data.street, data.city, data.state, data.zipCode, data.country,
      data.documentType, data.documentNumber, data.selfProtocolSessionId
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get KYC status
  async getKycStatus(userId: string) {
    const query = 'SELECT * FROM kyc_submissions WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  // Update KYC status
  async updateKycStatus(userId: string, status: string, rejectionReason?: string) {
    const query = `
      UPDATE kyc_submissions 
      SET status = $2, 
          ${status === 'approved' ? 'verified_at = CURRENT_TIMESTAMP,' : ''}
          ${rejectionReason ? 'rejection_reason = $3,' : ''}
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;
    const params = rejectionReason ? [userId, status, rejectionReason] : [userId, status];
    const result = await db.query(query, params);
    return result.rows[0];
  }
};

// Green Points functions
export const greenPointsQueries = {
  // Get user green points balance
  async getBalance(userId: string) {
    const query = 'SELECT * FROM green_points_balances WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  // Add green points
  async addPoints(userId: string, points: number, sourceType: string, sourceId?: string, description?: string) {
    return await db.transaction(async (client) => {
      // Add transaction record
      await client.query(`
        INSERT INTO green_points_transactions (user_id, points, transaction_type, source_type, source_id, description)
        VALUES ($1, $2, 'earned', $3, $4, $5)
      `, [userId, points, sourceType, sourceId, description]);

      // Update balance
      const result = await client.query(`
        INSERT INTO green_points_balances (user_id, total_points, available_points, lifetime_earned)
        VALUES ($1, $2, $2, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET
          total_points = green_points_balances.total_points + $2,
          available_points = green_points_balances.available_points + $2,
          lifetime_earned = green_points_balances.lifetime_earned + $2,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, points]);

      return result.rows[0];
    });
  },

  // Get leaderboard
  async getLeaderboard(limit = 100) {
    const query = 'SELECT * FROM green_points_leaderboard LIMIT $1';
    const result = await db.query(query, [limit]);
    return result.rows;
  }
};

// Events functions
export const eventQueries = {
  // Get upcoming events
  async getUpcomingEvents(limit = 20) {
    const query = `
      SELECT * FROM events 
      WHERE status = 'upcoming' AND start_date > CURRENT_TIMESTAMP
      ORDER BY start_date ASC 
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  },

  // Get user's events
  async getUserEvents(userId: string) {
    const query = `
      SELECT e.*, ep.attendance_status, ep.registration_date
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      WHERE ep.user_id = $1
      ORDER BY e.start_date DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  // Register for event
  async registerForEvent(eventId: string, userId: string) {
    const query = `
      INSERT INTO event_participants (event_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (event_id, user_id) DO NOTHING
      RETURNING *
    `;
    const result = await db.query(query, [eventId, userId]);
    return result.rows[0];
  }
};

// Admin functions
export const adminQueries = {
  // Get all users with pagination
  async getAllUsers(limit = 50, offset = 0) {
    const query = `
      SELECT u.*, k.status as kyc_status, gpb.total_points
      FROM users u
      LEFT JOIN kyc_submissions k ON u.id = k.user_id
      LEFT JOIN green_points_balances gpb ON u.id = gpb.user_id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  },

  // Get all transactions with pagination
  async getAllTransactions(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM recent_transactions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  },

  // Reverse transaction
  async reverseTransaction(adminUserId: string, transactionId: string, reason: string) {
    return await db.transaction(async (client) => {
      // Get original transaction
      const originalTx = await client.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
      if (!originalTx.rows[0]) throw new Error('Transaction not found');

      const original = originalTx.rows[0];

      // Create reverse transaction
      const reverseTx = await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, token_id, network_id, 
          from_address, to_address, status, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', $8)
        RETURNING *
      `, [
        original.user_id,
        original.type === 'deposit' ? 'withdraw' : 'deposit',
        original.amount,
        original.token_id,
        original.network_id,
        original.to_address,
        original.from_address,
        JSON.stringify({ reversed_from: transactionId, reason })
      ]);

      // Update original transaction status
      await client.query(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        ['reversed', transactionId]
      );

      // Log admin action
      await client.query(`
        INSERT INTO admin_transaction_actions (
          admin_user_id, original_transaction_id, new_transaction_id, 
          action_type, reason
        )
        VALUES ($1, $2, $3, 'reverse', $4)
      `, [adminUserId, transactionId, reverseTx.rows[0].id, reason]);

      return reverseTx.rows[0];
    });
  }
};

export default db;