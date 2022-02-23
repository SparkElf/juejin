import { merge } from "webpack-merge";
import { common } from "./webpack.common.js";
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import pkg from 'webpack';
const { CleanPlugin } = pkg;
export default merge(common, {
  mode: "production",
  plugins: [new CleanPlugin()],
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers
      '...',
      new CssMinimizerPlugin()
    ]
  }
});
