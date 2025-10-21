/**
 * AI Code Analysis Service
 * 
 * Uses OpenRouter to analyze code and provide optimization insights
 */

const axios = require('axios');

/**
 * Deep parse JSON - recursively parse stringified JSON
 * Handles cases where AI returns nested stringified JSON
 */
function deepParseJSON(obj) {
  if (typeof obj === 'string') {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(obj);
      return deepParseJSON(parsed); // Recursively parse
    } catch (e) {
      // Not JSON, return as is
      return obj;
    }
  } else if (Array.isArray(obj)) {
    return obj.map(item => deepParseJSON(item));
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deepParseJSON(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

// OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OpenRouter API key not set - using mock analysis');
}

// Default model to use - prioritize fast, free models
const DEFAULT_MODEL = 'meta-llama/llama-4-maverick:free';

// Available free models optimized for code analysis
const FREE_CODE_MODELS = [
  'meta-llama/llama-4-maverick:free',
  'deepseek/deepseek-v3-base:free',
  'mistralai/mistral-small-3.1-24b-instruct:free'
];

/**
 * Get system prompt for code analysis
 * @param {string} model - Model identifier
 * @returns {string} - System prompt
 */
const getSystemPrompt = (model) => {
  const basePrompt = `You are an expert code optimization engineer specialized in data structures and algorithms.
Your task is to analyze code for time/space complexity, detect optimization opportunities, identify DSA patterns,
and provide actionable suggestions. Focus on accuracy and practical improvements.`;

  if (model?.includes('llama')) {
    return `${basePrompt}

Return your analysis in valid JSON format without markdown, explanations, or text outside the JSON.
The JSON must be directly parseable by JSON.parse().`;
  }

  if (model?.includes('deepseek')) {
    return `${basePrompt}

Return only valid, parseable JSON without explanations. No markdown formatting or text outside JSON.`;
  }

  if (model?.includes('mistral')) {
    return `${basePrompt}

Return only the JSON object with no other text. JSON must be correctly formatted and parseable.`;
  }

  return `${basePrompt}

Respond ONLY with valid JSON. No markdown, explanations, or text outside the JSON structure.`;
};

/**
 * Get code analysis prompt - Premium detailed analysis
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language
 * @param {string} title - Code title/description
 * @returns {string} - Formatted prompt
 */
const getCodeAnalysisPrompt = (code, language, title) => {
  return `You are a senior software architect conducting a comprehensive code review. Analyze this ${language} code with extreme attention to detail and provide professional-grade optimization insights.

Return your analysis in the following JSON format:

{
  "timeComplexity": {
    "before": "O(n²)",
    "after": "O(n log n)",
    "improved": true,
    "explanation": "Detailed explanation: Current nested loop structure creates quadratic time. By using a hash map for lookups, we reduce inner loop from O(n) to O(1), achieving O(n) overall time complexity.",
    "bottlenecks": ["Line 15-23: Nested iteration", "Line 8: Inefficient array search"],
    "proofOfImprovement": "Benchmarked on 10k elements: 2.3s → 0.15s (15x faster)"
  },
  "spaceComplexity": {
    "before": "O(n)",
    "after": "O(1)",
    "improved": true,
    "explanation": "Current implementation creates auxiliary arrays. Can use in-place operations with two-pointer technique to achieve constant space.",
    "memoryImpact": "Reduces memory usage from 800MB to 8MB for large datasets",
    "tradeoffs": "Slight increase in code complexity for significant memory savings"
  },
  "improvementPercentage": 85,
  "performanceMetrics": {
    "estimatedSpeedup": "12-15x faster",
    "scalability": "Excellent - handles millions of records",
    "worstCaseScenario": "O(n log n) vs current O(n²)",
    "realWorldImpact": "User-facing operations complete in <100ms vs 1.2s"
  },
  "optimizationSuggestions": [
    {
      "title": "Replace nested loops with hash map lookup",
      "description": "Current nested loop (lines 15-23) creates O(n²) complexity. Use Map/Set for O(1) lookups. This is the critical bottleneck affecting 80% of execution time.",
      "priority": "critical",
      "lineNumber": 15,
      "impact": "15x performance improvement",
      "codeExample": "const seen = new Map(); // O(1) lookup instead of O(n) array.find()",
      "estimatedEffort": "15 minutes",
      "alternatives": ["Use binary search (O(log n))", "Sort and use two pointers"]
    },
    {
      "title": "Implement memoization for recursive calls",
      "description": "Function recalculates same values repeatedly. Add caching layer to store computed results.",
      "priority": "high",
      "lineNumber": 42,
      "impact": "Prevents redundant calculations, 8x speedup",
      "codeExample": "const cache = {}; if (cache[key]) return cache[key];",
      "estimatedEffort": "10 minutes"
    },
    {
      "title": "Use early returns to avoid unnecessary processing",
      "description": "Add validation checks at function start to exit early for invalid inputs.",
      "priority": "medium",
      "lineNumber": 5,
      "impact": "Saves 20% processing on average",
      "estimatedEffort": "5 minutes"
    }
  ],
  "codeSmells": [
    {
      "type": "Performance",
      "issue": "Nested array iterations",
      "location": "Lines 15-23",
      "severity": "high",
      "fix": "Use hash-based data structures"
    },
    {
      "type": "Maintainability", 
      "issue": "Magic numbers without constants",
      "location": "Lines 8, 12, 19",
      "severity": "medium",
      "fix": "Extract to named constants"
    }
  ],
  "detectedPatterns": [
    {
      "pattern": "Two Pointers",
      "confidence": "high",
      "location": "Lines 15-30",
      "usage": "Can optimize array traversal"
    },
    {
      "pattern": "Sliding Window",
      "confidence": "medium", 
      "location": "Lines 35-45",
      "usage": "Potential for subarray optimization"
    }
  ],
  "securityConcerns": [
    {
      "issue": "No input validation",
      "severity": "medium",
      "recommendation": "Add type checking and bounds validation",
      "lineNumber": 1
    }
  ],
  "bestPractices": {
    "followed": ["Descriptive variable names", "Consistent indentation"],
    "missing": ["Error handling", "Input validation", "Documentation comments", "Type annotations"],
    "recommendations": [
      "Add JSDoc comments for function documentation",
      "Implement try-catch for error handling",
      "Add TypeScript types or JSDoc @param annotations"
    ]
  },
  "codeQualityScore": 72,
  "readabilityScore": 85,
  "maintainabilityScore": 68,
  "testabilityScore": 55,
  "qualityBreakdown": {
    "codeQuality": {
      "score": 72,
      "factors": {
        "complexity": "High - nested loops reduce score",
        "duplication": "Low - no repeated code blocks",
        "naming": "Good - clear variable names",
        "structure": "Fair - could benefit from helper functions"
      }
    },
    "readability": {
      "score": 85,
      "factors": {
        "clarity": "Good - logic is understandable",
        "formatting": "Excellent - consistent style",
        "comments": "Poor - missing explanatory comments"
      }
    }
  },
  "optimizedCode": "// OPTIMIZED VERSION - 15x faster, O(n) time complexity\\n\\nfunction optimizedSolution(arr) {\\n  // Input validation\\n  if (!Array.isArray(arr) || arr.length === 0) return [];\\n\\n  // Use Map for O(1) lookups instead of nested loops\\n  const seen = new Map();\\n  const result = [];\\n\\n  for (const item of arr) {\\n    if (!seen.has(item)) {\\n      seen.set(item, true);\\n      result.push(item);\\n    }\\n  }\\n\\n  return result;\\n}\\n\\n// Performance: O(n) time, O(n) space\\n// Benchmarks: 10k items: 2.3s → 0.15s (15x faster)",
  "learningResources": [
    {
      "topic": "Hash Tables for O(1) Lookup",
      "url": "https://leetcode.com/explore/learn/card/hash-table/",
      "relevance": "Directly applicable to this optimization"
    },
    {
      "topic": "Time Complexity Analysis",
      "url": "https://www.bigocheatsheet.com/",
      "relevance": "Understanding algorithmic complexity"
    }
  ],
  "nextSteps": [
    "1. Replace nested loops with hash map (Priority: Critical)",
    "2. Add input validation and error handling",
    "3. Write unit tests for edge cases",
    "4. Add performance benchmarks",
    "5. Document code with JSDoc comments"
  ],
  "estimatedROI": {
    "developmentTime": "30-45 minutes",
    "performanceGain": "15x faster execution",
    "maintenanceReduction": "40% fewer bugs",
    "userExperienceImprovement": "Sub-100ms response times"
  }
}

CRITICAL ANALYSIS REQUIREMENTS:
1. TIME COMPLEXITY: Provide detailed analysis with specific line numbers for bottlenecks
2. SPACE COMPLEXITY: Explain memory usage patterns and optimization opportunities
3. OPTIMIZATION SUGGESTIONS: 3-6 actionable items with code examples and impact estimates
4. CODE SMELLS: Identify anti-patterns and maintainability issues
5. SECURITY: Check for common vulnerabilities (injection, validation, etc.)
6. BEST PRACTICES: Evaluate against industry standards (SOLID, DRY, etc.)
7. PATTERNS: Detect algorithmic patterns (Two Pointers, Sliding Window, DP, etc.)
8. SCORES: Provide separate scores for quality, readability, maintainability, testability (0-100)
9. OPTIMIZED CODE: Write actual improved code with comments explaining optimizations
10. ROI ANALYSIS: Estimate time investment vs performance gains
11. LEARNING RESOURCES: Suggest 2-3 relevant educational links
12. NEXT STEPS: Provide prioritized action items

Be thorough, specific, and actionable. This is a premium analysis worth the investment.

Code Title: ${title}
Programming Language: ${language}

Code to analyze:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;
};

/**
 * Generate fallback analysis when AI unavailable
 * @param {string} code - Code text
 * @param {string} language - Programming language
 * @returns {Object} - Basic analysis
 */
const generateFallbackAnalysis = (code, language) => {
  const lines = code.split('\n').length;
  const hasNestedLoops = /for.*for|while.*while/s.test(code);
  const hasRecursion = /function.*\1\(/s.test(code);
  
  // Simple heuristic scoring
  const baseScore = 75;
  const codeQualityScore = Math.min(90, baseScore + (lines < 100 ? 10 : 0) + (code.includes('const') ? 5 : 0));
  const readabilityScore = Math.min(85, baseScore + (lines < 50 ? 10 : 0));
  
  return {
    timeComplexity: {
      before: hasNestedLoops ? 'O(n²)' : hasRecursion ? 'O(2^n)' : 'O(n)',
      after: hasNestedLoops ? 'O(n log n)' : hasRecursion ? 'O(n)' : 'O(n)',
      improved: hasNestedLoops || hasRecursion,
      explanation: 'Estimated based on code structure'
    },
    spaceComplexity: {
      before: 'O(n)',
      after: 'O(1)',
      improved: true,
      explanation: 'Can be optimized with in-place operations'
    },
    improvementPercentage: hasNestedLoops ? 65 : hasRecursion ? 70 : 55,
    optimizationSuggestions: [
      {
        title: 'Review algorithmic complexity',
        description: 'Consider using more efficient data structures',
        priority: 'medium',
        lineNumber: 1
      },
      {
        title: 'Add input validation',
        description: 'Validate inputs to prevent edge case errors',
        priority: 'high',
        lineNumber: 1
      }
    ],
    detectedPatterns: [],
    codeQualityScore,
    readabilityScore,
    optimizedCode: `// Optimized ${language} code\n${code}\n\n// Consider using hash maps, binary search, or dynamic programming for better performance`
  };
};

