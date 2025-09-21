export const cognitoConfig = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
  ClientId: process.env.COGNITO_APP_CLIENT_ID as string,
  ClientSecret: process.env.COGNITO_APP_CLIENT_SECRET as string,
  region: process.env.AWS_REGION || "us-east-1",
};
