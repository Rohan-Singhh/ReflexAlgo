import { memo, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Clock, CheckCircle, Code2, ArrowRight, Sparkles, Trophy, TrendingUp, Zap, ArrowUp, ExternalLink, CalendarDays, Flame } from 'lucide-react';
import Button from '../../components/ui/Button';
import dashboardService from '../../services/dashboardService';

const PRACTICE_PROGRESS_KEY = 'reflexalgo_dsa_practice_progress';

const patternPracticeCatalog = [
  {
    name: 'Sliding Window',
    label: 'SW',
    color: 'from-blue-500 to-cyan-500',
    questions: [
      { id: 'sw-longest-substring', title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'sw-min-window', title: 'Minimum Window Substring', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'sw-character-replacement', title: 'Longest Repeating Character Replacement', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'sw-fruits', title: 'Fruit Into Baskets', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/fruit-into-baskets/' },
      { id: 'sw-books', title: 'Books', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/279/B' },
      { id: 'sw-max-vowels', title: 'Maximum Number of Vowels in a Substring', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/' },
      { id: 'sw-permutation-string', title: 'Permutation in String', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutation-in-string/' },
      { id: 'sw-subarray-product', title: 'Subarray Product Less Than K', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/subarray-product-less-than-k/' },
      { id: 'sw-max-consecutive-ones', title: 'Max Consecutive Ones III', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/max-consecutive-ones-iii/' },
      { id: 'sw-cellular-network', title: 'Cellular Network', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/702/C' },
      { id: 'sw-min-size-subarray-sum', title: 'Minimum Size Subarray Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/' },
      { id: 'sw-repeated-dna', title: 'Repeated DNA Sequences', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/repeated-dna-sequences/' },
      { id: 'sw-find-anagrams', title: 'Find All Anagrams in a String', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/' },
      { id: 'sw-grumpy-bookstore', title: 'Grumpy Bookstore Owner', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/grumpy-bookstore-owner/' },
      { id: 'sw-contains-duplicate-ii', title: 'Contains Duplicate II', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/contains-duplicate-ii/' },
      { id: 'sw-k-good-segment', title: 'K-Good Segment', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/616/D' },
      { id: 'sw-segment-occurrences', title: 'Segment Occurrences', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/problemset/problem/1016/B' },
      { id: 'sw-strsub', title: 'Count Substrings', platform: 'CodeChef', difficulty: 'Medium', url: 'https://www.codechef.com/problems/STRSUB' },
      { id: 'sw-first-negative-window', title: 'First Negative Integer in Every Window', platform: '450 DSA', difficulty: 'Medium', url: 'https://450dsa.com/' },
      { id: 'sw-sum-min-max-window', title: 'Sum of Min and Max of All Subarrays', platform: '450 DSA', difficulty: 'Hard', url: 'https://450dsa.com/' },
    ],
  },
  {
    name: 'Two Pointers',
    label: 'TP',
    color: 'from-purple-500 to-pink-500',
    questions: [
      { id: 'tp-two-sum-ii', title: 'Two Sum II - Input Array Is Sorted', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: 'tp-container-water', title: 'Container With Most Water', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'tp-3sum', title: '3Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/3sum/' },
      { id: 'tp-trapping-rain', title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/trapping-rain-water/' },
      { id: 'tp-kuriyama', title: 'Kuriyama Mirai Stones', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/problemset/problem/433/B' },
      { id: 'tp-valid-palindrome', title: 'Valid Palindrome', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'tp-remove-duplicates', title: 'Remove Duplicates from Sorted Array', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
      { id: 'tp-sort-colors', title: 'Sort Colors', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-colors/' },
      { id: 'tp-4sum', title: '4Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/4sum/' },
      { id: 'tp-alice-bob-chocolate', title: 'Alice, Bob and Chocolate', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/problemset/problem/6/C' },
      { id: 'tp-squares-sorted-array', title: 'Squares of a Sorted Array', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/squares-of-a-sorted-array/' },
      { id: 'tp-backspace-string', title: 'Backspace String Compare', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/backspace-string-compare/' },
      { id: 'tp-merge-sorted-array', title: 'Merge Sorted Array', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-sorted-array/' },
      { id: 'tp-move-zeroes', title: 'Move Zeroes', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/move-zeroes/' },
      { id: 'tp-boats-rescue', title: 'Boats to Save People', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/boats-to-save-people/' },
      { id: 'tp-pair-sum', title: 'Pair Sum in a Sorted Array', platform: '450 DSA', difficulty: 'Easy', url: 'https://450dsa.com/' },
      { id: 'tp-tachstck', title: 'Chopsticks', platform: 'CodeChef', difficulty: 'Easy', url: 'https://www.codechef.com/problems/TACHSTCK' },
      { id: 'tp-array-merge', title: 'Merging Arrays', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/edu/course/2/lesson/9/1/practice/contest/307092/problem/A' },
      { id: 'tp-number-of-smaller', title: 'Number of Smaller', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/edu/course/2/lesson/9/1/practice/contest/307092/problem/B' },
      { id: 'tp-subsegments-small-sum', title: 'Segments with Small Sum', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/edu/course/2/lesson/9/2/practice/contest/307093/problem/A' },
    ],
  },
  {
    name: 'Binary Search',
    label: 'BS',
    color: 'from-emerald-500 to-green-500',
    questions: [
      { id: 'bs-rotated-array', title: 'Search in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'bs-min-rotated', title: 'Find Minimum in Rotated Sorted Array', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'bs-koko', title: 'Koko Eating Bananas', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
      { id: 'bs-median', title: 'Median of Two Sorted Arrays', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { id: 'bs-magic-powder', title: 'Magic Powder - 1', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/670/D1' },
      { id: 'bs-search-2d', title: 'Search a 2D Matrix', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'bs-time-map', title: 'Time Based Key-Value Store', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: 'bs-peak-element', title: 'Find Peak Element', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-peak-element/' },
      { id: 'bs-split-array', title: 'Split Array Largest Sum', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/split-array-largest-sum/' },
      { id: 'bs-hamburgers', title: 'Hamburgers', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/371/C' },
      { id: 'bs-search-range', title: 'Find First and Last Position', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
      { id: 'bs-search-insert', title: 'Search Insert Position', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/search-insert-position/' },
      { id: 'bs-arranging-coins', title: 'Arranging Coins', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/arranging-coins/' },
      { id: 'bs-capacity-ship', title: 'Capacity To Ship Packages Within D Days', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/' },
      { id: 'bs-min-days-bouquets', title: 'Minimum Number of Days to Make Bouquets', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/' },
      { id: 'bs-aggressive-cows', title: 'Aggressive Cows', platform: 'CodeChef', difficulty: 'Medium', url: 'https://www.codechef.com/problems/AGGRCOW' },
      { id: 'bs-rope-cutting', title: 'Ropes', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/edu/course/2/lesson/6/2/practice/contest/283932/problem/A' },
      { id: 'bs-very-easy-task', title: 'Very Easy Task', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/edu/course/2/lesson/6/2/practice/contest/283932/problem/C' },
      { id: 'bs-square-root', title: 'Square Root of an Integer', platform: '450 DSA', difficulty: 'Easy', url: 'https://450dsa.com/' },
      { id: 'bs-painters-partition', title: 'Painter\'s Partition Problem', platform: '450 DSA', difficulty: 'Hard', url: 'https://450dsa.com/' },
    ],
  },
  {
    name: 'Dynamic Programming',
    label: 'DP',
    color: 'from-orange-500 to-red-500',
    questions: [
      { id: 'dp-climbing-stairs', title: 'Climbing Stairs', platform: 'LeetCode', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'dp-house-robber', title: 'House Robber', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
      { id: 'dp-coin-change', title: 'Coin Change', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' },
      { id: 'dp-lis', title: 'Longest Increasing Subsequence', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'dp-vacation', title: 'Vacation', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/698/A' },
      { id: 'dp-decode-ways', title: 'Decode Ways', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/decode-ways/' },
      { id: 'dp-word-break', title: 'Word Break', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-break/' },
      { id: 'dp-partition-subset', title: 'Partition Equal Subset Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
      { id: 'dp-edit-distance', title: 'Edit Distance', platform: 'LeetCode', difficulty: 'Hard', url: 'https://leetcode.com/problems/edit-distance/' },
      { id: 'dp-boredom', title: 'Boredom', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/455/A' },
      { id: 'dp-unique-paths', title: 'Unique Paths', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'dp-min-path-sum', title: 'Minimum Path Sum', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/minimum-path-sum/' },
      { id: 'dp-longest-common-subsequence', title: 'Longest Common Subsequence', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'dp-palindromic-substrings', title: 'Palindromic Substrings', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/palindromic-substrings/' },
      { id: 'dp-maximal-square', title: 'Maximal Square', platform: 'LeetCode', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximal-square/' },
      { id: 'dp-coins', title: 'Bytelandian Gold Coins', platform: 'CodeChef', difficulty: 'Medium', url: 'https://www.codechef.com/problems/COINS' },
      { id: 'dp-farida', title: 'Princess Farida', platform: 'CodeChef', difficulty: 'Medium', url: 'https://www.codechef.com/problems/FARIDA' },
      { id: 'dp-flowers', title: 'Flowers', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/474/D' },
      { id: 'dp-equal-partition', title: 'Subset Sum / Equal Partition', platform: '450 DSA', difficulty: 'Medium', url: 'https://450dsa.com/' },
      { id: 'dp-knapsack', title: '0/1 Knapsack', platform: '450 DSA', difficulty: 'Medium', url: 'https://450dsa.com/' },
    ],
  },
];

const dsa_patterns_default = [
  { name: 'Sliding Window', mastery: 0, reviews: 0, solved: 0, total: 20, emoji: '🪟', color: 'from-blue-500 to-cyan-500' },
  { name: 'Two Pointers', mastery: 0, reviews: 0, solved: 0, total: 20, emoji: '👉', color: 'from-purple-500 to-pink-500' },
  { name: 'Binary Search', mastery: 0, reviews: 0, solved: 0, total: 20, emoji: '🔍', color: 'from-emerald-500 to-green-500' },
  { name: 'Dynamic Programming', mastery: 0, reviews: 0, solved: 0, total: 20, emoji: '🧮', color: 'from-orange-500 to-red-500' },
];

const defaultLeaderboard = [
  { rank: 1, name: 'Loading...', score: 0, avatar: '⏳', change: '' },
];

const getPatternReviewCount = (pattern) => pattern.reviews ?? pattern.solved ?? 0;

const getDifficultyClass = (difficulty) => {
  if (difficulty === 'Easy') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  if (difficulty === 'Hard') return 'bg-red-500/10 border-red-500/20 text-red-400';
  return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
};

const getPracticeQuestionPoints = (difficulty) => {
  if (difficulty === 'Easy') return 10;
  if (difficulty === 'Hard') return 35;
  return 20;
};

const ACTIVITY_DAYS = 112;

const getDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getActivityTone = (count) => {
  if (count >= 6) return 'bg-emerald-300 shadow-lg shadow-emerald-400/25 border-emerald-200/30';
  if (count >= 4) return 'bg-emerald-500 shadow-md shadow-emerald-500/20 border-emerald-300/20';
  if (count >= 2) return 'bg-cyan-500 shadow-md shadow-cyan-500/20 border-cyan-300/20';
  if (count === 1) return 'bg-sky-700 border-sky-400/20';
  return 'bg-[#1F2933] border-white/[0.06] hover:bg-[#293541]';
};

const formatActivityDate = (dateKey) => {
  if (!dateKey) return 'select a day';
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const buildActivityDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - (ACTIVITY_DAYS - 1));

  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: getDateKey(date),
      dayLabel: date.toLocaleDateString(undefined, { weekday: 'short' }),
      monthLabel: date.toLocaleDateString(undefined, { month: 'short' }),
    };
  });
};

const ActivityHeatmap = memo(({ reviews, solvedQuestions }) => {
  const [mode, setMode] = useState('all');
  const [selectedDayKey, setSelectedDayKey] = useState(() => getDateKey(new Date()));
  const modeMeta = {
    all: { label: 'All activity', accent: 'from-cyan-400 to-emerald-300' },
    reviews: { label: 'Code reviews', accent: 'from-purple-400 to-fuchsia-300' },
    practice: { label: 'Practice solves', accent: 'from-cyan-400 to-blue-300' },
  };

  const activityDays = useMemo(() => buildActivityDays(), []);
  const activityByDay = useMemo(() => {
    const map = new Map();
    const ensureDay = (dateKey) => {
      if (!dateKey) return null;
      if (!map.has(dateKey)) {
        map.set(dateKey, { reviews: [], practice: [] });
      }
      return map.get(dateKey);
    };

    reviews.forEach((review) => {
      const dateKey = getDateKey(review.createdAt || review.completedAt);
      const day = ensureDay(dateKey);
      if (day) day.reviews.push(review);
    });

    solvedQuestions.forEach((question) => {
      const dateKey = getDateKey(question.solvedAt);
      const day = ensureDay(dateKey);
      if (day) day.practice.push(question);
    });

    return map;
  }, [reviews, solvedQuestions]);

  const visibleActivityDays = useMemo(() => (
    activityDays.map((day) => {
      const activity = activityByDay.get(day.key) || { reviews: [], practice: [] };
      const reviewsCount = activity.reviews.length;
      const practiceCount = activity.practice.length;
      const count = mode === 'reviews' ? reviewsCount : mode === 'practice' ? practiceCount : reviewsCount + practiceCount;

      return {
        ...day,
        reviewsCount,
        practiceCount,
        count,
      };
    })
  ), [activityByDay, activityDays, mode]);

  const weeks = useMemo(() => {
    const grouped = [];
    for (let index = 0; index < visibleActivityDays.length; index += 7) {
      grouped.push(visibleActivityDays.slice(index, index + 7));
    }
    return grouped;
  }, [visibleActivityDays]);

  const selectedActivity = activityByDay.get(selectedDayKey) || { reviews: [], practice: [] };
  const selectedItems = [
    ...selectedActivity.reviews.map((item) => ({ type: 'review', label: item.title || 'Code review' })),
    ...selectedActivity.practice.map((item) => ({ type: 'practice', label: item.title || item.questionId || 'Practice solve' })),
  ];
  const activeDays = visibleActivityDays.filter((day) => day.count > 0).length;
  const totalActivity = visibleActivityDays.reduce((sum, day) => sum + day.count, 0);
  const busiestDay = visibleActivityDays.reduce((best, day) => day.count > best.count ? day : best, visibleActivityDays[0]);
  const currentStreak = [...visibleActivityDays].reverse().reduce((streak, day) => {
    if (streak.done) return streak;
    if (day.count > 0) return { count: streak.count + 1, done: false };
    return streak.count > 0 ? { ...streak, done: true } : streak;
  }, { count: 0, done: false }).count;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-[#0D1117] border border-white/10 rounded-3xl"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-300 to-purple-400" />
      <div className="p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-7">
          <div className="min-w-0">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <CalendarDays className="w-7 h-7 text-cyan-200" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white">streak graph</h2>
                <p className="text-gray-400 text-sm">your coding pulse across reviews and DSA practice</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                { label: 'current streak', value: currentStreak, suffix: 'd', icon: Flame },
                { label: 'active days', value: activeDays, suffix: '', icon: TrendingUp },
                { label: modeMeta[mode].label, value: totalActivity, suffix: '', icon: Zap },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}{stat.suffix}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex xl:flex-col gap-3 xl:items-end">
            <div className="inline-flex p-1 rounded-2xl bg-black/30 border border-white/10">
              {[
                { id: 'all', label: 'all' },
                { id: 'reviews', label: 'reviews' },
                { id: 'practice', label: 'practice' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === item.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="hidden xl:flex items-center gap-2 text-xs text-gray-500">
              <span>less</span>
              {[0, 1, 2, 4, 6].map((count) => (
                <span key={count} className={`w-4 h-4 rounded-md border ${getActivityTone(count)}`} />
              ))}
              <span>more</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0 rounded-2xl bg-black/20 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className={`text-sm font-semibold bg-gradient-to-r ${modeMeta[mode].accent} bg-clip-text text-transparent`}>
                  {modeMeta[mode].label}
                </p>
                <p className="text-xs text-gray-500">last 16 weeks</p>
              </div>
              <div className="flex xl:hidden items-center gap-2 text-xs text-gray-500">
                <span>less</span>
                {[0, 1, 2, 4, 6].map((count) => (
                  <span key={count} className={`w-3.5 h-3.5 rounded border ${getActivityTone(count)}`} />
                ))}
                <span>more</span>
              </div>
            </div>

            <div className="grid grid-cols-[32px_1fr] gap-3">
              <div className="grid grid-rows-7 gap-2 pt-7 text-[11px] text-gray-500">
                <span />
                <span>Mon</span>
                <span />
                <span>Wed</span>
                <span />
                <span>Fri</span>
                <span />
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {weeks.map((week, weekIndex) => {
                    const firstDay = week[0];
                    const showMonth = weekIndex === 0 || firstDay.date.getDate() <= 7;

                    return (
                      <div key={firstDay.key} className="flex-shrink-0">
                        <div className="h-5 mb-2 text-[11px] font-medium text-gray-400">
                          {showMonth ? firstDay.monthLabel : ''}
                        </div>
                        <div className="grid grid-rows-7 gap-2">
                          {week.map((day) => (
                            <button
                              key={day.key}
                              type="button"
                              title={`${formatActivityDate(day.key)}: ${day.reviewsCount} reviews, ${day.practiceCount} practice solves`}
                              onClick={() => setSelectedDayKey(day.key)}
                              className={`w-4 h-4 rounded-md border transition-all ${getActivityTone(day.count)} ${selectedDayKey === day.key ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0D1117] scale-110' : 'hover:scale-125'}`}
                              aria-label={`${formatActivityDate(day.key)} activity`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-gray-400 mb-1">selected day</p>
                <h3 className="text-2xl font-bold text-white">{formatActivityDate(selectedDayKey)}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${modeMeta[mode].accent} flex items-center justify-center text-black font-bold`}>
                {selectedItems.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl bg-purple-500/10 border border-purple-400/20 p-4">
                <p className="text-2xl font-bold text-white">{selectedActivity.reviews.length}</p>
                <p className="text-xs text-purple-200">reviews</p>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/20 p-4">
                <p className="text-2xl font-bold text-white">{selectedActivity.practice.length}</p>
                <p className="text-xs text-cyan-200">practice</p>
              </div>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="flex items-center gap-3 rounded-xl bg-black/20 border border-white/5 px-3 py-2 text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.type === 'review' ? 'bg-purple-300' : 'bg-cyan-300'}`} />
                    <span className="text-gray-200 truncate">{item.label}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-black/20 border border-dashed border-white/10 px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">no activity recorded</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs text-gray-500">busiest day</p>
              <p className="text-sm text-gray-300">{busiestDay?.count || 0} actions on {formatActivityDate(busiestDay?.key)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ActivityHeatmap.displayName = 'ActivityHeatmap';

const PracticeQuestionRow = memo(({ question, isSolved, onToggle }) => (
  <div className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 ${isSolved ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
    <button
      type="button"
      onClick={() => onToggle(question.id)}
      className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-150 ${isSolved ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 hover:border-emerald-400 text-transparent'}`}
      aria-label={isSolved ? `mark ${question.title} unsolved` : `mark ${question.title} solved`}
    >
      <CheckCircle className="w-4 h-4" />
    </button>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold truncate ${isSolved ? 'text-emerald-300 line-through decoration-emerald-500/60' : 'text-white'}`}>
        {question.title}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-gray-400">
          {question.platform}
        </span>
        <span className={`px-2 py-1 rounded-lg border text-[11px] font-medium ${getDifficultyClass(question.difficulty)}`}>
          {question.difficulty}
        </span>
        <span className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-medium text-cyan-300">
          +{getPracticeQuestionPoints(question.difficulty)} pts
        </span>
      </div>
    </div>
    <a
      href={question.url}
      target="_blank"
      rel="noreferrer"
      className="flex-shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-150"
      aria-label={`open ${question.title}`}
    >
      <ExternalLink className="w-4 h-4" />
    </a>
  </div>
));

PracticeQuestionRow.displayName = 'PracticeQuestionRow';

// ⚡ Memoized Leaderboard Item for better performance
const LeaderboardItem = memo(({ user, index, isCompact = false }) => {
  const rankBadgeClass = user.rank === 1 
    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
    : user.rank === 2
    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/50'
    : user.rank === 3
    ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/50'
    : 'bg-white/10 text-gray-400';

  const containerClass = user.highlight
    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30'
    : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.3) }}
      className={`flex items-center gap-5 p-5 rounded-2xl transition-all duration-150 cursor-pointer group ${containerClass}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${rankBadgeClass}`}>
        {user.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Profile Photo or Avatar */}
          {user.profilePhoto ? (
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-purple-500/30">
              <img 
                src={user.profilePhoto} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-xl">{user.avatar}</span>
          )}
          <p className={`font-semibold truncate ${user.highlight ? 'text-white' : 'text-gray-300'}`}>
            {user.name}
          </p>
        </div>
        <p className="text-sm text-gray-500">{user.score.toLocaleString()} pts</p>
      </div>
    </motion.div>
  );
});

LeaderboardItem.displayName = 'LeaderboardItem';

const DashboardContent = memo(({ activeTab, reviews, patterns, leaderboard, onOpenUpload, allReviews, setActiveTab }) => {
  const navigate = useNavigate();
  // Only show real reviews from database, no dummy data
  const recentReviews = Array.isArray(reviews) && reviews.length > 0 ? reviews : [];
  const dsa_patterns = Array.isArray(patterns) && patterns.length > 0 ? patterns : dsa_patterns_default;
  const safeAllReviews = Array.isArray(allReviews) ? allReviews : [];
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const [solvedPracticeIds, setSolvedPracticeIds] = useState(() => {
    try {
      const stored = localStorage.getItem(PRACTICE_PROGRESS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [solvedPracticeQuestions, setSolvedPracticeQuestions] = useState([]);
  const [practicePoints, setPracticePoints] = useState(0);
  const [isSyncingPractice, setIsSyncingPractice] = useState(false);
  
  // ⚡ Infinite scroll for reviews tab
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(10);
  const REVIEWS_PER_LOAD = 10;
  const reviewsLoadMoreRef = useRef(null);
  
  // ⚡⚡⚡ OPTIMIZED: Paginated leaderboard with infinite scroll
  const [fullLeaderboard, setFullLeaderboard] = useState([]);
  const [leaderboardPreview, setLeaderboardPreview] = useState(safeLeaderboard);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [hasMoreLeaderboard, setHasMoreLeaderboard] = useState(true);
  const LEADERBOARD_PAGE_SIZE = 50; // Load 50 at a time for optimal speed
  
  // ⚡ Infinite scroll sentinel ref (observer target)
  const loadMoreRef = useRef(null);
  
  // ⚡ Lock to prevent multiple simultaneous loads
  const isLoadingLockRef = useRef(false);
  
  // ⚡ Show scroll-to-top button when user scrolls down
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    localStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(solvedPracticeIds));
  }, [solvedPracticeIds]);

  useEffect(() => {
    setLeaderboardPreview(safeLeaderboard);
  }, [safeLeaderboard]);

  useEffect(() => {
    let isMounted = true;

    const loadPracticeProgress = async () => {
      try {
        const response = await dashboardService.getPracticeProgress();
        if (!isMounted) return;
        const solvedQuestions = response.data?.solvedQuestions || [];
        setSolvedPracticeQuestions(solvedQuestions);
        setSolvedPracticeIds(response.data?.solvedIds || solvedQuestions.map((question) => question.questionId));
        setPracticePoints(response.data?.totalPoints || 0);
      } catch (error) {
        console.error('Failed to fetch practice progress:', error);
      }
    };

    loadPracticeProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const togglePracticeQuestion = useCallback(async (questionId) => {
    const currentSolved = solvedPracticeIds.includes(questionId);
    const nextSolved = !currentSolved;
    const questionContext = patternPracticeCatalog.reduce((found, pattern) => {
      if (found) return found;
      const question = pattern.questions.find((item) => item.id === questionId);
      return question ? { ...question, patternName: pattern.name } : null;
    }, null);

    setSolvedPracticeIds((current) => (
      nextSolved
        ? [...new Set([...current, questionId])]
        : current.filter((id) => id !== questionId)
    ));
    setSolvedPracticeQuestions((current) => (
      nextSolved
        ? [
            ...current.filter((item) => item.questionId !== questionId),
            {
              questionId,
              title: questionContext?.title || '',
              platform: questionContext?.platform || '',
              patternName: questionContext?.patternName || '',
              difficulty: questionContext?.difficulty || 'Medium',
              points: getPracticeQuestionPoints(questionContext?.difficulty),
              solvedAt: new Date().toISOString(),
            },
          ]
        : current.filter((item) => item.questionId !== questionId)
    ));
    setPracticePoints((current) => Math.max(
      0,
      current + (nextSolved ? 1 : -1) * getPracticeQuestionPoints(questionContext?.difficulty)
    ));
    setIsSyncingPractice(true);

    try {
      const response = await dashboardService.updatePracticeProgress(questionId, {
        solved: nextSolved,
        question: questionContext
      });
      const solvedQuestions = response.data?.solvedQuestions || [];
      setSolvedPracticeQuestions(solvedQuestions);
      setSolvedPracticeIds(response.data?.solvedIds || solvedQuestions.map((item) => item.questionId));
      setPracticePoints(response.data?.totalPoints || 0);
      try {
        const previewResponse = await dashboardService.getLeaderboard(5, 'all-time', 1);
        setLeaderboardPreview(previewResponse.data || []);
        if (activeTab === 'leaderboard') {
          const leaderboardResponse = await dashboardService.getLeaderboard(LEADERBOARD_PAGE_SIZE, 'all-time', 1);
          setFullLeaderboard(leaderboardResponse.data || []);
          setHasMoreLeaderboard(leaderboardResponse.pagination?.hasMore || false);
        } else {
          setFullLeaderboard([]);
          setHasMoreLeaderboard(true);
        }
      } catch (leaderboardError) {
        console.error('Failed to refresh leaderboard after practice update:', leaderboardError);
      }
      setLeaderboardPage(1);
    } catch (error) {
      console.error('Failed to update practice progress:', error);
      setSolvedPracticeIds((current) => (
        currentSolved
          ? [...new Set([...current, questionId])]
          : current.filter((id) => id !== questionId)
      ));
      setSolvedPracticeQuestions((current) => (
        currentSolved
          ? [
              ...current.filter((item) => item.questionId !== questionId),
              {
                questionId,
                title: questionContext?.title || '',
                platform: questionContext?.platform || '',
                patternName: questionContext?.patternName || '',
                difficulty: questionContext?.difficulty || 'Medium',
                points: getPracticeQuestionPoints(questionContext?.difficulty),
                solvedAt: new Date().toISOString(),
              },
            ]
          : current.filter((item) => item.questionId !== questionId)
      ));
      setPracticePoints((current) => Math.max(
        0,
        current + (currentSolved ? 1 : -1) * getPracticeQuestionPoints(questionContext?.difficulty)
      ));
    } finally {
      setIsSyncingPractice(false);
    }
  }, [activeTab, solvedPracticeIds]);

  const practicePatterns = useMemo(() => {
    return patternPracticeCatalog.map((catalogPattern) => {
      const backendPattern = dsa_patterns.find((pattern) => pattern.name === catalogPattern.name) || {};
      const solved = catalogPattern.questions.filter((question) => solvedPracticeIds.includes(question.id)).length;
      const total = catalogPattern.questions.length;

      return {
        ...backendPattern,
        ...catalogPattern,
        solved,
        total,
        mastery: total > 0 ? Math.round((solved / total) * 100) : 0,
        codeReviews: getPatternReviewCount(backendPattern),
      };
    });
  }, [dsa_patterns, solvedPracticeIds]);

  const totalPracticeQuestions = practicePatterns.reduce((sum, pattern) => sum + pattern.total, 0);
  const totalSolvedPracticeQuestions = practicePatterns.reduce((sum, pattern) => sum + pattern.solved, 0);
  
  useEffect(() => {
    if (activeTab !== 'leaderboard') return;
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // ⚡ Fetch leaderboard with pagination when tab is opened
  useEffect(() => {
    if (activeTab === 'leaderboard' && fullLeaderboard.length === 0) {
      const fetchInitialLeaderboard = async () => {
        isLoadingLockRef.current = false; // Reset lock
        setIsLoadingLeaderboard(true);
        try {
          console.log('📊 Loading initial leaderboard (page 1)...');
          const response = await dashboardService.getLeaderboard(LEADERBOARD_PAGE_SIZE, 'all-time', 1);
          setFullLeaderboard(response.data || []);
          setHasMoreLeaderboard(response.pagination?.hasMore || false);
          setLeaderboardPage(1);
          console.log(`✅ Loaded ${response.data?.length || 0} users initially`);
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
          setFullLeaderboard(safeLeaderboard);
          setHasMoreLeaderboard(false);
        } finally {
          setIsLoadingLeaderboard(false);
        }
      };
      fetchInitialLeaderboard();
    }
    
    // Reset when leaving tab
    if (activeTab !== 'leaderboard') {
      isLoadingLockRef.current = false;
    }
  }, [activeTab, safeLeaderboard]);
  
  // ⚡ Load more leaderboard entries (pagination)
  const loadMoreLeaderboard = useCallback(async () => {
    // ⚡ Double-check lock: Prevent multiple simultaneous requests
    if (isLoadingMore || !hasMoreLeaderboard || isLoadingLockRef.current) return;
    
    isLoadingLockRef.current = true; // Lock immediately
    setIsLoadingMore(true);
    
    try {
      const nextPage = leaderboardPage + 1;
      console.log(`📊 Loading leaderboard page ${nextPage}...`);
      
      const response = await dashboardService.getLeaderboard(LEADERBOARD_PAGE_SIZE, 'all-time', nextPage);
      
      // Append new data to existing (avoid duplicates by checking rank)
      setFullLeaderboard(prev => {
        const existingRanks = new Set(prev.map(user => user.rank));
        const newUsers = (response.data || []).filter(user => !existingRanks.has(user.rank));
        
        if (newUsers.length > 0) {
          console.log(`✅ Added ${newUsers.length} new users (ranks ${newUsers[0].rank}-${newUsers[newUsers.length-1].rank})`);
        } else {
          console.log('⚠️ No new users added (all duplicates filtered)');
        }
        
        return [...prev, ...newUsers];
      });
      
      setHasMoreLeaderboard(response.pagination?.hasMore || false);
      setLeaderboardPage(nextPage);
    } catch (error) {
      console.error('Failed to load more leaderboard:', error);
      setHasMoreLeaderboard(false);
    } finally {
      setIsLoadingMore(false);
      isLoadingLockRef.current = false; // Unlock
    }
  }, [isLoadingMore, hasMoreLeaderboard, leaderboardPage]);
  
  // ⚡ Infinite Scroll: Observe when sentinel element comes into view
  useEffect(() => {
    if (activeTab !== 'leaderboard' || !hasMoreLeaderboard || isLoadingMore || isLoadingLockRef.current) return;
    
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    
    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        // When sentinel is visible and not already loading, load more
        if (entries[0].isIntersecting && !isLoadingLockRef.current) {
          loadMoreLeaderboard();
        }
      },
      {
        root: null, // viewport
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1 // Trigger when 10% visible
      }
    );
    
    observer.observe(sentinel);
    
    // Cleanup
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [activeTab, hasMoreLeaderboard, isLoadingMore, loadMoreLeaderboard]);
  
  // ⚡ Memoized visible reviews (only compute when dependencies change)
  const visibleReviews = useMemo(() => {
    return safeAllReviews.slice(0, visibleReviewsCount);
  }, [safeAllReviews, visibleReviewsCount]);
  
  const hasMoreReviews = safeAllReviews.length > visibleReviewsCount;
  
  // ⚡ Infinite Scroll for Reviews Tab
  useEffect(() => {
    if (activeTab !== 'reviews' || !hasMoreReviews) return;
    
    const sentinel = reviewsLoadMoreRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleReviewsCount(prev => Math.min(prev + REVIEWS_PER_LOAD, safeAllReviews.length));
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    );
    
    observer.observe(sentinel);
    
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [activeTab, hasMoreReviews, safeAllReviews.length]);
  
  // Reviews Tab
  if (activeTab === 'reviews') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">all reviews</h2>
          <p className="text-gray-500">your complete code review history</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {visibleReviews && visibleReviews.length > 0 ? (
            visibleReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                className="group relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-150"
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Code2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <h3 className="text-xl font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                        {review.title}
                      </h3>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-400">
                        {review.language}
                      </span>
                    </div>

                    {/* Premium Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
                      {/* Date & Lines */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                          <Clock className="w-3 h-3" />
                          <span>analyzed</span>
                        </div>
                        <p className="text-sm text-white font-medium">{review.date}</p>
                        <p className="text-xs text-gray-500 mt-1">{review.lines} lines</p>
                      </div>

                      {/* Complexity */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">complexity</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-mono">{review.complexity}</span>
                          <span className="text-gray-600">→</span>
                          <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-mono">{review.improved}</span>
                        </div>
                      </div>

                      {/* Performance Improvement */}
                      {review.improvement !== '0%' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-xs text-emerald-500 mb-1">⚡ speedup</p>
                          <p className="text-2xl font-bold text-emerald-400">{review.improvement}</p>
                        </div>
                      )}

                      {/* Quality Score (if available) */}
                      {review.qualityScore && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-blue-500 mb-1">💎 quality</p>
                          <p className="text-2xl font-bold text-blue-400">{review.qualityScore}/100</p>
                        </div>
                      )}
                    </div>

                    {/* Premium Insights Row */}
                    {(review.suggestionsCount > 0 || review.securityIssuesCount > 0 || review.patternsDetected > 0 || review.speedup) && (
                      <div className="flex items-center gap-3 mt-4 flex-wrap">
                        {review.suggestionsCount > 0 && (
                          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">{review.suggestionsCount} optimizations</span>
                          </div>
                        )}
                        {review.securityIssuesCount > 0 && (
                          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-xs font-medium text-red-400">⚠️ {review.securityIssuesCount} security alerts</span>
                          </div>
                        )}
                        {review.patternsDetected > 0 && (
                          <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-400">🧠 {review.patternsDetected} patterns found</span>
                          </div>
                        )}
                        {review.speedup && (
                          <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-400">{review.speedup}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                      review.status === 'optimized'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : review.status === 'analyzing'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      {review.status === 'optimized' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {review.status === 'analyzing' && <Clock className="w-4 h-4 text-blue-400 animate-spin" />}
                      <span className={`text-sm font-medium ${
                        review.status === 'optimized'
                          ? 'text-emerald-400'
                          : review.status === 'analyzing'
                          ? 'text-blue-400'
                          : 'text-yellow-400'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Code2 className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">no reviews yet</h3>
              <p className="text-gray-500">upload your first code from the overview tab to get AI-powered optimization insights</p>
            </div>
          )}
        </div>

        {/* ⚡ Infinite Scroll Sentinel for Reviews */}
        {hasMoreReviews && (
          <div ref={reviewsLoadMoreRef} className="flex justify-center pt-8 pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          </div>
        )}
      </div>
    );
  }
  
  // Leaderboard Tab - Cool & Modern Design
  if (activeTab === 'leaderboard') {
    // ⚡ Use real leaderboard data only; keep empty state for truly empty responses
    const leaderboardData = fullLeaderboard.length > 0 ? fullLeaderboard : leaderboardPreview;
    const topThree = leaderboardData.slice(0, 3);
    const rest = leaderboardData.slice(3);
    
    return (
      <div className="space-y-8">
        {/* Header with Trophy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
            >
              <Trophy className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white">leaderboard</h2>
              <p className="text-gray-500 text-sm">compete. climb. conquer.</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingLeaderboard ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">loading all competitors...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 - Compact Podium */}
            {topThree.length >= 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl p-4 hover:border-gray-400/30 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {topThree[1]?.profilePhoto ? (
                        <img 
                          src={topThree[1].profilePhoto} 
                          alt={topThree[1].name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{topThree[1]?.avatar || '⭐'}</span>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      2
                    </div>
                  </div>
                  <p className="text-base font-bold text-white mb-1 truncate w-full text-center">{topThree[1]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mb-2">{topThree[1]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-16 bg-gradient-to-t from-gray-500/20 to-gray-600/10 border-t-2 border-gray-400 rounded-t-lg" />
                </div>
              </motion.div>

              {/* 1st Place - Tallest */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-yellow-500/30 rounded-2xl p-4 hover:border-yellow-500/50 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent" />
                <div className="relative flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30 overflow-hidden">
                      {topThree[0]?.profilePhoto ? (
                        <img 
                          src={topThree[0].profilePhoto} 
                          alt={topThree[0].name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{topThree[0]?.avatar || '👑'}</span>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      1
                    </div>
                    <Sparkles className="absolute -top-0.5 -left-0.5 w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-lg font-bold text-white mb-1 truncate w-full text-center">{topThree[0]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-300 mb-2">{topThree[0]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-24 bg-gradient-to-t from-yellow-500/20 to-orange-500/10 border-t-2 border-yellow-400 rounded-t-lg" />
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl p-4 hover:border-orange-600/30 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {topThree[2]?.profilePhoto ? (
                        <img 
                          src={topThree[2].profilePhoto} 
                          alt={topThree[2].name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{topThree[2]?.avatar || '🥉'}</span>
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      3
                    </div>
                  </div>
                  <p className="text-base font-bold text-white mb-1 truncate w-full text-center">{topThree[2]?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mb-2">{topThree[2]?.score.toLocaleString() || 0} pts</p>
                  <div className="w-full h-12 bg-gradient-to-t from-orange-600/20 to-orange-700/10 border-t-2 border-orange-600 rounded-t-lg" />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {rest.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 px-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              rising stars
            </h3>
            {rest.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-150 ${
                  user.highlight
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/40'
                    : 'bg-[#141414] border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]'
                }`}
              >
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                  user.highlight
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10'
                }`}>
                  {user.rank}
                </div>

                {/* User Info */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  {/* Profile Photo or Avatar */}
                  {user.profilePhoto ? (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                      <img 
                        src={user.profilePhoto} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl flex-shrink-0">{user.avatar}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${user.highlight ? 'text-white' : 'text-gray-200'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.score.toLocaleString()} pts
                    </p>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}

        {/* Small Leaderboard List (when fewer than 3 users exist) */}
        {leaderboardData.length > 0 && leaderboardData.length < 3 && (
          <div className="max-w-4xl mx-auto space-y-3">
            {leaderboardData.map((user, index) => (
              <LeaderboardItem key={user.rank} user={user} index={index} />
            ))}
          </div>
        )}

            {/* Empty State */}
            {leaderboardData.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <p className="text-gray-300 text-sm">
                    complete more code reviews to climb the leaderboard! 🚀
                  </p>
                </div>
              </motion.div>
            )}

            {/* ⚡ Infinite Scroll: Sentinel element & Loading indicator */}
            {fullLeaderboard.length > 0 && (
              <div ref={loadMoreRef} className="flex justify-center py-12">
                {isLoadingMore && hasMoreLeaderboard ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">loading more competitors...</p>
                  </motion.div>
                ) : !hasMoreLeaderboard && fullLeaderboard.length > 5 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="relative">
                      {/* Animated background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl animate-pulse" />
                      
                      {/* Main completion card */}
                      <div className="relative inline-flex flex-col items-center gap-3 px-8 py-6 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/30 rounded-2xl">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 10, 0] }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="text-5xl"
                        >
                          🏆
                        </motion.div>
                        <div>
                          <p className="text-white text-lg font-bold mb-1">
                            legendary! you've seen them all
                          </p>
                          <p className="text-gray-400 text-sm">
                            {fullLeaderboard.length} warriors conquered • keep grinding! 💪
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            )}

            {/* ⚡ Scroll to Top Button (appears after scrolling down) */}
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-purple-500/50 transition-all hover:scale-110 z-50"
                title="Scroll to top"
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'patterns') {
    const overallPracticeProgress = totalPracticeQuestions > 0
      ? Math.round((totalSolvedPracticeQuestions / totalPracticeQuestions) * 100)
      : 0;

    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">pattern practice</h2>
            <p className="text-gray-500">solve curated LeetCode and Codeforces questions by DSA pattern</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 min-w-[220px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">overall progress</span>
              <span className="text-2xl font-bold text-white">{overallPracticeProgress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPracticeProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalSolvedPracticeQuestions}/{totalPracticeQuestions} questions solved
            </p>
            <p className="text-xs text-cyan-300 mt-1">
              {practicePoints} practice points{isSyncingPractice ? ' · syncing' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {practicePatterns.map((pattern, index) => (
            <motion.div
              key={pattern.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }}
              className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pattern.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {pattern.label}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white truncate">{pattern.name}</h3>
                    <p className="text-sm text-gray-500">
                      {pattern.solved}/{pattern.total} solved
                      {pattern.codeReviews > 0 ? ` · ${pattern.codeReviews} code ${pattern.codeReviews === 1 ? 'review' : 'reviews'}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{pattern.mastery}%</p>
                  <p className="text-xs text-gray-500">mastery</p>
                </div>
              </div>

              <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.mastery}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`h-full bg-gradient-to-r ${pattern.color} rounded-full`}
                />
              </div>

              <div className="space-y-3">
                {pattern.questions.map((question) => (
                  <PracticeQuestionRow
                    key={question.id}
                    question={question}
                    isSolved={solvedPracticeIds.includes(question.id)}
                    onToggle={togglePracticeQuestion}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  
  // Other tabs (patterns, etc.)
  if (activeTab !== 'overview') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-4">🚧 {activeTab} section</p>
          <p className="text-gray-500">coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Upload CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
        <div className="relative bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-12 hover:border-white/20 transition-all duration-150">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white">ready to optimize?</h3>
              </div>
              <p className="text-gray-400 text-lg mb-2">
                drop your code. AI analyzes it. you get better. simple as that. 🚀
              </p>
              <p className="text-gray-600 text-sm">
                supports JavaScript, Python, Java, C++, and 12 more languages
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              className="group/btn whitespace-nowrap"
              onClick={onOpenUpload}
            >
              <Upload className="w-5 h-5 mr-2" />
              upload code
              <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      <ActivityHeatmap
        reviews={safeAllReviews}
        solvedQuestions={solvedPracticeQuestions}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column - Reviews & Patterns (2/3 width) */}
        <div className="xl:col-span-2 space-y-10">
          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">recent reviews</h2>
                <p className="text-gray-500">your latest code optimizations</p>
              </div>
              <Button variant="secondary" size="sm" className="group">
                view all
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="space-y-5">
              {recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/review/${review.id}`)}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl">
                          <Code2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                            {review.title || 'Untitled Review'}
                          </h3>
                          <p className="text-sm text-gray-500">{review.language || 'Code'} • {review.lines || 0} lines • {review.date || 'Just now'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">before</p>
                          <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-mono">
                            {review.complexity || 'O(n)'}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">after</p>
                          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-mono">
                            {review.improved || 'O(n)'}
                          </span>
                        </div>
                        <div className="ml-auto">
                          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl">
                            <p className="text-xs text-gray-500 mb-0.5">improvement</p>
                            <p className="text-2xl font-bold text-emerald-400">{review.improvement || '0%'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-4 py-2 rounded-xl border text-xs font-semibold ${
                        review.status === 'completed' || review.status === 'optimized'
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                          : review.status === 'analyzing' || review.status === 'pending'
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 animate-pulse'
                          : review.status === 'failed'
                          ? 'bg-red-600/10 border-red-500/30 text-red-400'
                          : 'bg-gray-600/10 border-gray-500/30 text-gray-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{review.status || 'pending'}</span>
                          {(review.status === 'analyzing' || review.status === 'pending') && (
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group-hover:scale-110">
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-16 text-center">
                  <Code2 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400 mb-2">no reviews yet</p>
                  <p className="text-sm text-gray-600">upload your first code to get AI-powered analysis!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* DSA Pattern Mastery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">pattern mastery</h2>
              <p className="text-gray-500">track real-code familiarity across DSA patterns</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {practicePatterns.map((pattern, index) => (
                <motion.div
                  key={pattern.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-150 group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pattern.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                        {pattern.label}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{pattern.name}</h3>
                        <p className="text-sm text-gray-500">
                          {pattern.solved}/{pattern.total} questions solved
                        </p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{pattern.mastery}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pattern.mastery}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`h-full bg-gradient-to-r ${pattern.color} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {pattern.questions.slice(0, 3).map((question) => (
                      <PracticeQuestionRow
                        key={question.id}
                        question={question}
                        isSolved={solvedPracticeIds.includes(question.id)}
                        onToggle={togglePracticeQuestion}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('patterns')}
                    className="w-full mt-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-150 group/button cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      view all questions
                      <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Leaderboard (1/3 width) */}
        <div className="xl:col-span-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="sticky top-32"
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">leaderboard</h2>
              <p className="text-gray-500">top performers this week</p>
            </div>

            <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 space-y-4">
              {(leaderboardPreview.length > 0 ? leaderboardPreview : defaultLeaderboard).map((user, index) => (
                <LeaderboardItem key={user.rank} user={user} index={index} isCompact />
              ))}

              {/* View Full Leaderboard */}
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-white font-medium transition-all duration-150 group cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  view full leaderboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;

