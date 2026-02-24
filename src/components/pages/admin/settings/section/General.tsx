import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import renderField from "../RenderField";

const generalFields = [
  {
    name: "frontendType",
    label: "Frontend Type",
    placeholder: "Select frontend type",
    description: "Choose the frontend type for your application.",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Builder", value: "builder" },
    ],
  },
  {
    name: "layoutSwitcher",
    label: "Layout Switcher",
    placeholder: "Enable or disable",
    description: "Toggle between different layouts.",
    type: "switch",
  },
  {
    name: "themeSwitcher",
    label: "Theme Switcher",
    placeholder: "Enable or disable",
    description: "Show or hide the theme switcher on the dashboard.",
    type: "switch",
  },
  {
    name: "floatingLiveChat",
    label: "Floating Live Chat",
    placeholder: "Enable or disable",
    description: "Enable floating live chat for client support.",
    type: "switch",
  },
  {
    name: "newsStatus",
    label: "Enable News Section",
    placeholder: "Enable or disable",
    description: "Toggle the news section visibility on your application.",
    type: "switch",
  },
];

const blogFields = [
  {
    name: "blogPostLayout",
    label: "Blog Post Layout",
    placeholder: "Select blog post layout",
    description: "Choose the layout for displaying blog posts.",
    type: "select",
    options: [
      { label: "Default", value: "DEFAULT" },
      { label: "Animated Trail", value: "ANIMATED_LAPTOP" },
      { label: "Table of Contents", value: "TABLE_OF_CONTENTS" },
    ],
    preview: {
      light: {
        DEFAULT: "/img/preview/blog/layout/default.webp",
        ANIMATED_LAPTOP: "/img/preview/blog/layout/trail.webp",
        TABLE_OF_CONTENTS: "/img/preview/blog/layout/toc.webp",
      },
      dark: {
        DEFAULT: "/img/preview/blog/layout/default-dark.webp",
        ANIMATED_LAPTOP: "/img/preview/blog/layout/trail-dark.webp",
        TABLE_OF_CONTENTS: "/img/preview/blog/layout/toc-dark.webp",
      },
    },
  },
];

