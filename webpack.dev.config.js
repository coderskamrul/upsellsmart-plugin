const path = require("path")

module.exports = {
    mode: "development",
    entry: {
        admin: "./src/admin/index.js",
        frontend: "./src/frontend/index.js",
    },
    output: {
        path: path.resolve(__dirname, "assets/dist"),
        filename: "js/[name].js",
        clean: false, // Don't clean in development for speed
    },
    // Aggressive optimizations for development speed
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
    },
    // Filesystem cache for super fast rebuilds
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
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
                        cacheDirectory: true,
                        cacheCompression: false, // Faster cache writes
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // Inject CSS into DOM for faster builds
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
        // Speed up module resolution
        modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
    },
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        jquery: "jQuery",
    },
    // Fast source maps for development
    devtool: "eval-cheap-module-source-map",

    // Watch options for faster rebuilds
    watchOptions: {
        aggregateTimeout: 200,
        poll: false,
        ignored: /node_modules/,
    },
}
