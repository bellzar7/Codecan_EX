import type React from "react";

interface UserInfoProps {
  label: string;
  user: any;
}

const UserInfo: React.FC<UserInfoProps> = ({ label, user }) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        alt={user.firstName}
        className="h-10 w-10 rounded-full"
        src={user.avatar || "/img/avatars/placeholder.webp"}
      />
      <div className="flex flex-col items-start">
        <h2 className="font-medium text-lg text-muted">{label}</h2>
        <span className="font-medium text-muted-900 dark:text-white">
          @{user.firstName}
        </span>
      </div>
    </div>
  );
};

export default UserInfo;
