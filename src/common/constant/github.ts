export const GITHUB_ACCOUNTS = [
  {
    username: 'holymaiden',
    token: process.env.GITHUB_READ_USER_TOKEN_PERSONAL,
    endpoint: `/api/github?type=personal`,
    type: 'personal',
    is_active: true,
  },
];
