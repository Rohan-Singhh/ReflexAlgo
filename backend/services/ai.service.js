/**
 * AI Code Analysis Service
 * 
 * Uses OpenRouter to analyze code and provide optimization insights
 */

const axios = require('axios');

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
 * Get code analysis prompt
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language
 * @param {string} title - Code title/description
 * @returns {string} - Formatted prompt
 */
const getCodeAnalysisPrompt = (code, language, title) => {
  return `Analyze this ${language} code and provide optimization insights in the following JSON format:

{
  "timeComplexity": {
    "before": "O(n²)",
    "after": "O(n log n)",
    "improved": true,
    "explanation": "Brief explanation of complexity improvement"
  },
  "spaceComplexity": {
    "before": "O(n)",
    "after": "O(1)",
    "improved": true,
    "explanation": "Brief explanation of space improvement"
  },
  "improvementPercentage": 75,
  "optimizationSuggestions": [
    {
      "title": "Use hash map instead of nested loops",
      "description": "Replace the nested loop with a hash map for O(n) lookup",
      "priority": "high",
      "lineNumber": 15
    }
  ],
  "detectedPatterns": ["Two Pointers", "Sliding Window"],
  "codeQualityScore": 85,
  "readabilityScore": 90,
  "optimizedCode": "// Optimized version of the code with improvements"
}

GUIDELINES:
1. Analyze actual complexity - be accurate
2. Improvement percentage: realistic estimate (0-100)
3. Code quality score: 0-100 based on best practices
4. Readability score: 0-100 based on clarity
5. Detected patterns: only if genuinely present
6. Optimization suggestions: 2-5 actionable items with priorities (low/medium/high/critical)
7. Optimized code: actual improved code, not just comments
8. Return ONLY valid JSON, no markdown or extra text

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

    // Optimistic settings for speed
    const settings = {
      temperature: 0.3, // Lower for consistent, focused responses
      max_tokens: 2000, // Reduced for faster response
      top_p: 0.9
    };

    // Model-specific optimizations
    if (model.includes('deepseek')) {
      settings.temperature = 0.2; // Most consistent JSON
      settings.max_tokens = 1500;
    } else if (model.includes('llama')) {
      settings.temperature = 0.3;
      settings.max_tokens = 1800;
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
        timeout: 15000 // 15-second timeout for speed
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

    // Parse JSON response
    try {
      // Clean markdown code blocks
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```javascript\s*/g, '')
        .replace(/```js\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      const analysis = JSON.parse(cleanedResponse);

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

