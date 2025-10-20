require('dotenv').config();
const mongoose = require('mongoose');
const { DSAPattern } = require('../models');

const patterns = [
  {
    name: 'Sliding Window',
    slug: 'sliding-window',
    emoji: '🪟',
    description: 'Fixed or variable-sized window that slides across data to find optimal subarray/substring solutions.',
    category: 'Array',
    difficulty: 'Medium',
    totalProblems: 10,
    resources: [
      { title: 'Sliding Window Pattern Guide', url: 'https://example.com', type: 'article' }
    ],
    examples: [
      {
        title: 'Maximum Sum Subarray',
        code: 'function maxSubArray(arr, k) {\n  let maxSum = 0, windowSum = 0;\n  for (let i = 0; i < k; i++) windowSum += arr[i];\n  maxSum = windowSum;\n  for (let i = k; i < arr.length; i++) {\n    windowSum += arr[i] - arr[i - k];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}',
        explanation: 'Maintains a sliding window of size k and updates sum efficiently'
      }
    ]
  },
  {
    name: 'Two Pointers',
    slug: 'two-pointers',
    emoji: '👉',
    description: 'Use two pointers moving towards/away from each other to solve array/string problems efficiently.',
    category: 'Array',
    difficulty: 'Easy',
    totalProblems: 10,
    resources: [
      { title: 'Two Pointers Technique', url: 'https://example.com', type: 'article' }
    ],
    examples: [
      {
        title: 'Two Sum Sorted Array',
        code: 'function twoSum(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return [];\n}',
        explanation: 'Move pointers based on current sum comparison with target'
      }
    ]
  },
  {
    name: 'Binary Search',
    slug: 'binary-search',
    emoji: '🔍',
    description: 'Efficiently search in sorted arrays by repeatedly dividing search space in half.',
    category: 'Searching',
    difficulty: 'Medium',
    totalProblems: 10,
    resources: [
      { title: 'Binary Search Mastery', url: 'https://example.com', type: 'article' }
    ],
    examples: [
      {
        title: 'Standard Binary Search',
        code: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
        explanation: 'Halve the search space each iteration for O(log n) time'
      }
    ]
  },
  {
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    emoji: '🧮',
    description: 'Break down complex problems into simpler subproblems and store results to avoid recomputation.',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    totalProblems: 10,
    resources: [
      { title: 'DP Pattern Guide', url: 'https://example.com', type: 'article' }
    ],
    examples: [
      {
        title: 'Fibonacci with Memoization',
        code: 'function fib(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}',
        explanation: 'Store computed values to avoid redundant calculations'
      }
    ]
  },
  {
    name: 'Backtracking',
    slug: 'backtracking',
    emoji: '🔙',
    description: 'Build solutions incrementally and backtrack when constraints are violated.',
    category: 'Backtracking',
    difficulty: 'Hard',
    totalProblems: 8,
    resources: [
      { title: 'Backtracking Explained', url: 'https://example.com', type: 'article' }
    ],
    examples: []
  },
  {
    name: 'Depth-First Search',
    slug: 'dfs',
    emoji: '🌲',
    description: 'Traverse tree/graph by exploring as far as possible along each branch before backtracking.',
    category: 'Tree',
    difficulty: 'Medium',
    totalProblems: 12,
    resources: [],
    examples: []
  },
  {
    name: 'Breadth-First Search',
    slug: 'bfs',
    emoji: '🌊',
    description: 'Level-by-level traversal of tree/graph structures using a queue.',
    category: 'Graph',
    difficulty: 'Medium',
    totalProblems: 12,
    resources: [],
    examples: []
  },
  {
    name: 'Fast & Slow Pointers',
    slug: 'fast-slow-pointers',
    emoji: '🐢🐇',
    description: 'Use two pointers at different speeds to detect cycles or find middle elements.',
    category: 'LinkedList',
    difficulty: 'Medium',
    totalProblems: 8,
    resources: [],
    examples: []
  }
];

async function seedPatterns() {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🗑️  Clearing existing patterns...');
    await DSAPattern.deleteMany({});
    
    console.log('📝 Inserting new patterns...');
    const inserted = await DSAPattern.insertMany(patterns);
    
    console.log(`✅ Successfully seeded ${inserted.length} DSA patterns!`);
    console.log('\nPatterns created:');
    inserted.forEach(p => console.log(`  ${p.emoji} ${p.name} (${p.difficulty})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding patterns:', error);
    process.exit(1);
  }
}

seedPatterns();

