// Tokens (DTCG JSON) → CSS custom properties + resolved JSON for the contrast test and token stories.
export default {
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/tokens/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    json: {
      transformGroup: 'js',
      buildPath: 'src/tokens/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }],
    },
  },
};
