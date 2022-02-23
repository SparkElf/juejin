import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from "path";
export const common = {
  entry: "./src/index.tsx",
  output: {
    filename: "js/[name].[contenthash:10].js",
    path: path.resolve("./build"),
    publicPath: '/'
  },
  module: {
    rules: [

      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
      {
        test: /\.tsx$/i,
        use: ["ts-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], //注意顺序
      },
      {
        test: /\.styl$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },
      {
        test: /\.(png|svg|jpe?g)$/i,
        loader: 'url-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        loader: 'file-loader'
      }
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify: {
        //移除空格
        collapseWhitespace: true,
        //移除注释
        removeComments: true
      }
    }),

    new MiniCssExtractPlugin({
      filename: 'css/main.css'
    })
  ],
};
