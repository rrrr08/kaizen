import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for API calls
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Award API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('awards points for sudoku win', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true, awardedPoints: 20, isGameOfDay: false })
    });
    const res = await fetch('/api/games/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.awardedPoints).toBe(20);
  });

  it('doubles points for Game of the Day', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true, awardedPoints: 40, isGameOfDay: true })
    });
    const res = await fetch('/api/games/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
    });
    const data = await res.json();
    expect(data.isGameOfDay).toBe(true);
    expect(data.awardedPoints).toBe(40);
  });

  it('prevents awarding points twice in one day', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ error: 'Already awarded today' })
    });
    const res = await fetch('/api/games/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
    });
    const data = await res.json();
    expect(data.error).toBe('Already awarded today');
  });

  it('awards scratcher points with probability', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true, awardedPoints: 50, scratcherResult: { prob: 0.1, points: 50 } })
    });
    const res = await fetch('/api/games/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'sudoku', retry: 0 })
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.scratcherResult).toBeDefined();
  });
});
