import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = {
  externalsType: "module",
  mode: "production",
  experiments: {
    outputModule: true,
  },
  output: {
    filename: "index.mjs",
    path: path.resolve(__dirname, "../../../netlify/functions/getCart"),
    library: {
      type: "module",
    },
  },
  externals: [
    "@aws-sdk/client-cognito-identity",
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/client-iam",
    "@aws-sdk/credential-provider-cognito-identity",
    "@aws-sdk/lib-dynamodb",
  ],
};

export default config;
