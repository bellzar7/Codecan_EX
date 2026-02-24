const ProfileImage = ({ avatar }) => (
  <div className="absolute -bottom-16 left-6 h-32 w-32 overflow-hidden rounded-lg border-4 border-white shadow-lg md:left-12 dark:border-gray-800">
    <img
      alt="Profile"
      className="h-full w-full object-cover"
      src={avatar || "/img/avatars/placeholder.webp"}
    />
  </div>
);

export default ProfileImage;
