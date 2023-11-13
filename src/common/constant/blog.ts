import { BlogItemProps } from "../types/blog";

export const BLOG_ITEMS: BlogItemProps[] = [
  {
    type_of: "post",
    id: 1,
    title: "Title 1",
    description: "Description 1",
    published: true,
    published_at: "2022-01-01",
    slug: "title-1",
    path: "title-1",
    url: "https://example.com",
    comments_count: 10,
    public_reactions_count: 10,
    page_views_count: 10,
    published_timestamp: "2022-01-01",
    body_markdown: "Body 1",
    positive_reactions_count: 10,
    cover_image: "/images/placeholder.png",
    tag_list: ["tag 1", "tag 2"],
    canonical_url: "https://example.com",
    reading_time_minutes: 10,
    user: {
      name: "John Doe",
      username: "johndoe",
      twitter_username: "johndoe",
      github_username: "johndoe",
      user_id: 1,
      website_url: "https://example.com",
      profile_image: "/images/placeholder.png",
      profile_image_90: "/images/placeholder.png",
    },
    db_views_count: 100,
    total_views_count: 100,
  },
  {
    type_of: "post",
    id: 2,
    title: "Title 2",
    description: "Description 2",
    published: true,
    published_at: "2022-01-01",
    slug: "title-2",
    path: "title-2",
    url: "https://example.com",
    comments_count: 10,
    public_reactions_count: 10,
    page_views_count: 10,
    published_timestamp: "2022-01-01",
    body_markdown: "## Body 2",
    positive_reactions_count: 10,
    cover_image: "/images/placeholder.png",
    tag_list: ["tag 1", "tag 2"],
    canonical_url: "https://example.com",
    reading_time_minutes: 10,
    user: {
      name: "John Doe",
      username: "johndoe",
      twitter_username: "johndoe",
      github_username: "johndoe",
      user_id: 1,
      website_url: "https://example.com",
      profile_image: "/images/placeholder.png",
      profile_image_90: "/images/placeholder.png",
    },
    db_views_count: 100,
    total_views_count: 100,
  },
];