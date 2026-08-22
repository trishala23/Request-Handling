import { describe, it, expect, beforeEach } from 'vitest';
import { calculatePhaseProgress, calculateProgress, completeLesson, defaultProgress, loadProgress, resetProgress, saveProgress, updateBestScore } from '../lib/progress';
import { buildHttpRequest } from '../lib/requestBuilder';
import { isCorrect, scoreQuiz } from '../lib/quiz';
import { questions } from '../data/quiz';
import { lessons } from '../data/lessons';
import { debugScenarios } from '../data/debugging';
import { getMonoFluxNodes, getPerspectiveInfo, getRequestFlowNodes, getServletReactiveNodes, getTomcatNettyNodes, requestFlowNodeInfo, simulateThreadUsage } from '../lib/phase2';

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

describe('phase 2 lesson navigation', () => {
  it('adds ten phase 2 lessons numbered 09 to 18', () => {
    const phase2 = lessons.filter((l) => l.phase === 2);
    expect(phase2.length).toBe(10);
    expect(phase2.map((l) => l.num)).toEqual(['09', '10', '11', '12', '13', '14', '15', '16', '17', '18']);
  });
  it('keeps all eight phase 1 lessons intact', () => {
    const phase1 = lessons.filter((l) => l.phase === 1);
    expect(phase1.length).toBe(8);
    expect(phase1[0].id).toBe('client-server');
  });
  it('avoids the Phase 1 vehicle domain in Phase 2 lesson text', () => {
    const phase2Text = lessons.filter((l) => l.phase === 2).map((l) => l.body.join(' ') + (l.code || '')).join(' ').toLowerCase();
    expect(phase2Text).not.toMatch(/\bvin\b/);
    expect(phase2Text).not.toContain('vehicle');
    expect(phase2Text).not.toContain('mercedes');
    expect(phase2Text).not.toContain('ctxda');
    expect(phase2Text).not.toContain('vvr');
  });
  it('uses the Order Service / Payment Service domain in Phase 2', () => {
    const phase2Text = lessons.filter((l) => l.phase === 2).map((l) => l.body.join(' ')).join(' ');
    expect(phase2Text).toContain('Order Service');
    expect(phase2Text).toContain('Payment Service');
  });
});

describe('phase progress calculation', () => {
  it('reports 100% for phase 1 once all phase 1 lessons are complete', () => {
    const phase1Ids = lessons.filter((l) => l.phase === 1).map((l) => l.id);
    expect(calculatePhaseProgress(phase1Ids, lessons, 1)).toBe(100);
  });
  it('reports 0% for phase 2 when no phase 2 lessons are complete', () => {
    const phase1Ids = lessons.filter((l) => l.phase === 1).map((l) => l.id);
    expect(calculatePhaseProgress(phase1Ids, lessons, 2)).toBe(0);
  });
  it('calculates partial phase 2 progress independently of phase 1', () => {
    const completed = [...lessons.filter((l) => l.phase === 1).map((l) => l.id), 'servlet-vs-reactive', 'tomcat-vs-netty', 'blocking-vs-nonblocking', 'incoming-vs-outgoing'];
    expect(calculatePhaseProgress(completed, lessons, 1)).toBe(100);
    expect(calculatePhaseProgress(completed, lessons, 2)).toBe(40);
    expect(calculateProgress(completed, lessons.length)).toBe(Math.round((12 / 18) * 100));
  });
  it('does not break existing overall progress calculation', () => expect(calculateProgress(['a', 'b'], 8)).toBe(25));
});

describe('phase 2 quiz', () => {
  it('adds at least 30 new quiz questions', () => {
    const phase2Questions = questions.filter((q) => Number(q.id.replace('q', '')) >= 21);
    expect(phase2Questions.length).toBeGreaterThanOrEqual(30);
  });
  it('scores a scenario-based client/server question correctly', () => {
    const q21 = questions.find((q) => q.id === 'q21')!;
    expect(isCorrect(q21, 'HTTP Client')).toBe(true);
    expect(isCorrect(q21, 'HTTP Server')).toBe(false);
  });
  it('scores a Mono/Flux question correctly', () => {
    const q23 = questions.find((q) => q.id === 'q23')!;
    expect(isCorrect(q23, 'Mono')).toBe(true);
  });
  it('scores the full combined quiz including phase 1 and phase 2 questions', () => {
    const answers: Record<string, string | string[]> = {};
    for (const q of questions) answers[q.id] = q.answer;
    expect(scoreQuiz(questions, answers)).toBe(questions.length);
  });
});

