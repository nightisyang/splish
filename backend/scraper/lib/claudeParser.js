const { execSync } = require('child_process');
const { parseCoordinates } = require('./gpsConverter');

/**
 * Use Claude CLI to parse problematic HTML pages
 * @param {string} html - Raw HTML content
 * @param {string} url - The page URL for context
 * @returns {Object|null} Parsed waterfall data or null on failure
 */
async function parseWithClaude(html, url) {
  // Truncate HTML to avoid exceeding input limits
  const truncatedHtml = html.substring(0, 50000);

  const prompt = `Extract waterfall data from this HTML page. Return ONLY valid JSON (no markdown, no explanation) with these fields:
{
  "name": "waterfall name from title",
  "description": "main descriptive text about the waterfall",
  "state": "Malaysian state name",
  "coordinates": "raw coordinate string if found",
  "waterSource": "water source info",
  "waterfallProfile": "waterfall profile/type",
  "accessibility": "accessibility info",
  "imgUrl": ["array of image URLs"],
  "imgDesc": ["array of image descriptions"]
}

HTML content:
${truncatedHtml}`;

  try {
    // Escape the prompt for shell
    const escapedPrompt = prompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    // Use claude CLI with sonnet model
    const result = execSync(
      `claude -p --model sonnet "${escapedPrompt}"`,
      {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000 // 2 minute timeout
      }
    );

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`Claude parsing failed for ${url}: No JSON in response`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Transform to our expected format
    const waterfall = {
      name: parsed.name,
      description: parsed.description,
      state: parsed.state,
      waterSource: parsed.waterSource,
      waterfallProfile: parsed.waterfallProfile,
      accessibility: parsed.accessibility,
      location: null,
      imgDetails: {
        imgFilename: (parsed.imgUrl || []).map(url => url.split('/').pop()),
        imgUrl: parsed.imgUrl || [],
        imgDesc: parsed.imgDesc || []
      },
      url
    };

    // Parse coordinates if available
    if (parsed.coordinates) {
      const location = parseCoordinates(parsed.coordinates);
      if (location) {
        waterfall.location = location;
      }
    }

    return waterfall;
  } catch (err) {
    console.error(`Claude parsing error for ${url}:`, err.message);
    return null;
  }
}

/**
 * Check if Claude CLI is available
 * @returns {boolean} True if claude CLI is available
 */
function isClaudeAvailable() {
  try {
    execSync('which claude', { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  parseWithClaude,
  isClaudeAvailable
};
