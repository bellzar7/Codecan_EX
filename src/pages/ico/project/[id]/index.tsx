"use client";
import { differenceInSeconds, parseISO } from "date-fns";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import { BackButton } from "@/components/elements/base/button/BackButton";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import Progress from "@/components/elements/base/progress/Progress";
import Input from "@/components/elements/form/input/Input";
import { ErrorPage } from "@/components/ui/Errors";
import Layout from "@/layouts/Default";
import { $serverFetch } from "@/utils/api";
import { formatLargeNumber } from "@/utils/market";

type Token = {
  id: string;
  projectId: string;
  name: string;
  chain: string;
  currency: string;
  purchaseCurrency: string;
  purchaseWalletType: string;
  address: string;
  totalSupply: number;
  description: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  icoAllocation: {
    id: string;
    name: string;
    percentage: number;
    tokenId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  phases: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
    tokenId: string;
    minPurchase: number;
    maxPurchase: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    icoContributions: {
      id: string;
      userId: string;
      phaseId: string;
      amount: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string;
    }[];
    contributionPercentage: number;
    totalContributions: number;
    contributionAmount: number;
  }[];
};

const calculateCountdown = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const isStarted = now >= start;
  const targetDate = isStarted ? end : start;
  let timeRemaining = differenceInSeconds(targetDate, now);
  const totalDuration = differenceInSeconds(end, start);
  if (timeRemaining < 0) {
    timeRemaining = 0;
  }
  const progress = isStarted
    ? ((totalDuration - timeRemaining) / totalDuration) * 100
    : 0;
  const days = Math.floor(timeRemaining / (60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
  const seconds = timeRemaining % 60;
  return { days, hours, minutes, seconds, isStarted, progress };
};

interface Props {
  project?: any;
  tokens?: Token[];
  error?: string;
}

const TokenInitialOfferingDashboard: React.FC<Props> = ({
  project = {},
  tokens = [],
  error,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  if (error) {
    return (
      <ErrorPage
        description={t(error)}
        link="/ico"
        linkTitle={t("Back to ICO Dashboard")}
        title={t("Error")}
      />
    );
  }

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout color="muted" title={`${capitalize(project.name)} Project`}>
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <h2 className="text-2xl">
          <span className="text-primary-500">
            {capitalize(project.name)} {t("Project")}
          </span>{" "}
          <span className="text-muted-800 dark:text-muted-200">
            {t("Offerings")}
          </span>
        </h2>

        <div className="flex w-full gap-2 text-end sm:max-w-xs">
          <Input
            icon={"mdi:magnify"}
            onChange={handleSearchChange}
            placeholder={t("Search Offerings...")}
            type="text"
            value={searchTerm}
          />
          <BackButton href={"/ico"} />
        </div>
      </div>

      <div className="relative my-5">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {searchTerm ? `Matching "${searchTerm}"` : "All Offers"}
          </span>
        </span>
      </div>
      {filteredTokens.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredTokens.map((token) => {
            const activePhase = token.phases?.find(
              (phase) => phase.status === "ACTIVE"
            );
            const countdown = activePhase
              ? calculateCountdown(activePhase.startDate, activePhase.endDate)
              : null;
            return (
              <Card
                className="flex flex-col overflow-hidden font-sans sm:mx-0 sm:w-auto sm:flex-row"
                color="contrast"
                key={token.id}
              >
                <div className="flex w-full flex-col justify-between bg-muted-200 px-8 py-6 sm:w-1/3 dark:bg-muted-800">
                  <div>
                    <p className="mb-2 text-muted-500 text-xs uppercase tracking-wider sm:mb-3 dark:text-muted-400">
                      {token.chain}
                    </p>
                    <h3 className="text-muted-800 text-xl capitalize dark:text-muted-100">
                      {token.currency}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar size="xxs" src={token.image} />
                    <div className="font-sans leading-none">
                      <p className="text-muted-800 text-sm dark:text-muted-100">
                        {token.name}
                      </p>
                      <p className="text-muted-400 text-xs">
                        {formatLargeNumber(token.totalSupply)}{" "}
                        {t("Total Supply")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="right flex w-full flex-col justify-between px-8 py-6 sm:w-2/3">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="mb-1 font-medium text-muted-500 text-xs uppercase tracking-wider sm:-mt-3 sm:mb-0 dark:text-muted-400">
                        {activePhase?.name ?? "N/A"} {t("Phase")}
                      </p>
                      <div className="w-full sm:w-64 md:w-96">
                        <Progress
                          color="success"
                          size="xs"
                          value={activePhase?.contributionPercentage ?? 0}
                        />
                        <div className="mt-1 flex w-full justify-between text-muted-500 text-xs dark:text-muted-400">
                          <p>
                            {activePhase?.totalContributions ?? 0}{" "}
                            {t("Contributions")}
                          </p>
                          <p>
                            {activePhase?.contributionAmount || 0}{" "}
                            {token.purchaseCurrency}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="mt-1 font-medium text-md text-muted-800 capitalize dark:text-muted-100">
                        {token.description.length > 100
                          ? token.description.slice(0, 100) + "..."
                          : token.description}
                      </h3>
                      <ButtonLink
                        color="primary"
                        href={`/ico/offer/${token.id}`}
                        shape="rounded-sm"
                        size="sm"
                      >
                        {t("View Offering")}
                      </ButtonLink>
                    </div>
                  </div>

                  {countdown && (
                    <div className="mt-6 w-full">
                      <Progress
                        color="primary"
                        size="xs"
                        value={countdown.progress}
                      />
                      <div className="mt-1 flex w-full justify-between text-muted-500 text-xs dark:text-muted-400">
                        <p>{countdown.isStarted ? "Ends in" : "Starts in"}</p>
                        <p>
                          {countdown.days}d {countdown.hours}h{" "}
                          {countdown.minutes}m {countdown.seconds}s
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-5 py-12">
          <h2 className="text-lg text-muted-800 dark:text-muted-200">
            {t("No Tokens Found")}
          </h2>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {t("We couldn't find any of the tokens you are looking for.")}
          </p>
        </div>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const { id } = context.params;

    const { data, error } = await $serverFetch(context, {
      url: `/api/ext/ico/project/${id}`,
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch ICO project details.",
        },
      };
    }

    const { tokens, ...project } = data;

    return {
      props: {
        project,
        tokens,
      },
    };
  } catch (error) {
    console.error("Error fetching ICO project details:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default TokenInitialOfferingDashboard;
