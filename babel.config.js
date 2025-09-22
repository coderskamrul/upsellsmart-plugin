const isProduction = process.env.NODE_ENV === "production"

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions", "not ie <= 8"],
        },
        modules: false,
        // Only use polyfills in production
        useBuiltIns: isProduction ? "usage" : false,
        corejs: isProduction ? 3 : false,
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        // Fast development mode
        development: !isProduction,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    [
      "@babel/plugin-transform-runtime",
      {
        // Faster builds in development
        helpers: isProduction,
        regenerator: isProduction,
      }
    ]
  ],
}
