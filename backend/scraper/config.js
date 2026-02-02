const path = require('path');

module.exports = {
  // Base URL for the waterfall website
  baseUrl: 'https://waterfallsofmalaysia.com',

  // State IDs (1-13 for all Malaysian states)
  stateIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],

  // State names mapped to IDs
  stateNames: {
    1: 'Johor',
    2: 'Kedah',
    3: 'Kelantan',
    4: 'Malacca',
    5: 'Negri Sembilan',
    6: 'Pahang',
    7: 'Perak',
    8: 'Perlis',
    9: 'Penang',
    10: 'Sabah',
    11: 'Sarawak',
    12: 'Selangor',
    13: 'Terengganu'
  },

  // State name to ID lookup
  stateNameToId: {
    'Johor': 1,
    'Kedah': 2,
    'Kelantan': 3,
    'Malacca': 4,
    'Negri Sembilan': 5,
    'Pahang': 6,
    'Perak': 7,
    'Perlis': 8,
    'Penang': 9,
    'Sabah': 10,
    'Sarawak': 11,
    'Selangor': 12,
    'Terengganu': 13
  },

  // Polite scraping delay (ms)
  requestDelayMs: 2000,

  // Retry settings
  maxRetries: 3,
  retryDelayMs: 5000,

  // Paths
  paths: {
    database: path.join(__dirname, '..', 'db', 'waterfalls.db'),
    images: path.join(__dirname, '..', 'public', 'images')
  },

  // Known problematic pages that require Claude CLI parsing
  problematicPages: [
    '164ayerputeri.php',
    '98kotatinggi.php',
    '58ledang.php',
    '99pulai.php',
    '128takamelor.php',
    '159asahan.php',
    '161jeramtinggi.php'
  ],

  // Boilerplate text to remove from descriptions
  boilerplateStrings: [
    'Check if you need a permit before planning a waterfall trip.',
    'More information hereWaterfalls can be dangerous ! ',
    'Always take care about your safetyVisitor Comments',
    'Always take care about your safety',
    "Check if you need a permit before planning a waterfall trip. More information hereWaterfalls can be dangerous ! Always take care about your safetyTo add a comment you must logon/register firstrmb_ki101('79qfmgtj4fu','','26','26',1,'ffffff','010020','00fff6');",
    "To add a comment you must logon/register firstrmb_ki101('79qfmgtj4fu','','26','26',1,'ffffff','010020','00fff6');"
  ],

  // Image URL to skip (site logo)
  skipImageUrl: 'https://waterfallsofmalaysia.com/images/waterfalls01_small.jpg'
};
