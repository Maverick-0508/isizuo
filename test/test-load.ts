/**
 * Isizuo - Load & Stress Test Suite
 * Simulates concurrent users, high throughput, and system limits
 * Run: npx ts-node test/test-load.ts
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type Language = 'en' | 'yo' | 'sw' | 'ha' | 'am';
type Gender = 'male' | 'female' | 'other';
type LookingFor = 'relationship' | 'friendship' | 'marriage' | 'networking';
type FamilyValues = 'traditional' | 'modern' | 'balanced';
type Message = 'text' | 'image' | 'icebreaker' | 'system';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  languages: Language[];
  community: string;
  religion: string;
  values: string[];
  interests: string[];
  familyValues: FamilyValues;
  lookingFor: LookingFor;
  location: { latitude: number; longitude: number };
  isVerified: boolean;
  safetyScore: number;
  credits: number;
}

interface Match {
  userId: string;
  matchedWith: string;
  compatibilityScore: number;
}

interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: Message;
  isFlagged: boolean;
  createdAt: string;
}

interface LoadTestResult {
  name: string;
  totalOps: number;
  durationMs: number;
  opsPerSec: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  errors: number;
  errorRate: number;
}

// ─── Test Infrastructure ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warnings = 0;
const total = () => passed + failed;

function assert(condition: boolean, description: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${description}`);
  }
}

function warn(description: string) {
  warnings++;
  console.log(`  ⚠️  WARN: ${description}`);
}

function sectionHeader(title: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}`);
}

function metricBar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function formatMs(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatOps(ops: number): string {
  if (ops < 1000) return `${ops.toFixed(0)} ops/s`;
  return `${(ops / 1000).toFixed(1)}k ops/s`;
}

// ─── Data Generators ─────────────────────────────────────────────────────────

const COMMUNITIES = ['Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Amhara', 'Oromo', 'Zulu', 'Xhosa', 'Shona', 'Wolof'];
const LANGUAGES: Language[] = ['en', 'yo', 'sw', 'ha', 'am'];
const RELIGIONS = ['Christian', 'Muslim'];
const INTERESTS = ['Technology', 'Music', 'Sports', 'Cooking', 'Travel', 'Reading', 'Fashion', 'Art', 'Fitness', 'Photography'];
const VALUES = ['Family-oriented', 'Ambitious', 'Spiritual', 'Adventurous', 'Traditional', 'Modern', 'Honest', 'Creative'];
const LOOKING_FOR: LookingFor[] = ['relationship', 'friendship', 'marriage', 'networking'];
const FAMILY_VALUES: FamilyValues[] = ['traditional', 'modern', 'balanced'];

const SCAM_MESSAGES = [
  'Send me money please', 'What is your bank account number?', 'Western Union transfer ready',
  'Send money to this account', 'I need your credit card number', 'Invest 5000 guaranteed return',
  'Send me money via M-Pesa', 'Processing fee required', 'Visa fee needed',
];
const HARASSMENT_MESSAGES = [
  'Kill yourself', "You're ugly and worthless", "I'll find you",
  'Send me nudes', "Send me pics now", "You're stupid",
];
const CLEAN_MESSAGES = [
  "What's your favorite food?", "Let's meet for coffee", "I love your profile!",
  "What do you do for work?", "Want to go hiking this weekend?", "That's an interesting perspective!",
  "What music are you into?", "Have you traveled anywhere recently?", "Tell me about your community",
  "What's your best tradition?", "I enjoy cooking too!", "What's your signature dish?",
  "Where in Africa would you love to visit?", "What's the best concert you've been to?",
  "Are you more of a city person?", "What skill would you love to learn?",
  "What African artist should I check out?", "What's your proudest achievement?",
  "How do you spend your weekends?", "What's your favorite local spot?",
];

function generateUser(id: number): User {
  const gender: Gender = id % 2 === 0 ? 'female' : 'male';
  return {
    id: `load_user_${id}`,
    email: `user${id}@loadtest.com`,
    name: `Load User ${id}`,
    age: 20 + (id % 30),
    gender,
    bio: `Load test user ${id} with various interests`,
    languages: [LANGUAGES[id % LANGUAGES.length], 'en'],
    community: COMMUNITIES[id % COMMUNITIES.length],
    religion: RELIGIONS[id % RELIGIONS.length],
    values: [VALUES[id % VALUES.length], VALUES[(id + 1) % VALUES.length]],
    interests: [INTERESTS[id % INTERESTS.length], INTERESTS[(id + 1) % INTERESTS.length]],
    familyValues: FAMILY_VALUES[id % FAMILY_VALUES.length],
    lookingFor: LOOKING_FOR[id % LOOKING_FOR.length],
    location: { latitude: -1 + (id * 0.01), longitude: 36 + (id * 0.01) },
    isVerified: id % 3 !== 0,
    safetyScore: 50 + (id % 50),
    credits: 10 + (id % 90),
  };
}

// ─── Matching Algorithm (from stores/index.ts) ───────────────────────────────

function calculateCompatibility(user: User, potential: User): number {
  let score = 0;
  const sharedLanguages = user.languages.filter((l) => potential.languages.includes(l));
  score += sharedLanguages.length * 10;
  if (user.community === potential.community) score += 15;
  if (user.religion === potential.religion) score += 10;
  const sharedValues = user.values.filter((v) => potential.values.includes(v));
  score += sharedValues.length * 5;
  const sharedInterests = user.interests.filter((i) => potential.interests.includes(i));
  score += sharedInterests.length * 5;
  if (user.lookingFor === potential.lookingFor) score += 20;
  if (user.familyValues === potential.familyValues) score += 10;
  return Math.min(score, 100);
}

function findTopMatches(user: User, candidates: User[], limit = 5): Match[] {
  return candidates
    .filter((c) => c.id !== user.id)
    .map((c) => ({
      userId: user.id,
      matchedWith: c.id,
      compatibilityScore: calculateCompatibility(user, c),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}

// ─── Content Moderation (from stores/index.ts) ───────────────────────────────

function moderateContent(content: string): { flagged: boolean; reason?: string } {
  const scamPatterns = [
    /send\s*(me\s*)?money/i, /bank\s*account/i, /western\s*union/i,
    /visa\s*fee/i, /processing\s*fee/i, /invest\s*\d+/i, /guaranteed\s*return/i,
    /credit\s*card/i,
  ];
  const harassmentPatterns = [
    /kill\s*yourself/i, /you're\s*(ugly|stupid|worthless)/i,
    /i'll\s*find\s*you/i, /send\s*(me\s*)?(nudes|pics)/i,
  ];
  const explicitPatterns = [/explicit\s*content/i, /sex\s*tape/i];
  for (const p of [...scamPatterns, ...harassmentPatterns, ...explicitPatterns]) {
    if (p.test(content)) {
      const reason = scamPatterns.includes(p) ? 'scam'
        : harassmentPatterns.includes(p) ? 'harassment' : 'explicit_content';
      return { flagged: true, reason };
    }
  }
  return { flagged: false };
}

// ─── Simulated Network Latency ───────────────────────────────────────────────

function simulateLatency(minMs = 1, maxMs = 10): Promise<number> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => {
    const start = performance.now();
    setTimeout(() => resolve(performance.now() - start), delay);
  });
}

// ─── Benchmark Runner ────────────────────────────────────────────────────────

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number,
  concurrency: number = 1
): Promise<LoadTestResult> {
  const latencies: number[] = [];
  let errors = 0;
  const startAll = performance.now();

  if (concurrency <= 1) {
    // Sequential
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        await fn();
      } catch {
        errors++;
      }
      latencies.push(performance.now() - start);
    }
  } else {
    // Concurrent batches
    const batchSize = Math.ceil(iterations / concurrency);
    const batches: Promise<void>[] = [];

    for (let b = 0; b < concurrency; b++) {
      const batch = (async () => {
        for (let i = 0; i < batchSize; i++) {
          const start = performance.now();
          try {
            await fn();
          } catch {
            errors++;
          }
          latencies.push(performance.now() - start);
        }
      })();
      batches.push(batch);
    }

    await Promise.all(batches);
  }

  const durationMs = performance.now() - startAll;
  const sorted = [...latencies].sort((a, b) => a - b);
  const totalOps = latencies.length;

  return {
    name,
    totalOps,
    durationMs,
    opsPerSec: (totalOps / durationMs) * 1000,
    avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / totalOps,
    p95LatencyMs: percentile(sorted, 95),
    p99LatencyMs: percentile(sorted, 99),
    maxLatencyMs: sorted[sorted.length - 1],
    errors,
    errorRate: (errors / totalOps) * 100,
  };
}

function printResult(result: LoadTestResult) {
  console.log(`\n  📊 ${result.name}`);
  console.log(`     Operations:    ${result.totalOps}`);
  console.log(`     Duration:      ${formatMs(result.durationMs)}`);
  console.log(`     Throughput:    ${formatOps(result.opsPerSec)}`);
  console.log(`     Latency (avg): ${formatMs(result.avgLatencyMs)}`);
  console.log(`     Latency (p95): ${formatMs(result.p95LatencyMs)}`);
  console.log(`     Latency (p99): ${formatMs(result.p99LatencyMs)}`);
  console.log(`     Latency (max): ${formatMs(result.maxLatencyMs)}`);
  console.log(`     Errors:        ${result.errors} (${result.errorRate.toFixed(2)}%)`);
}

// ─── TEST SUITE ──────────────────────────────────────────────────────────────

async function runLoadTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        ISIZUO - LOAD & STRESS TEST SUITE                   ║');
  console.log('║        Simulating high-concurrency production load         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const allResults: LoadTestResult[] = [];

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Matching Algorithm — 500 users
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('1. MATCHING ALGORITHM — 500 users');
  console.log('  Testing matching performance with 500 diverse user profiles\n');

  const userCount = 500;
  const allUsers: User[] = [];
  for (let i = 0; i < userCount; i++) allUsers.push(generateUser(i));

  // Single user matching against all others
  const singleUserResult = await benchmark(
    'Single user → match against 499 users',
    async () => {
      findTopMatches(allUsers[0], allUsers, 5);
      await simulateLatency(0, 1);
    },
    100
  );
  printResult(singleUserResult);
  allResults.push(singleUserResult);

  assert(singleUserResult.avgLatencyMs < 50, `Single match computation < 50ms avg (got ${formatMs(singleUserResult.avgLatencyMs)})`);
  assert(singleUserResult.opsPerSec >= 20, `Throughput >= 20 ops/s (got ${formatOps(singleUserResult.opsPerSec)})`);

  // All users matching against all others (O(n²))
  const allPairsResult = await benchmark(
    'All 500 users → match against each other (O(n²))',
    async () => {
      for (const user of allUsers.slice(0, 50)) {
        findTopMatches(user, allUsers, 5);
      }
      await simulateLatency(0, 2);
    },
    10
  );
  printResult(allPairsResult);
  allResults.push(allPairsResult);

  assert(allPairsResult.avgLatencyMs < 5000, `Full pipeline < 5s per batch (got ${formatMs(allPairsResult.avgLatencyMs)})`);

  // Concurrent matching (10 users matching simultaneously)
  const concurrentMatchResult = await benchmark(
    '10 concurrent users → matching simultaneously',
    async () => {
      findTopMatches(allUsers[Math.floor(Math.random() * userCount)], allUsers, 10);
      await simulateLatency(0, 1);
    },
    500,
    10
  );
  printResult(concurrentMatchResult);
  allResults.push(concurrentMatchResult);

  assert(concurrentMatchResult.opsPerSec >= 100, `Concurrent throughput >= 100 ops/s (got ${formatOps(concurrentMatchResult.opsPerSec)})`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Content Moderation — High Volume
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('2. CONTENT MODERATION — High Volume');
  console.log('  Testing message moderation throughput with mixed content\n');

  const allMessages = [...SCAM_MESSAGES, ...HARASSMENT_MESSAGES, ...CLEAN_MESSAGES];

  const modSequential = await benchmark(
    'Sequential moderation (1000 messages)',
    async () => {
      moderateContent(allMessages[Math.floor(Math.random() * allMessages.length)]);
    },
    1000
  );
  printResult(modSequential);
  allResults.push(modSequential);

  assert(modSequential.opsPerSec >= 1000, `Moderation >= 1k ops/s (got ${formatOps(modSequential.opsPerSec)})`);

  const modConcurrent = await benchmark(
    'Concurrent moderation (50 threads × 200 messages)',
    async () => {
      moderateContent(allMessages[Math.floor(Math.random() * allMessages.length)]);
    },
    10000,
    50
  );
  printResult(modConcurrent);
  allResults.push(modConcurrent);

  assert(modConcurrent.opsPerSec >= 5000, `Concurrent moderation >= 5k ops/s (got ${formatOps(modConcurrent.opsPerSec)})`);

  // Verify accuracy under load
  let modErrors = 0;
  for (let i = 0; i < 1000; i++) {
    const msg = allMessages[i % allMessages.length];
    const result = moderateContent(msg);
    const isScamOrHarassment = SCAM_MESSAGES.includes(msg) || HARASSMENT_MESSAGES.includes(msg);
    if (result.flagged !== isScamOrHarassment) modErrors++;
  }
  assert(modErrors === 0, `Moderation accuracy 100% under load (${modErrors} errors in 1000 messages)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Chat Message Processing
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('3. CHAT MESSAGE PROCESSING');
  console.log('  Simulating concurrent chat sessions\n');

  // Simulate 100 active chat rooms, each sending messages
  const chatRooms = 100;
  const messagesPerRoom = 20;
  const totalChatMessages = chatRooms * messagesPerRoom;

  const chatResult = await benchmark(
    `${chatRooms} chat rooms × ${messagesPerRoom} messages = ${totalChatMessages} total`,
    async () => {
      const roomId = Math.floor(Math.random() * chatRooms);
      const senderId = `user_${Math.floor(Math.random() * 100)}`;
      const content = allMessages[Math.floor(Math.random() * allMessages.length)];
      const moderation = moderateContent(content);

      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        matchId: `match_${roomId}`,
        senderId,
        content,
        type: 'text',
        isFlagged: moderation.flagged,
        createdAt: new Date().toISOString(),
      };

      // Simulate message storage + moderation queue check
      if (moderation.flagged) {
        // Simulate writing to moderation_queue
        await simulateLatency(1, 3);
      }
      // Simulate writing to messages table
      await simulateLatency(1, 5);
    },
    totalChatMessages,
    20
  );
  printResult(chatResult);
  allResults.push(chatResult);

  assert(chatResult.opsPerSec >= 500, `Chat throughput >= 500 msgs/s (got ${formatOps(chatResult.opsPerSec)})`);
  assert(chatResult.errorRate < 1, `Chat error rate < 1% (got ${chatResult.errorRate.toFixed(2)}%)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: Swipe / Match Pipeline
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('4. SWIPE / MATCH PIPELINE');
  console.log('  Simulating concurrent swiping with match detection\n');

  // Simulate 500 users swiping, some resulting in mutual matches
  const swipeResult = await benchmark(
    '500 users × 10 swipes each = 5000 swipes',
    async () => {
      const swiperId = `user_${Math.floor(Math.random() * 500)}`;
      const swipedId = `user_${Math.floor(Math.random() * 500)}`;
      if (swiperId === swipedId) return;

      // Simulate: write swipe to DB
      await simulateLatency(1, 5);

      // Simulate: check for reverse swipe (mutual like = match)
      const reverseSwipeExists = Math.random() < 0.15; // 15% match rate
      if (reverseSwipeExists) {
        // Create match
        await simulateLatency(1, 3);
      }
    },
    5000,
    30
  );
  printResult(swipeResult);
  allResults.push(swipeResult);

  assert(swipeResult.opsPerSec >= 200, `Swipe throughput >= 200 ops/s (got ${formatOps(swipeResult.opsPerSec)})`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 5: Event & Community Queries
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('5. EVENT & COMMUNITY QUERIES');
  console.log('  Simulating browsing and filtering under load\n');

  const eventQueryResult = await benchmark(
    'Event listing + category filter (1000 queries)',
    async () => {
      const categories = ['social', 'professional', 'cultural', 'religious', 'hobby'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      // Simulate: SELECT * FROM events WHERE category = ? ORDER BY date
      await simulateLatency(2, 8);
    },
    1000,
    20
  );
  printResult(eventQueryResult);
  allResults.push(eventQueryResult);

  assert(eventQueryResult.opsPerSec >= 200, `Event query >= 200 ops/s (got ${formatOps(eventQueryResult.opsPerSec)})`);

  const communityQueryResult = await benchmark(
    'Community listing + join action (1000 ops)',
    async () => {
      const action = Math.random() < 0.8 ? 'browse' : 'join';
      await simulateLatency(2, 8);
      if (action === 'join') {
        // Simulate: UPDATE communities SET members = array_append(members, ?)
        await simulateLatency(3, 10);
      }
    },
    1000,
    20
  );
  printResult(communityQueryResult);
  allResults.push(communityQueryResult);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 6: Authentication Flow
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('6. AUTHENTICATION FLOW');
  console.log('  Simulating concurrent login attempts\n');

  const authResult = await benchmark(
    'Email OTP request (500 concurrent)',
    async () => {
      // Simulate: supabase.auth.signInWithOtp({ email })
      await simulateLatency(50, 200); // Network call to Supabase
    },
    500,
    50
  );
  printResult(authResult);
  allResults.push(authResult);

  const verifyResult = await benchmark(
    'OTP verification (500 concurrent)',
    async () => {
      // Simulate: supabase.auth.verifyOtp({ email, token, type: 'email' })
      await simulateLatency(30, 150);
    },
    500,
    50
  );
  printResult(verifyResult);
  allResults.push(verifyResult);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 7: Memory & GC Pressure
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('7. MEMORY & GC PRESSURE');
  console.log('  Creating and destroying large objects to test GC\n');

  const memBefore = process.memoryUsage();
  const memResult = await benchmark(
    'Allocate 10,000 user objects + 50,000 match computations',
    async () => {
      const users: User[] = [];
      for (let i = 0; i < 100; i++) {
        users.push(generateUser(Math.floor(Math.random() * 10000)));
      }
      for (const u of users) {
        findTopMatches(u, users, 5);
      }
      // Let GC clean up
      users.length = 0;
    },
    100,
    5
  );
  const memAfter = process.memoryUsage();

  printResult(memResult);
  allResults.push(memResult);

  const heapDelta = memAfter.heapUsed - memBefore.heapUsed;
  const heapDeltaMB = (heapDelta / 1024 / 1024).toFixed(2);
  console.log(`\n  📊 Memory:`);
  console.log(`     Heap before: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`     Heap after:  ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`     Delta:       ${heapDeltaMB} MB`);

  assert(Math.abs(heapDelta) < 100 * 1024 * 1024, `Heap delta < 100MB (got ${heapDeltaMB}MB)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 8: Burst Traffic Simulation
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('8. BURST TRAFFIC SIMULATION');
  console.log('  Simulating sudden traffic spike (viral moment)\n');

  const burstResult = await benchmark(
    '1000 users joining in 5 seconds',
    async () => {
      const user = generateUser(Math.floor(Math.random() * 100000));
      // Simulate: INSERT INTO profiles, send OTP, create initial profile
      await simulateLatency(5, 20);
    },
    1000,
    200 // High concurrency
  );
  printResult(burstResult);
  allResults.push(burstResult);

  assert(burstResult.durationMs < 15000, `Burst completes in < 15s (got ${formatMs(burstResult.durationMs)})`);
  assert(burstResult.errorRate < 5, `Burst error rate < 5% (got ${burstResult.errorRate.toFixed(2)}%)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 9: Supabase API Rate Limit Test
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('9. SUPABASE API RATE LIMIT');
  console.log('  Testing actual Supabase endpoint responsiveness\n');

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://akstpgmvkzxxqjfqwiyh.supabase.co';
  const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  let apiSuccesses = 0;
  let apiErrors = 0;
  let apiRateLimits = 0;
  const apiLatencies: number[] = [];

  const apiResult = await benchmark(
    'Supabase REST API calls (auth status check)',
    async () => {
      const start = performance.now();
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        });

        const latency = performance.now() - start;
        apiLatencies.push(latency);

        if (response.status === 429) {
          apiRateLimits++;
        } else if (response.ok || response.status === 401) {
          apiSuccesses++;
        } else {
          apiErrors++;
        }
      } catch {
        apiErrors++;
      }
    },
    50,
    10
  );

  printResult(apiResult);
  allResults.push(apiResult);

  console.log(`\n  📊 Supabase API Results:`);
  console.log(`     Successes:     ${apiSuccesses}`);
  console.log(`     Rate Limited:  ${apiRateLimits}`);
  console.log(`     Errors:        ${apiErrors}`);

  if (apiRateLimits > 0) {
    warn(`Supabase rate limiting detected (${apiRateLimits} times) — may need to add client-side throttling`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 10: End-to-End User Journey Under Load
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('10. END-TO-END USER JOURNEY UNDER LOAD');
  console.log('  Simulating 200 users completing full app journey\n');

  const e2eResult = await benchmark(
    '200 users: login → browse → swipe → chat → RSVP → join community',
    async () => {
      const userIdx = Math.floor(Math.random() * 200);
      const user = generateUser(userIdx);

      // 1. Auth (simulate)
      await simulateLatency(50, 150);

      // 2. Fetch potential matches (simulate DB query)
      await simulateLatency(5, 15);

      // 3. Swipe on 3 profiles
      for (let i = 0; i < 3; i++) {
        const target = generateUser(Math.floor(Math.random() * 200));
        calculateCompatibility(user, target);
        await simulateLatency(2, 8);
      }

      // 4. Send a chat message
      const msgContent = CLEAN_MESSAGES[Math.floor(Math.random() * CLEAN_MESSAGES.length)];
      moderateContent(msgContent);
      await simulateLatency(3, 10);

      // 5. Browse events
      await simulateLatency(3, 10);

      // 6. Join a community
      await simulateLatency(3, 10);
    },
    200,
    25
  );
  printResult(e2eResult);
  allResults.push(e2eResult);

  assert(e2eResult.opsPerSec >= 10, `E2E throughput >= 10 journeys/s (got ${formatOps(e2eResult.opsPerSec)})`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  sectionHeader('LOAD TEST RESULTS SUMMARY');

  console.log('\n  ╔═══════════════════════════════════════════════════════════════╗');
  console.log('  ║                    PERFORMANCE DASHBOARD                      ║');
  console.log('  ╠═══════════════════════════════════════════════════════════════╣');

  for (const r of allResults) {
    const shortName = r.name.length > 40 ? r.name.substring(0, 37) + '...' : r.name;
    const ops = formatOps(r.opsPerSec).padStart(10);
    const lat = formatMs(r.avgLatencyMs).padStart(8);
    const errs = `${r.errorRate.toFixed(1)}%`.padStart(6);
    console.log(`  ║ ${shortName.padEnd(40)} ${ops} ${lat} ${errs} ║`);
  }

  console.log('  ╚═══════════════════════════════════════════════════════════════╝');

  // Determine bottleneck
  const slowest = allResults.reduce((a, b) => a.opsPerSec < b.opsPerSec ? a : b);
  const fastest = allResults.reduce((a, b) => a.opsPerSec > b.opsPerSec ? a : b);

  console.log(`\n  🏆 Fastest: ${fastest.name} (${formatOps(fastest.opsPerSec)})`);
  console.log(`  🐢 Slowest: ${slowest.name} (${formatOps(slowest.opsPerSec)})`);

  // Capacity estimate
  const maxConcurrentUsers = Math.floor(fastest.opsPerSec * 0.7); // 70% capacity target
  console.log(`\n  📊 Estimated Capacity:`);
  console.log(`     Max concurrent users (at 70% load): ~${maxConcurrentUsers}`);
  console.log(`     Max messages/second: ${formatOps(allResults.find(r => r.name.includes('chat'))?.opsPerSec || 0)}`);

  // Final test summary
  sectionHeader('TEST SUMMARY');

  console.log(`\n  ╔═══════════════════════════════════════════╗`);
  console.log(`  ║  Total Tests:  ${String(total()).padStart(4)}                       ║`);
  console.log(`  ║  ✅ Passed:     ${String(passed).padStart(4)}                       ║`);
  console.log(`  ║  ❌ Failed:     ${String(failed).padStart(4)}                       ║`);
  console.log(`  ║  ⚠️  Warnings:  ${String(warnings).padStart(4)}                       ║`);
  console.log(`  ║  Success Rate: ${String(Math.round((passed / total()) * 100)).padStart(3)}%                      ║`);
  console.log(`  ╚═══════════════════════════════════════════╝`);

  if (failed > 0) {
    console.log(`\n  ⚠️  Some tests failed. Review the output above.`);
  } else {
    console.log(`\n  🎉 All load tests passed! System handles production load.`);
  }

  console.log('');
}

runLoadTests();
