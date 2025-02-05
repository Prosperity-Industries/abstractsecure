import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
    filename: 'bundle.js',
    clean: true, // Clears old files in dist/ but keeps generated index.html
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // Define the `@` alias correctly
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // Ensure Webpack checks for these file types
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // ✅ Tell Webpack to process TypeScript files
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(js|jsx)$/, // ✅ Process JavaScript with Babel
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.css$/i, // ✅ Process CSS files
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Uses your existing index.html
      filename: 'index.html', // Outputs to dist/
      inject: 'body', // Ensures <script> is placed at the end of <body>
    }),
  ],
  externals: {
    'fs': 'commonjs fs',
    'googleapis': 'commonjs googleapis' // Prevent Webpack from bundling Node.js modules
  },
  devServer: {
    static: './dist',  // Serve the `dist` folder
    port: 8080,        // Change this if needed
    open: true,        // Automatically open browser
    hot: true,         // Enable Hot Module Replacement
  },
  mode: 'production',
};
