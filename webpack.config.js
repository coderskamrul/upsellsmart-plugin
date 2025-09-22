const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const isProduction = process.env.NODE_ENV === "production"

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: {
    admin: "./src/admin/index.js",
    frontend: "./src/frontend/index.js",
  },
  output: {
    path: path.resolve(__dirname, "assets/dist"),
    filename: "js/[name].js",
    clean: isProduction, // Only clean in production
  },
  // Add development optimizations
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  // Faster builds for development
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true, // Enable babel caching
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader", // Use style-loader in dev for faster builds
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ],
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader", // Use style-loader in dev for faster builds
          "css-loader",
          "postcss-loader"
        ],
      },
    ],
  },
  plugins: [
    ...(isProduction ? [new MiniCssExtractPlugin({
      filename: "css/[name].css",
    })] : []), // Only use MiniCssExtractPlugin in production
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    jquery: "jQuery",
  },
  devtool: isProduction ? false : "eval-cheap-module-source-map", // Faster source maps for development
}
