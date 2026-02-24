// components/UserProfileInfo.js

import { MashImage } from "@/components/elements/MashImage";

const UserProfileInfo = ({ field, data, size = "md" }) => {
  let avatarSize = 64;
  switch (size) {
    case "xs":
      avatarSize = 24;
      break;
    case "sm":
      avatarSize = 32;
      break;
    case "md":
      avatarSize = 64;
      break;
    case "lg":
      avatarSize = 128;
      break;
    default:
      avatarSize = 64;
  }
  return (
    <div className="flex items-center gap-3">
      {field.avatar && (
        <MashImage
          alt="Avatar"
          className="rounded-full"
          height={avatarSize}
          src={data.avatar || "/img/avatars/placeholder.webp"}
          width={avatarSize}
        />
      )}
      <div className="font-sans">
        <span className="block font-medium text-muted-800 text-sm dark:text-muted-100">
          {data.firstName} {data.lastName}
        </span>
        <span className="block text-muted-400 text-xs">{data.id}</span>
      </div>
    </div>
  );
};

export default UserProfileInfo;
