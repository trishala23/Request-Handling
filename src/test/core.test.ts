import { describe, it, expect, beforeEach } from 'vitest';
import { calculateProgress, completeLesson, defaultProgress, loadProgress, resetProgress, saveProgress, updateBestScore } from '../lib/progress';
import { buildHttpRequest } from '../lib/requestBuilder';
import { isCorrect, scoreQuiz } from '../lib/quiz';
import { questions } from '../data/quiz';

function store(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    key: (i) => Array.from(m.keys())[i] ?? null,
    get length() { return m.size; },
  } as Storage;
}

describe('progress', () => {
  beforeEach(() => {});
  it('calculates completed lesson percentage', () => expect(calculateProgress(['a', 'b'], 8)).toBe(25));
  it('deduplicates completed lessons', () => expect(completeLesson({ ...defaultProgress, completedLessons: ['x'] }, 'x').completedLessons).toEqual(['x']));
  it('saves and loads localStorage progress', () => { const s = store(); saveProgress({ completedLessons: ['one'], quizBestScore: 80, lastVisitedLesson: 'one' }, s); expect(loadProgress(s).quizBestScore).toBe(80); });
  it('resets localStorage progress', () => { const s = store(); saveProgress({ completedLessons: ['one'], quizBestScore: 80, lastVisitedLesson: 'one' }, s); resetProgress(s); expect(loadProgress(s)).toEqual(defaultProgress); });
  it('keeps highest quiz score', () => expect(updateBestScore({ ...defaultProgress, quizBestScore: 70 }, 60).quizBestScore).toBe(70));
  it('updates best quiz score when higher', () => expect(updateBestScore(defaultProgress, 90).quizBestScore).toBe(90));
});

describe('quiz', () => {
  it('validates correct answer', () => expect(isCorrect(questions[0], 'Client')).toBe(true));
  it('rejects wrong answer', () => expect(isCorrect(questions[0], 'Server')).toBe(false));
  it('scores answers', () => expect(scoreQuiz(questions.slice(0, 2), { q1: 'Client', q2: 'False' })).toBe(2));
  it('validates matching answer', () => expect(isCorrect(questions[17], questions[17].answer)).toBe(true));
});

describe('request builder', () => {
  it('generates request line with query', () => expect(buildHttpRequest('GET', '/vehicles/WDD123', 'region=EMEA', '', '')).toContain('GET /vehicles/WDD123?region=EMEA HTTP/1.1'));
  it('includes headers and body without making network calls', () => { const r = buildHttpRequest('POST', '/vehicles', '', 'Authorization: Bearer xxx', '{"vin":"1"}'); expect(r).toContain('Authorization'); expect(r).toContain('{"vin":"1"}'); });
});
