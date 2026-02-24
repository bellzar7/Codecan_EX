import { Icon } from "@iconify/react";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";

const SocialShareButtons = ({ url }: { url: string }) => {
  return (
    <div className="flex gap-3">
      {/* Facebook */}
      <FacebookShareButton url={url}>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 transition duration-200 hover:bg-blue-700">
          <Icon
            className="h-5 w-5 text-white"
            icon={"akar-icons:facebook-fill"}
          />
        </div>
      </FacebookShareButton>

      {/* Twitter */}
      <TwitterShareButton url={url}>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-400 transition duration-200 hover:bg-blue-500">
          <Icon
            className="h-5 w-5 text-white"
            icon={"akar-icons:twitter-fill"}
          />
        </div>
      </TwitterShareButton>

      {/* LinkedIn */}
      <LinkedinShareButton url={url}>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-700 transition duration-200 hover:bg-blue-800">
          <Icon
            className="h-5 w-5 text-white"
            icon={"akar-icons:linkedin-fill"}
          />
        </div>
      </LinkedinShareButton>

      {/* WhatsApp */}
      <WhatsappShareButton url={url}>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-400 transition duration-200 hover:bg-green-500">
          <Icon
            className="h-5 w-5 text-white"
            icon={"akar-icons:whatsapp-fill"}
          />
        </div>
      </WhatsappShareButton>

      {/* Email */}
      <a
        href={`mailto:?subject=Check out this post&body=${url}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition duration-200 hover:bg-gray-900">
          <Icon className="h-5 w-5 text-white" icon={"mdi:email"} />
        </div>
      </a>
    </div>
  );
};

export default SocialShareButtons;
