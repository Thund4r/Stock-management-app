import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";

const IDENTITY_POOL_ID = "us-east-1:56df3a77-0207-4112-be52-7e2171af2650"; // An Amazon Cognito Identity Pool ID. should use environment variables

// Create an Amazon DynamoDB client service object that initializes the Amazon Cognito credentials provider.
const ddbClient = new DynamoDBClient({
  credentials: fromCognitoIdentityPool({
    // The empty parameters in the CognitoIdentityClient constructor assume
    // a region is configured in your shared configuration file.
    client: new CognitoIdentityClient(),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});
export { ddbClient };