describe('servlet/reactive toggle', () => {
  it('shows the Servlet flow through Tomcat and DispatcherServlet', () => {
    expect(getServletReactiveNodes('servlet')).toEqual(['Client', 'Tomcat', 'Servlet', 'DispatcherServlet', 'Controller', 'Service']);
  });
  it('shows the Reactive flow through Netty and WebFlux', () => {
    expect(getServletReactiveNodes('reactive')).toEqual(['Client', 'Netty', 'WebFlux', 'Handler', 'Controller', 'Reactive Service']);
  });
});

describe('tomcat/netty toggle', () => {
  it('shows Tomcat feeding into Spring MVC', () => expect(getTomcatNettyNodes('tomcat')).toEqual(['HTTP Request', 'Tomcat', 'Servlet', 'Spring MVC']));
  it('shows Netty feeding into the reactive pipeline', () => expect(getTomcatNettyNodes('netty')).toEqual(['HTTP Request', 'Netty', 'WebFlux', 'Reactive pipeline']));
});

describe('blocking vs non-blocking simulation', () => {
  it('ties up one thread per concurrent request when blocking, up to the pool size', () => {
    expect(simulateThreadUsage('blocking', 1, 20)).toEqual({ busy: 1, queued: 0 });
    expect(simulateThreadUsage('blocking', 10, 20)).toEqual({ busy: 10, queued: 0 });
  });
  it('queues requests once the blocking thread pool is exhausted', () => {
    expect(simulateThreadUsage('blocking', 50, 20)).toEqual({ busy: 20, queued: 30 });
    expect(simulateThreadUsage('blocking', 100, 20)).toEqual({ busy: 20, queued: 80 });
  });
  it('serves any number of concurrent requests with a small fixed pool when non-blocking', () => {
    expect(simulateThreadUsage('nonblocking', 100, 20, 4)).toEqual({ busy: 4, queued: 0 });
    expect(simulateThreadUsage('nonblocking', 1, 20, 4)).toEqual({ busy: 1, queued: 0 });
  });
});

describe('incoming/outgoing perspective switch', () => {
  it('labels Order Service as server for Customer and client for Payment Service', () => {
    const info = getPerspectiveInfo('order');
    expect(info.role).toContain('Server for Customer');
    expect(info.role).toContain('Client for Payment Service');
  });
  it('labels the Customer perspective as client only', () => expect(getPerspectiveInfo('customer').role).toContain('Client'));
  it('labels the Payment Service perspective as server', () => expect(getPerspectiveInfo('payment').role).toContain('Server'));
});

describe('mono/flux selection', () => {
  it('shows a single result for Mono', () => expect(getMonoFluxNodes('mono')).toEqual(['Request', 'Payment']));
  it('shows multiple results for Flux', () => expect(getMonoFluxNodes('flux')).toEqual(['Request', 'Payment 1', 'Payment 2', 'Payment 3', '...']));
});

describe('interactive request flow explorer', () => {
  it('builds the Servlet incoming flow through DispatcherServlet', () => {
    expect(getRequestFlowNodes('servlet', 'incoming')).toEqual(['Client', 'HTTP Request', 'Tomcat', 'Servlet', 'DispatcherServlet', 'Handler', 'Controller', 'Service']);
  });
  it('builds the Reactive incoming flow through Netty/WebFlux', () => {
    expect(getRequestFlowNodes('reactive', 'incoming')).toEqual(['Client', 'HTTP Request', 'Netty', 'WebFlux', 'Handler', 'Controller', 'Reactive Service']);
  });
  it('builds the same outgoing flow regardless of application model', () => {
    expect(getRequestFlowNodes('servlet', 'outgoing')).toEqual(['Order Service', 'HTTP Client', 'Payment Service']);
    expect(getRequestFlowNodes('reactive', 'outgoing')).toEqual(getRequestFlowNodes('servlet', 'outgoing'));
  });
  it('provides clickable node detail for every node in every flow', () => {
    const allNodes = new Set([
      ...getRequestFlowNodes('servlet', 'incoming'),
      ...getRequestFlowNodes('reactive', 'incoming'),
      ...getRequestFlowNodes('servlet', 'outgoing'),
    ]);
    for (const n of allNodes) {
      expect(requestFlowNodeInfo[n]).toBeDefined();
      expect(requestFlowNodeInfo[n].what).toBeTruthy();
      expect(requestFlowNodeInfo[n].role).toBeTruthy();
      expect(requestFlowNodeInfo[n].example).toBeTruthy();
      expect(requestFlowNodeInfo[n].blocking).toBeTruthy();
    }
  });
});

describe('debugging challenges', () => {
  it('provides at least five debugging scenarios', () => expect(debugScenarios.length).toBeGreaterThanOrEqual(5));
  it('gives every scenario a recommended investigation path and explanation', () => {
    for (const s of debugScenarios) {
      expect(s.recommended.length).toBeGreaterThan(0);
      expect(s.recommended.every((r) => s.areas.includes(r))).toBe(true);
      expect(s.explanation.length).toBeGreaterThan(0);
    }
  });
});
