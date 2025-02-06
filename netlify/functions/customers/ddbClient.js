import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";

const IDENTITY_POOL_ID = "us-east-1:598b283e-465f-4ada-8c4d-da6b9c211ee6"; // An Amazon Cognito Identity Pool ID. should use environment variables
const REGION = "us-east-1";
// Create an Amazon DynamoDB client service object that initializes the Amazon Cognito credentials provider.
const ddbClient = new DynamoDBClient({
  credentials: fromCognitoIdentityPool({
    // The empty parameters in the CognitoIdentityClient constructor assume
    // a region is configured in your shared configuration file.
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
  region: REGION,
});
export { ddbClient };