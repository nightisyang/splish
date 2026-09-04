const CONTAMINATION_PATTERNS = [
  /\|heading_\d+\|/i,
  /Visitor Comments/i,
  /rmb_ki\d+/i,
  /To add a comment you must/i
];

function assessRecord(record) {
  const errors = [];
  const warnings = [];
  const reviewReasons = [];
  const description = record.description || '';
  const images = record.imgDetails || {};
  const imageLengths = [
    images.imgUrl,
    images.imgFilename,
    images.imgFullResUrl,
    images.imgFullResFilename,
    images.imgDesc
  ].map(value => Array.isArray(value) ? value.length : 0);

  for (const field of ['name', 'state', 'url']) {
    if (!record[field]) errors.push(`missing_${field}`);
  }
  if (!record.location?.coordinates || record.location.coordinates.length !== 2) {
    warnings.push('missing_coordinates');
  } else {
    const [longitude, latitude] = record.location.coordinates;
    if (longitude < 99 || longitude > 120 || latitude < 0.5 || latitude > 8) {
      errors.push('coordinates_outside_malaysia');
    }
  }
  if (new Set(imageLengths).size > 1) errors.push('image_arrays_misaligned');
  if (!description) {
    warnings.push('missing_description');
  } else {
    if (description.length < 80) warnings.push('short_description');
    if (description.length > 1800 && !description.includes('\n\n')) {
      reviewReasons.push('long_single_paragraph');
    }
    if (CONTAMINATION_PATTERNS.some(pattern => pattern.test(description))) {
      reviewReasons.push('boilerplate_contamination');
    }
  }

  return {
    errors,
    warnings,
    reviewReasons,
    valid: errors.length === 0
  };
}

function buildQualityReport(records, failures = []) {
  const items = records.map(record => ({
    url: record.url,
    name: record.name,
    ...assessRecord(record)
  }));
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      records: records.length,
      valid: items.filter(item => item.valid).length,
      withErrors: items.filter(item => item.errors.length).length,
      withWarnings: items.filter(item => item.warnings.length).length,
      needingLlmReview: items.filter(item => item.reviewReasons.length).length,
      failedFetches: failures.length
    },
    failures,
    issues: items.filter(item => item.errors.length || item.warnings.length || item.reviewReasons.length)
  };
}

module.exports = { assessRecord, buildQualityReport };