/**
 * Analyze code using AI
 * @param {string} code - Code to analyze
 * @param {string} language - Programming language
 * @param {string} title - Code title
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - Analysis results
 */
const analyzeCode = async (code, language, title, options = {}) => {
  // If no API key, use fallback immediately
  if (!OPENROUTER_API_KEY) {
    console.log('Using fallback analysis (no API key)');
    return {
      success: true,
      data: generateFallbackAnalysis(code, language),
      usedFallback: true,
      reason: 'No API key configured'
    };
  }

  try {
    console.log('🤖 Analyzing code with OpenRouter AI...');
    const startTime = Date.now();

    const model = options.model || DEFAULT_MODEL;
    const prompt = getCodeAnalysisPrompt(code, language, title);
    const systemPrompt = getSystemPrompt(model);

    // Premium settings for detailed analysis
    const settings = {
      temperature: 0.4, // Balanced for detailed yet focused responses
      max_tokens: 4000, // Increased for comprehensive analysis
      top_p: 0.95
    };

    // Model-specific optimizations
    if (model.includes('deepseek')) {
      settings.temperature = 0.3; // Most consistent JSON
      settings.max_tokens = 4000; // Full detailed analysis
    } else if (model.includes('llama')) {
      settings.temperature = 0.4;
      settings.max_tokens = 3500;
    } else if (model.includes('mistral')) {
      settings.temperature = 0.35;
      settings.max_tokens = 3800;
    }

    // Make API request with timeout
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
        top_p: settings.top_p
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://reflexalgo.com',
          'X-Title': 'ReflexAlgo Code Analysis'
        },
        timeout: 30000 // 30-second timeout for detailed analysis
      }
    );

    const elapsed = Date.now() - startTime;
    console.log(`✅ AI analysis completed in ${elapsed}ms`);

    // Validate response
    if (!response?.data?.choices?.[0]?.message?.content) {
      console.log('Invalid API response, using fallback');
      return {
        success: true,
        data: generateFallbackAnalysis(code, language),
        usedFallback: true,
        reason: 'Invalid API response format'
      };
    }

    const aiResponse = response.data.choices[0].message.content;

    // Parse JSON response with enhanced cleaning
    try {
      // Clean markdown code blocks and common formatting issues
      let cleanedResponse = aiResponse
        .replace(/```json\s*/gi, '')
        .replace(/```javascript\s*/gi, '')
        .replace(/```js\s*/gi, '')
        .replace(/```\s*$/gm, '')
        .replace(/^```\s*/gm, '')
        .trim();

      // Remove any trailing commas before closing brackets/braces (invalid JSON)
      cleanedResponse = cleanedResponse
        .replace(/,(\s*[}\]])/g, '$1');

      // Try to parse
      let analysis = JSON.parse(cleanedResponse);

      // Deep clean: recursively parse any stringified JSON in the response
      analysis = deepParseJSON(analysis);

      // Validate required fields
      if (!analysis.timeComplexity || !analysis.codeQualityScore) {
        throw new Error('Missing required fields');
      }

      return {
        success: true,
        data: analysis,
        model,
        processingTime: elapsed,
        usedFallback: false
      };
    } catch (parseError) {
      console.log('JSON parse failed, using fallback:', parseError.message);
      console.log('Failed content preview:', aiResponse.substring(0, 200));
      return {
        success: true,
        data: generateFallbackAnalysis(code, language),
        usedFallback: true,
        reason: 'JSON parse error',
        rawResponse: aiResponse.slice(0, 200) // First 200 chars for debugging
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error.message);
    
    // Return fallback on any error
    return {
      success: true,
      data: generateFallbackAnalysis(code, language),
      usedFallback: true,
      reason: error.message,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Quick code complexity check (no AI, instant)
 * @param {string} code - Code to check
 * @returns {Object} - Quick analysis
 */
const quickComplexityCheck = (code) => {
  const lines = code.split('\n').length;
  const hasNestedLoops = /for.*for|while.*while/s.test(code);
  const hasRecursion = code.match(/function\s+(\w+).*\1\(/s);
  const loopCount = (code.match(/for\s*\(|while\s*\(/g) || []).length;
  
  return {
    lines,
    hasNestedLoops,
    hasRecursion: !!hasRecursion,
    loopCount,
    estimatedComplexity: hasNestedLoops ? 'O(n²)' : hasRecursion ? 'O(2^n)' : loopCount > 0 ? 'O(n)' : 'O(1)',
    needsOptimization: hasNestedLoops || hasRecursion
  };
};

module.exports = {
  analyzeCode,
  quickComplexityCheck,
  FREE_CODE_MODELS
};

