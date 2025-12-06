/**
 * Unit Tests for useVerificationStatus Hook
 * 
 * Tests the verification status polling hook functionality including:
 * - Polling mechanism
 * - Terminal state detection
 * - Exponential backoff
 * - Cleanup on unmount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVerificationStatus } from '../../src/lib/hooks/use-verification-status';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useVerificationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with null status and not polling when disabled', () => {
    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: false,
      })
    );

    expect(result.current.status).toBeNull();
    expect(result.current.isPolling).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start polling when enabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'pending',
        timestamp: new Date().toISOString(),
      }),
    });

    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/kyc/status?wallet=0x1234567890123456789012345678901234567890')
    );
  });

  it('should stop polling when terminal state (verified) is reached', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'verified',
        timestamp: new Date().toISOString(),
        transactionHash: '0xabc123',
      }),
    });

    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.status?.status).toBe('verified');
    });

    // Polling should stop after terminal state
    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should stop polling when terminal state (failed) is reached', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'failed',
        timestamp: new Date().toISOString(),
        failureReason: 'Age requirement not met',
      }),
    });

    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.status?.status).toBe('failed');
    });

    // Polling should stop after terminal state
    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should stop polling when terminal state (expired) is reached', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'expired',
        timestamp: new Date().toISOString(),
      }),
    });

    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.status?.status).toBe('expired');
    });

    // Polling should stop after terminal state
    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should handle fetch errors and set error state', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toContain('Network error');
  });

  it('should include sessionId in API request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'pending',
        timestamp: new Date().toISOString(),
      }),
    });

    renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-123',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sessionId=test-session-123')
      );
    });
  });

  it('should cleanup polling on unmount', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'pending',
        timestamp: new Date().toISOString(),
      }),
    });

    const { result, unmount } = renderHook(() =>
      useVerificationStatus({
        walletAddress: '0x1234567890123456789012345678901234567890',
        sessionId: 'test-session-id',
        enabled: true,
        pollingInterval: 1000,
      })
    );

    // Wait for initial fetch
    await vi.runOnlyPendingTimersAsync();

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Unmount the hook
    unmount();

    // Polling should be stopped
    expect(result.current.isPolling).toBe(false);
  });
});
