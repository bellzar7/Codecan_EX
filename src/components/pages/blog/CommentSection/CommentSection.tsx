import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Textarea from "@/components/elements/form/textarea/Textarea";
import $fetch from "@/utils/api";

const CommentSectionBase = ({
  comments: initialComments,
  postId,
  fetchData,
}) => {
  const { t } = useTranslation();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // Number of comments per page
  const [totalCount, setTotalCount] = useState(initialComments.length);

  useEffect(() => {
    setComments(initialComments?.slice(0, pageSize));
    setTotalCount(initialComments.length);
  }, [initialComments, pageSize]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { data, error } = await $fetch({
      url: `/api/content/comment/${postId}`,
      method: "POST",
      body: { content: newComment },
      silent: true,
    });
    if (!error && data) {
      fetchData();
      setNewComment("");
    } else {
      console.error("Failed to post the comment:", error);
    }
  };

  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setComments(initialComments?.slice(start, end));
    setCurrentPage(page);
  };

  return (
    <div className="comment-section mt-20">
      <div className="relative mt-10 mb-5">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {t("Comments")}
          </span>
        </span>
      </div>

      {/* List of comments */}
      {comments.map((comment) => (
        <Card className="mt-4 p-5" key={comment.id}>
          <div className="flex items-start gap-4">
            <Avatar
              alt={comment.user?.name || "User Avatar"}
              size="sm"
              src={comment.user?.avatar || "/img/avatars/placeholder.webp"}
            />
            <div className="flex flex-col pt-1">
              <p className="font-semibold text-muted-800 text-sm dark:text-muted-200">
                {comment.user?.firstName} {comment.user?.lastName}
              </p>
              <p className="text-muted-600 text-xs dark:text-muted-400">
                {comment.content} |{" "}
                {format(
                  new Date(comment.createdAt || new Date()),
                  "MMM dd, yyyy h:mm a"
                )}
              </p>
            </div>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      </div>

      {/* Comment input */}
      <Card className="mt-8 flex flex-col gap-3 p-5">
        <Textarea
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t("Write your comment here...")}
          value={newComment}
        />
        <Button
          animated={false}
          color={"primary"}
          onClick={handleCommentSubmit}
          variant={"solid"}
        >
          {t("Submit")}
        </Button>
      </Card>
    </div>
  );
};

export const CommentSection = memo(CommentSectionBase);
