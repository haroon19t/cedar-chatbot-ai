const site_url = process.env.NEXT_PUBLIC_APP_URL || "https://cedar-chatbot-ai";

export const siteConfig  = {
  name: "Cedar ChatBot AI",
  siteTagline: "Empowering Cedar Financial employees with instant, reliable policy guidance.",
  description:
    "Cedar Bot is your go-to assistant for HR, compliance, and IT-related inquiries at Cedar Financial. Get clear, accurate, and empathetic answers based on official company policies—anytime, anywhere.",
  url: site_url,
  ogImage: `${site_url}/og.png`,
  logo: `${site_url}/logo.png`,
};
