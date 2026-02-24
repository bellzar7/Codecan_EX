import { Icon } from "@iconify/react";

const Rating = ({ rating }) => {
  // Calculate the number of full and half stars needed
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  // Generate the stars for the rating
  const stars: JSX.Element[] = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Icon
        className="h-4 w-4 text-yellow-400"
        icon="uim:star"
        key={`full-${i}`}
      />
    );
  }
  if (halfStar) {
    stars.push(
      <Icon
        className="h-4 w-4 text-yellow-400"
        icon="uim:star-half-alt"
        key="half"
      />
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Icon
        className="h-4 w-4 text-muted-300 dark:text-muted-700"
        icon="uim:star"
        key={`empty-${i}`}
      />
    );
  }

  return <div className="flex items-center">{stars}</div>;
};

export default Rating;
