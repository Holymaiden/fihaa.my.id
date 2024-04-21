import axios from 'axios';

import { GITHUB_ACCOUNTS } from '@/common/constant/github';
import type { GithubResponse } from '@/common/types/github';

const GITHUB_USER_ENDPOINT = 'https://api.github.com/graphql';

const GITHUB_USER_QUERY = `query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        colors
        totalContributions
        months {
          firstDay
          name
          totalWeeks
        }
        weeks {
          contributionDays {
            color
            contributionCount
            date
          }
          firstDay
        }
      }
    }
  }
}`;

export const fetchGithubData = async (
  username: string,
  token: string | undefined,
) => {
  const response: GithubResponse = await axios.post(
    GITHUB_USER_ENDPOINT,
    {
      query: GITHUB_USER_QUERY,
      variables: {
        username: username,
      },
    },
    {
      headers: {
        Authorization: `bearer ${token}`,
      },
    },
  );

  const status: number = response.status;
  const responseJson = response.data?.data;

  if (status > 400) {
    return { status, data: {} };
  }

  return { status, data: responseJson.user };
};

export const getGithubUser = async (type: string) => {
  const account = GITHUB_ACCOUNTS.find(
    (account) => account?.type === type && account?.is_active,
  );

  if (!account) {
    throw new Error('Invalid user type');
  }

  const { username, token } = account;
  return await fetchGithubData(username, token);
};
