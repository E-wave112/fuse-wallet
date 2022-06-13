export default () => ({
    PORT: process.env.PORT,
    API_BASE_URL: process.env.API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SECRET_KEY: process.env.SECRET_KEY,
    FLW_PUBLIC_KEY: process.env.FLW_PUBLIC_KEY,
    FLW_SECRET_KEY: process.env.FLW_SECRET_KEY,
    DB_URI: process.env.DB_URI,
    DB_TEST_URI: process.env.DB_TEST_URI,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    TEMPLATE_RESET_PIN: process.env.TEMPLATE_RESET_PIN,
    TEMPLATE_VERIFY_ACCOUNT: process.env.TEMPLATE_VERIFY_ACCOUNT,
    emailRegex:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    EXPIRES_IN: process.env.EXPIRES_IN,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    FLW_ENCRYPTION_KEY: process.env.FLW_ENCRYPTION_KEY,
    WEBHOOK_HASH: process.env.WEBHOOK_HASH,
});
