import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
    },
    sitemap: "https://fihaa.my.id/sitemap.xml",
    host: "https://fihaa.my.id",
  };
}
