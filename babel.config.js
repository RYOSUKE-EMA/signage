module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: "false",
        useBuiltIns: "usage",
        targets: "> 0.25%, not dead",Help: Start Extension Bisect
      },
    ],
  ],
  env: {
    test: {
      presets: [["@babel/preset-env", { targets: { node: "current" } }]],
    },
  },
};
