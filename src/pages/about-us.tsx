// src/pages/aboutus.tsx
import fs from "fs";
import type { GetStaticProps } from "next";
import path from "path";
import type React from "react";
import FooterSection from "@/components/pages/frontend/Footer";
import Layout from "@/layouts/Nav";

interface AboutUsPageProps {
  content: string;
}

export const getStaticProps: GetStaticProps<AboutUsPageProps> = async () => {
  const filePath = path.join(process.cwd(), "template", "about-us.html");
  const fileContents = fs.readFileSync(filePath, "utf8");

  return {
    props: {
      content: fileContents,
    },
  };
};

const AboutUsPage: React.FC<AboutUsPageProps> = ({ content }) => {
  return (
    <Layout color="muted" horizontal>
      <div className="prose prose-lg dark:prose-dark mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <FooterSection />
    </Layout>
  );
};

export default AboutUsPage;
