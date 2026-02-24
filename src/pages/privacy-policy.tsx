// src/pages/privacy.tsx
import fs from "fs";
import type { GetStaticProps } from "next";
import path from "path";
import type React from "react";
import FooterSection from "@/components/pages/frontend/Footer";
import Layout from "@/layouts/Nav";

interface PrivacyPageProps {
  content: string;
}

export const getStaticProps: GetStaticProps<PrivacyPageProps> = async () => {
  const filePath = path.join(process.cwd(), "template", "privacy.html");
  const fileContents = fs.readFileSync(filePath, "utf8");

  return {
    props: {
      content: fileContents,
    },
  };
};

const PrivacyPage: React.FC<PrivacyPageProps> = ({ content }) => {
  return (
    <Layout color="muted" horizontal>
      <div className="prose prose-lg dark:prose-dark mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <FooterSection />
    </Layout>
  );
};

export default PrivacyPage;
