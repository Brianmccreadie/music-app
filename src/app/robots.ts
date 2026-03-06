import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/routines/"],
    },
    sitemap: "https://vocalreps.com/sitemap.xml",
  };
}
