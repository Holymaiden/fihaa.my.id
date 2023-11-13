import { BlogItemProps } from "../types/blog";

export const BLOG_ITEMS: BlogItemProps[] = [
  {
    id: 1,
    date: "2024-01-01",
    modified: "2023-01-01",
    slug: "title-1",
    status: "publish",
    link:
      process.env.NODE_ENV === "production"
        ? "https://fihaa.my.id"
        : "http://localhost:3000",
    title: {
      rendered: "Title 1",
    },
    content: {
      rendered: "## Body 1",
      markdown: "## Body 1",
      protected: false,
    },
    excerpt: {
      rendered: "## Body 1",
      protected: false,
    },
    author: 1,
    featured_media: 1,
    comment_status: "open",
    ping_status: "open",
    sticky: false,
    template: "default",
    format: "standard",
    meta: {
      footnotes: "1",
    },
    categories: [1, 2],
    tags: [1, 2],
    tags_list: [],
    amp_enabled: false,
    featured_image_url: "/images/placeholder.png",
    total_views_count: 10,
  },
  {
    id: 2,
    date: "2024-01-01",
    modified: "2024-01-01",
    slug: "title-2",
    status: "publish",
    link:
      process.env.NODE_ENV === "production"
        ? "https://fihaa.my.id"
        : "http://localhost:3000",
    title: {
      rendered: "Title 2",
    },
    content: {
      rendered: "## Body 1",
      markdown: "## Body 1",
      protected: false,
    },
    excerpt: {
      rendered: "## Body 1",
      protected: false,
    },
    author: 1,
    featured_media: 1,
    comment_status: "open",
    ping_status: "open",
    sticky: false,
    template: "default",
    format: "standard",
    meta: {
      footnotes: "1",
    },
    categories: [1, 2],
    tags: [1, 2],
    tags_list: [],
    amp_enabled: false,
    featured_image_url: "/images/placeholder.png",
    total_views_count: 10,
  },
];