const googleTranslateFields = [
  {
    name: "googleTranslateStatus",
    label: "Enable Google Translate",
    placeholder: "Enable or disable",
    description: "Toggle Google Translate for your application.",
    type: "switch",
  },
  {
    name: "googleTargetLanguage",
    label: "Google Target Language",
    placeholder: "Select target language",
    description: "Choose the target language for Google Translate.",
    type: "select",
    options: [
      { label: "Afrikaans", value: "af" },
      { label: "Albanian", value: "sq" },
      { label: "Amharic", value: "am" },
      { label: "Arabic", value: "ar" },
      { label: "Armenian", value: "hy" },
      { label: "Assamese", value: "as" },
      { label: "Azerbaijani", value: "az" },
      { label: "Bangla", value: "bn" },
      { label: "Bosnian", value: "bs" },
      { label: "Bulgarian", value: "bg" },
      { label: "Cantonese", value: "yue" },
      { label: "Catalan", value: "ca" },
      { label: "Croatian", value: "hr" },
      { label: "Czech", value: "cs" },
      { label: "Danish", value: "da" },
      { label: "Divehi", value: "dv" },
      { label: "Dutch", value: "nl" },
      { label: "English", value: "en" },
      { label: "Estonian", value: "et" },
      { label: "Fijian", value: "fj" },
      { label: "Filipino", value: "fil" },
      { label: "Finnish", value: "fi" },
      { label: "French", value: "fr" },
      { label: "Galician", value: "gl" },
      { label: "Georgian", value: "ka" },
      { label: "German", value: "de" },
      { label: "Greek", value: "el" },
      { label: "Gujarati", value: "gu" },
      { label: "Haitian Creole", value: "ht" },
      { label: "Hausa", value: "ha" },
      { label: "Hebrew", value: "he" },
      { label: "Hindi", value: "hi" },
      { label: "Hungarian", value: "hu" },
      { label: "Icelandic", value: "is" },
      { label: "Indonesian", value: "id" },
      { label: "Irish", value: "ga" },
      { label: "Italian", value: "it" },
      { label: "Japanese", value: "ja" },
      { label: "Kannada", value: "kn" },
      { label: "Kazakh", value: "kk" },
      { label: "Khmer", value: "km" },
      { label: "Korean", value: "ko" },
      { label: "Kurdish", value: "ku" },
      { label: "Kyrgyz", value: "ky" },
      { label: "Lao", value: "lo" },
      { label: "Latvian", value: "lv" },
      { label: "Lithuanian", value: "lt" },
      { label: "Luxembourgish", value: "lb" },
      { label: "Macedonian", value: "mk" },
      { label: "Malagasy", value: "mg" },
      { label: "Malay", value: "ms" },
      { label: "Malayalam", value: "ml" },
      { label: "Maltese", value: "mt" },
      { label: "Maori", value: "mi" },
      { label: "Marathi", value: "mr" },
      { label: "Mongolian", value: "mn" },
      { label: "Nepali", value: "ne" },
      { label: "Norwegian", value: "no" },
      { label: "Odia", value: "or" },
      { label: "Pashto", value: "ps" },
      { label: "Persian", value: "fa" },
      { label: "Polish", value: "pl" },
      { label: "Portuguese", value: "pt" },
      { label: "Punjabi", value: "pa" },
      { label: "Romanian", value: "ro" },
      { label: "Russian", value: "ru" },
      { label: "Samoan", value: "sm" },
      { label: "Serbian", value: "sr" },
      { label: "Sesotho", value: "st" },
      { label: "Sindhi", value: "sd" },
      { label: "Sinhala", value: "si" },
      { label: "Slovak", value: "sk" },
      { label: "Slovenian", value: "sl" },
      { label: "Somali", value: "so" },
      { label: "Spanish", value: "es" },
      { label: "Sundanese", value: "su" },
      { label: "Swahili", value: "sw" },
      { label: "Swedish", value: "sv" },
      { label: "Tajik", value: "tg" },
      { label: "Tamil", value: "ta" },
      { label: "Tatar", value: "tt" },
      { label: "Telugu", value: "te" },
      { label: "Thai", value: "th" },
      { label: "Turkish", value: "tr" },
      { label: "Turkmen", value: "tk" },
      { label: "Ukrainian", value: "uk" },
      { label: "Urdu", value: "ur" },
      { label: "Uyghur", value: "ug" },
      { label: "Uzbek", value: "uz" },
      { label: "Vietnamese", value: "vi" },
      { label: "Welsh", value: "cy" },
      { label: "Xhosa", value: "xh" },
      { label: "Yiddish", value: "yi" },
      { label: "Yoruba", value: "yo" },
      { label: "Zulu", value: "zu" },
    ],
  },
];

const Section = ({
  title,
  description,
  fields,
  formData,
  handleInputChange,
  handleCancel,
  handleSave,
  hasChanges,
  isLoading,
  border,
  showChanges,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`mt-4 grid w-full grid-cols-12 gap-6 ${
        border ? "border-muted-200 border-b pb-5 dark:border-muted-800" : ""
      }`}
    >
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t(title)}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">{t(description)}</p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
          {fields.map((field) =>
            renderField({ field, formData, handleInputChange })
          )}
          {showChanges && hasChanges && (
            <div className="col-span-12 flex justify-end space-x-4">
              <Button color="default" onClick={handleCancel}>
                {t("Cancel")}
              </Button>
              <Button color="primary" loading={isLoading} onClick={handleSave}>
                {t("Save Changes")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings = (props) => {
  return (
    <>
      <Section
        border
        description="Manage general system settings and configurations."
        fields={generalFields}
        title="General Settings"
        {...props}
      />
      <Section
        border
        description="Customize the layout and display of blog posts."
        fields={blogFields}
        title="Blog Settings"
        {...props}
      />
      <Section
        description="Configure Google Translate settings for your application."
        fields={googleTranslateFields}
        showChanges
        title="Google Translate Settings"
        {...props}
      />
    </>
  );
};

export default Settings;
