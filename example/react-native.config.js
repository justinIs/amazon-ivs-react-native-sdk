const path = require('path');
const pkg = require('../package.json');

module.exports = {
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Explicitly specify the platform so the codegen script resolves the
        // local library correctly (Android-only for this PoC).
        android: {},
      },
    },
  },
};
