/**
 * API Client for Grin Mates Backend
 * Centralized API calls with error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User APIs
  async registerUser(email: string, walletAddress?: string, displayName?: string) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, walletAddress, displayName }),
    });
  }

  async getUserProfile(email: string) {
    return this.request(`/users/profile?email=${encodeURIComponent(email)}`);
  }

  async updateUserProfile(userId: string, updates: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...updates }),
    });
  }

  // Wallet APIs
  async getBalances(userId: string) {
    return this.request(`/wallet/balances?userId=${userId}`);
  }

  async generateDepositAddress(userId: string, tokenSymbol: string, networkName: string) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ userId, tokenSymbol, networkName }),
    });
  }

  async initiateWithdrawal(data: {
    userId: string;
    method: 'crypto' | 'mobile_money' | 'airtime';
    amount: string;
    tokenSymbol?: string;
    networkName?: string;
    toAddress?: string;
    phoneNumber?: string;
    provider?: 'mtn' | 'airtel';
  }) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction APIs
  async getTransactions(userId: string, limit = 50, offset = 0, type?: string) {
    let url = `/transactions?userId=${userId}&limit=${limit}&offset=${offset}`;
    if (type) url += `&type=${type}`;
    return this.request(url);
  }

  // Green Points APIs
  async getGreenPointsBalance(userId: string) {
    return this.request(`/green-points/balance?userId=${userId}`);
  }

  async getLeaderboard(limit = 100) {
    return this.request(`/green-points/leaderboard?limit=${limit}`);
  }

  // Service APIs
  async submitSolarRequest(data: {
    userId: string;
    propertyAddress: string;
    propertyType: string;
    estimatedConsumption: string;
    installationPreference: string;
  }) {
    return this.request('/services/solar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSolarRequests(userId: string) {
    return this.request(`/services/solar?userId=${userId}`);
  }

  async submitAnimalRescue(data: {
    userId: string;
    animalType: string;
    locationDescription: string;
    latitude?: number;
    longitude?: number;
    urgencyLevel: string;
    description: string;
    imageUrls?: string[];
  }) {
    return this.request('/services/animal-rescue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnimalRescues(userId: string) {
    return this.request(`/services/animal-rescue?userId=${userId}`);
  }

  async submitRecycling(data: {
    userId: string;
    materialType: string;
    quantity: string;
    unit: string;
    location?: string;
  }) {
    return this.request('/services/recycling', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRecyclingActivities(userId: string) {
    return this.request(`/services/recycling?userId=${userId}`);
  }

  // Event APIs
  async getEvents(type: 'upcoming' | 'past') {
    return this.request(`/events?type=${type}`);
  }

  async getUserEvents(userId: string) {
    return this.request(`/events?userId=${userId}`);
  }

  async registerForEvent(userId: string, eventId: string) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify({ userId, eventId }),
    });
  }

  // Admin APIs
  async getTokenPrices() {
    return this.request('/admin/prices');
  }

  async getExchangeRates() {
    return this.request('/admin/exchange-rates');
  }
}

export const apiClient = new ApiClient();
export default apiClient;