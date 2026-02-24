import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { ErrorPage } from "@/components/ui/Errors";
import { HeroParallax } from "@/components/ui/HeroParallax";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import { $serverFetch } from "@/utils/api";

interface Project {
  id: string;
  name: string;
  description: string;
  website: string;
  whitepaper: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

interface Props {
  projects?: Project[];
  error?: string;
}

const TokenInitialOfferingDashboard: React.FC<Props> = ({
  projects = [],
  error,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <ErrorPage
        description={t(error)}
        link="/"
        linkTitle={t("Go Back")}
        title={t("Error")}
      />
    );
  }

  return (
    <Layout color="muted" title={t("ICO Projects")}>
      {projects.length > 7 ? (
        <HeroParallax
          description={
            <>
              {t(
                "Discover the most popular projects in the crypto space, and invest in the future."
              )}
              <br />
              <ButtonLink
                animated={false}
                className="mt-5"
                href="/user/ico/contribution"
                type="button"
              >
                {t("View Your Contributions")}
                <Icon className="ml-2 h-5 w-5" icon="mdi:chevron-right" />
              </ButtonLink>
            </>
          }
          items={projects.map((project) => ({
            title: project.name,
            link: `/ico/project/${project.id}`,
            thumbnail: project.image,
          }))}
          title={
            <>
              <span className="text-primary-500">
                {t("Initial Coin Offering")}
              </span>
              <br />
              {t("Popular Projects")}
            </>
          }
        />
      ) : (
        <div className="mb-5">
          <HeaderCardImage
            description="Invest in the future of blockchain technology and be part of the next big thing."
            lottie={{
              category: "cryptocurrency-2",
              path: "payout",
              height: 200,
            }}
            size="lg"
            title={t("Discover the most popular projects in the crypto space")}
          />
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <h2 className="text-2xl">
          <span className="text-primary-500">{t("Popular")} </span>
          <span className="text-muted-800 dark:text-muted-200">
            {t("Projects")}
          </span>
        </h2>

        <div className="w-full text-end sm:max-w-xs">
          <Input
            icon={"mdi:magnify"}
            onChange={handleSearchChange}
            placeholder={t("Search Projects")}
            type="text"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="relative my-5">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {searchTerm ? `Matching "${searchTerm}"` : "All ICO Projects"}
          </span>
        </span>
      </div>
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProjects.map((project) => (
            <Link href={`/ico/project/${project.id}`} key={project.id}>
              <Card className="group relative col-span-1 h-full w-full cursor-pointer p-3 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400">
                <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                  <MashImage
                    alt={project.name}
                    className="h-full w-full rounded-md bg-muted-100 object-cover dark:bg-muted-900"
                    fill
                    src={project.image}
                  />
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-lg text-primary-500 dark:text-primary-400">
                    {project.name}
                  </h3>
                  <div className="flex flex-col gap-1 text-xs">
                    <p className="text-muted-500 dark:text-muted-400">
                      {project.description.length > 150
                        ? project.description.slice(0, 150) + "..."
                        : project.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-5 py-12">
          <h2 className="text-lg text-muted-800 dark:text-muted-200">
            {t("No Projects Found")}
          </h2>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {t("We couldn't find any of the projects you are looking for.")}
          </p>
        </div>
      )}

      <Faq category="ICO" />
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const { data, error } = await $serverFetch(context, {
      url: "/api/ext/ico/project",
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch ICO projects.",
        },
      };
    }

    return {
      props: {
        projects: data,
      },
    };
  } catch (error) {
    console.error("Error fetching ICO projects:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default TokenInitialOfferingDashboard;
