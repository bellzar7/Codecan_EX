// src/pages/terms.tsx
import fs from "fs";
import type { GetStaticProps } from "next";
import path from "path";
import type React from "react";
import FooterSection from "@/components/pages/frontend/Footer";
import Layout from "@/layouts/Nav";

interface TermsPageProps {
  content: string;
}

export const getStaticProps: GetStaticProps<TermsPageProps> = async () => {
  const filePath = path.join(process.cwd(), "template", "terms.html");
  const fileContents = fs.readFileSync(filePath, "utf8");

  return {
    props: {
      content: fileContents,
    },
  };
};

const TermsPage: React.FC<TermsPageProps> = ({ content }) => {
  return (
    <Layout color="muted" horizontal>
      <div className="prose prose-lg dark:prose-dark mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <FooterSection />
    </Layout>
  );
};

export default TermsPage;
