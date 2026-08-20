import type { MetadataRoute } from "next";

// Private instance: nothing here is meant to be indexed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
