import type { Metadata } from "next";
import { NotFoundPortfolio } from "@/components/portfolio/not-found-portfolio";
import { PublicPortfolioView } from "@/components/portfolio/public-portfolio";
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
    return {
      title: "Portfolio not found",
    };
  }

  const displayName =
    portfolio.user.display_name ?? portfolio.user.github_username;

  return {
    title: `${displayName} | Developer Portfolio`,
    description:
      portfolio.custom_bio ??
      portfolio.github_bio ??
      `${displayName}'s developer portfolio`,
    openGraph: {
      title: `${displayName} — Portfolio`,
      description:
        portfolio.custom_bio ??
        portfolio.github_bio ??
        "Developer portfolio powered by GitHub",
    },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;
  const portfolio = await getPublishedPortfolioByUsername(username);

  if (!portfolio) {
    return <NotFoundPortfolio username={username} />;
  }

  return <PublicPortfolioView portfolio={portfolio} />;
}
