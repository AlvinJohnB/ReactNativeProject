// app.config.js
export default ({ config }) => ({
    ...config,
    extra: {
      apiUrl: process.env.API_URL,
      queueResetTimeOut: process.env.QUEUE_RESET_TIMEOUT,
    },
  });
  