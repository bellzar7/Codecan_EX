import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { useDashboardStore } from "@/stores/dashboard";
import { useEcommerceStore } from "@/stores/user/ecommerce";

const ProductReviewBase = ({}) => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const { product, reviewProduct } = useEcommerceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const submitReview = async () => {
    setIsSubmitting(true);
    if (product) {
      const status = await reviewProduct(product.id, reviewRating, comment);
      if (status) {
        setReviewRating(0);
        setHoverRating(0);
        setComment("");
      }
    }
    setIsSubmitting(false);
  };
  const userReviewed = product?.ecommerceReviews?.find(
    (review) => review.user?.id === profile?.id
  );
  return (
    <div className="flex flex-col gap-5">
      {product?.ecommerceReviews && product?.ecommerceReviews.length > 0 ? (
        product?.ecommerceReviews.map((review) => (
          <Card
            className="flex flex-col gap-2 p-4"
            color="contrast"
            key={review.id}
          >
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-md text-muted-800 dark:text-muted-200">
                <Avatar
                  alt={review.user?.firstName}
                  size="sm"
                  src={review.user?.avatar || "/img/avatars/placeholder.webp"}
                />
                <div>
                  <span>
                    {review.user?.firstName} {review.user?.lastName}
                  </span>
                  <p className="text-muted-500 text-sm dark:text-muted-400">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                </div>
              </h4>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon
                    className={`h-4 w-4 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    icon={
                      i < review.rating
                        ? "uim:star"
                        : i === review.rating && review.rating % 1 >= 0.5
                          ? "uim:star-half-alt"
                          : "uim:star"
                    }
                    key={i}
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-500 dark:text-muted-400">
              {review.comment}
            </p>
          </Card>
        ))
      ) : (
        <p className="text-muted-500 dark:text-muted-400">
          {t("No reviews yet.")}
        </p>
      )}
      <Card className="space-y-2 p-5" color="contrast">
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Icon
              className={`h-5 w-5 ${
                i < (hoverRating || reviewRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              icon="uim:star"
              key={i}
              onClick={() => setReviewRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onMouseOver={() => setHoverRating(i + 1)}
            />
          ))}
        </div>
        <div className="space-y-5">
          <Textarea
            disabled={isSubmitting}
            label={t("Message")}
            loading={isSubmitting}
            name="comment"
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("Write your message...")}
            value={comment}
          />
          <Button
            className="w-full"
            color="primary"
            disabled={isSubmitting || !comment || !reviewRating}
            loading={isSubmitting}
            onClick={() => submitReview()}
            type="button"
          >
            {userReviewed ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
export const ProductReview = memo(ProductReviewBase);
