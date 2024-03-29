module.exports =  {
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "env":
  {
    "browser": true,
    "node": true,
    "mocha": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "legacyDecorators": true
    }
  },
  "rules":
  {
    "no-undef": 0,
    "new-cap": [2,
      {
        "capIsNewExceptions": ["List", "Map", "Set"]
      }],
    "react/no-multi-comp": 0,
    "import/default": 0,
    "import/no-duplicates": 0,
    "import/named": 0,
    "import/namespace": 0,
    "import/no-unresolved": 0,
    "import/no-named-as-default": 2,
    "comma-dangle": 0, // not sure why airbnb turned this on. gross!
    "indent": [1, 2,
      {
        "SwitchCase": 1
      }],
    "no-console": 0,
    "no-alert": 0,
    // add
    "import/extensions": 0,
    "react/jsx-filename-extension": 0,
    "react/prefer-stateless-function": 0,
    "object-shorthand": 0,
    "quotes": 0,
    "prefer-template": 0,
    // 暂时关闭-start
    // 以下为不得不取消 warning 的项目，
    // 因为太多了，没时间修复，所以暂时取消 warning
    // TODO: 后面有时间再放开修改
    "eqeqeq": 0,
    "no-unused-vars": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "react/jsx-no-target-blank": 0,
    "array-callback-return": 0,
    "no-mixed-operators": 0,
    "no-unreachable": 0,
    // 暂时关闭-end
  },
  "plugins": [
    "react", "import"
  ],
  "settings":
  {
    "import/parser": "babel-eslint",
    "import/resolve":
    {
      "moduleDirectory": ["node_modules", "src"]
    }
  },
  "globals":
  {
    "PRODUCTION": "readonly",
    "__DEVELOPMENT__": true,
    "__CLIENT__": true,
    "__SERVER__": true,
    "__DISABLE_SSR__": true,
    "__DEVTOOLS__": true,
    "socket": true,
    "webpackIsomorphicTools": true
  },
  "ignorePatterns": ["**/*.md"],
  "overrides": [{
    "files": ["**/*.ts", "**/*.tsx"],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/eslint-recommended',
    ],
    "rules": {
      "react/prop-types": 0,
    }
  }]
}
