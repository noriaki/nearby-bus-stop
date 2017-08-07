module.exports = {
  "parser": "babel-eslint",
  "root": true,
  "env": {
    "node": true,
    "browser": true,
    "es6": true,
    "jest/globals": true
  },
  "extends": [
    "eslint:recommended",
    "airbnb"
  ],
  "plugins": [
    "jest"
  ],
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    }
  },
  "globals": {
    "BRANCH": true,
    "COMMIT": true
  },
  "rules": {
    "indent": ["error", 2],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "never"
    }],
    "no-console": "warn",
    "no-use-before-define": "off",
    "no-confusing-arrow": ["error", { "allowParens": true }],
    "react/jsx-closing-bracket-location": [ "error", "after-props" ],
    "react/jsx-filename-extension": ["error", { "extensions": [".js"] }],
    "react/prop-types": "warn",
    "import/no-extraneous-dependencies": [
      "error", { "dependencies": true, "peerDependencies": true }
    ]
  }
};
