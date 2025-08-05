import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Metadata } from "next";
import { WithContext, Article, Graph } from "schema-dts";
import { siteConfig } from "@/config/site";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const metaTitleConfig = {
  template: "{title}{separator}{siteTagline}",
  //  template: "{title}{separator}{siteTagline}{separator}{siteName}",
  template_short: "{title}",
  //  template_short: "{title}{separator}{siteName}",
  separator: " | ",
};

export function constructMetaTitle(
  title: string,
  siteName: string,
  siteTagline: string,
) {
  const { template, separator, template_short } = metaTitleConfig;

  let metaTitle = template
    .replace(/{title}/g, title)
    .replace(/{separator}/g, separator)
    .replace(/{siteTagline}/g, siteTagline)
    .replace(/{siteName}/g, siteName);

  // Check if length exceeds 60 characters
  if (metaTitle.length > 60) {
    metaTitle = template_short
      .replace(/{title}/g, title)
      .replace(/{separator}/g, separator)
      .replace(/{siteName}/g, siteName);
  }
  return metaTitle;
}
export function constructMetaOpenGraph(
  url: string,
  title: string,
  description: string,
  siteName: string,
) {
  return {
    type: "website",
    locale: "en_US",
    url: url,
    title,
    description,
    siteName,
  };
}
export function constructMetaTwitter() {}
export function constructMetaAuthor() {}
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon/favicon.ico",
  noIndex = false,

  other = {},
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  path?: string; // Add path type

  other?: {
    [name: string]: string | number | (string | number)[];
  };
} = {}): Metadata {
  return {
    title: constructMetaTitle(title, siteConfig.name, siteConfig.siteTagline),
    description,
    alternates: {
      canonical: "./",
    },
    openGraph: {
      ...constructMetaOpenGraph(
        siteConfig.url,
        constructMetaTitle(title, siteConfig.name, siteConfig.siteTagline),
        description,
        siteConfig.name,
      ),
      url: "./", // Update OpenGraph URL to canonical URL
    },
    twitter: {
      card: "summary_large_image",
      title: constructMetaTitle(title, siteConfig.name, siteConfig.siteTagline),
      description,
      images: [image],
      creator: "@cedar-it-team",
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    manifest: `${siteConfig.url}/manifest.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...other,
  };
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


