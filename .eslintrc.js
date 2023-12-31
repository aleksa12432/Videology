module.exports = {
  root: true,
  extends: '@react-native',
  "rules": {
    // enable additional rules
    "indent": ["error", 4],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],

    // override configuration set by extending "eslint:recommended"
    "no-empty": "warn",
    "no-cond-assign": ["error", "always"],

    // disable rules from base configurations
     "for-direction": "off"
  }
};
