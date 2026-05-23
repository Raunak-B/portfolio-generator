import type { Metadata } from "next";
import { NotFoundPortfolio } from "@/components/portfolio/not-found-portfolio";
import { ResumePortfolioView } from "@/components/portfolio/resume-portfolio-view";
import { getPublishedPortfolioByUsername } from "@/lib/portfolio/queries";

type PortfolioPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPublishedPortfolioByUsername(username);

  if (!portfolio) {
    return { title: "Portfolio not found" };
  }

  return {
    title: `${portfolio.hero_title ?? portfolio.username} | Portfolio`,
    description: portfolio.bio ?? `Professional portfolio for ${portfolio.username}`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: PortfolioPageProps) {
  const { username } = await params;
  const portfolio = await getPublishedPortfolioByUsername(username);

  if (!portfolio) {
    return <NotFoundPortfolio username={username} />;
  }

  return <ResumePortfolioView portfolio={portfolio} />;
}
