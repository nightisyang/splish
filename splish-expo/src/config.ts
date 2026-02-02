// App configuration
export const config = {
  API_URL: 'chinup.rocks:8080',
  APP_VERSION: '2.0.0',
} as const;

export const getApiUrl = (path: string) => `http://${config.API_URL}${path}`;
export const getImageUrl = (filename: string) => `http://${config.API_URL}/images/${filename}`;
