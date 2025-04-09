// app.config.js
export default ({ config }) => ({
    ...config,
    extra: {
      apiUrl: process.env.API_URL,
    },
  });
  