export type GithubResponse = {
  status: number;
  data: { data: GithubContribution };
};

export type GithubContribution = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        colors: string[];
        weeks: string[];
        months: string[];
      };
    };
  };
};

export type Contribution = {
  date: string;
  contributionCount: number;
  color: string;
};

export type Month = {
  name: string;
  firstDay: string;
  totalWeeks: number;
  contributionsCount: number;
};

export type CalendarProps = {
  totalContributions?: number;
  weeks: {
    firstDay: string;
    contributionDays: Contribution[];
  }[];
  months: Month[];
  colors: string[];
};

export type CalendarResponse = {
  contributionsCollection: {
    contributionCalendar: CalendarProps;
  };
};
