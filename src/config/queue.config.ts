// services/queue/src/config/amazonmq.config.ts
export const queueConfig = {
  username: process.env.AMAZON_MQ_USERNAME as string,
  password: process.env.AMAZON_MQ_PASSWORD as string,
  host: process.env.AMAZON_MQ_HOST as string,
  port: process.env.AMAZON_MQ_PORT as string,
  virtualHost: process.env.AMAZON_MQ_VIRTUAL_HOST || "/",
  queues: {
    userSignup: "user-signup-queue",
    userLogin: "user-login-queue",
    resendConfirmationCode: "resend-confirmation-code-queue",
    confirmAccount: "confirm-account-queue",
    passwordRecovery: "password-recovery-queue",
  },
};
