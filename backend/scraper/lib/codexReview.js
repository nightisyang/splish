const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'schemas', 'description-review.schema.json');
const projectRoot = path.join(__dirname, '..', '..');

function isCodexAvailable() {
  const result = spawnSync('codex', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

function reviewDescriptionWithCodex(record) {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'splish-description-'));
  const outputPath = path.join(temporaryDirectory, 'result.json');
  const prompt = [
    'You are reviewing an extracted waterfall description for paragraph formatting only.',
    'Return JSON matching the supplied schema.',
    'Preserve every factual claim and the original wording wherever possible.',
    'You may remove obvious navigation, comment-widget, image-caption, or safety boilerplate.',
    'You may split or join paragraphs where the source HTML structure was malformed.',
    'Do not add facts, rewrite access advice, alter safety claims, or alter place names.',
    '',
    JSON.stringify({
      name: record.name,
      state: record.state,
      locality: record.locality,
      summary: record.summary,
      description: record.description,
      imageCaptions: record.imgDetails?.imgDesc || []
    }, null, 2)
  ].join('\n');

  try {
    const result = spawnSync('codex', [
      'exec',
      '--sandbox', 'read-only',
      '--ephemeral',
      '--output-schema', schemaPath,
      '--output-last-message', outputPath,
      '-C', projectRoot,
      '-'
    ], {
      encoding: 'utf8',
      input: prompt,
      timeout: 180000,
      maxBuffer: 2 * 1024 * 1024
    });
    if (result.status !== 0) {
      throw new Error(result.stderr.trim() || `Codex exited with status ${result.status}`);
    }
    return JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

module.exports = { isCodexAvailable, reviewDescriptionWithCodex };
