const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  presets: [
    ["@babel/preset-typescript"],
    [
      "@babel/preset-env",
      {
        targets: isProduction ? "defaults, not ie 11" : "last 1 chrome version",
        corejs: "3",
        modules: false, // ESMを維持してTree ShakingとCode Splittingを有効化
        useBuiltIns: "entry",
      },
    ],
    [
      "@babel/preset-react",
      {
        // NODE_ENVに基づいて適切にモードを切り替える
        development: process.env.NODE_ENV === "development",
        runtime: "automatic",
      },
    ],
  ],
};
