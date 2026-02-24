import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { type FC, useState } from "react";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import ProgressCircle from "@/components/elements/base/progress/ProgressCircle";
import Tag from "@/components/elements/base/tag/Tag";
import ToggleBox from "@/components/elements/base/toggle-box/ToggleBox";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import PlayerControls from "@/components/video/PlayerControls";

interface PlayerProps {
  course: any;
  playerRef?: any;
  playerControlsRef?: any;
}
const formatTime = (time: number) => {
  //formarting duration of video
  if (isNaN(time)) {
    return "00:00";
  }
  const date = new Date(time * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  if (hours) {
    //if video has hours
    return `${hours}:${minutes.toString().padStart(2, "0")} `;
  }
  return `${minutes}:${seconds}`;
};
let count = 0;
const CoursePlayer: FC<PlayerProps> = ({
  course,
  playerRef,
  playerControlsRef,
}) => {
  const { t } = useTranslation();
  //tabs state
  const [activeTab, setActiveTab] = useState("downloads");
  //Course state
  const [activeChapter, setActiveChapter] = useState(course.chapters[0]);
  const [activeChallenge, setActiveChallenge] = useState(
    activeChapter.challenges[0]
  );
  //State for the video player
  const [videoState, setVideoState] = useState({
    playing: false,
    muted: false,
    volume: 0.5,
    played: 0,
    seeking: false,
    Buffer: true,
  });
  //Destructuring the properties from the videoState
  const { playing, muted, volume, played, seeking } = videoState;
  //Current played time
  const currentTime = playerRef?.current
    ? playerRef?.current.getCurrentTime()
    : "00:00";
  //Video duration
  const duration = playerRef?.current
    ? playerRef?.current.getDuration()
    : "00:00";
  //Formatting the current time and duration
  const formatCurrentTime = formatTime(currentTime);
  const formatDuration = formatTime(duration);
  //Handles Pause/PLay
  function playHandler() {
    setVideoState({
      ...videoState,
      playing: !videoState.playing,
    });
  }
  //Rewinds the video player reducing 5
  function rewindHandler() {
    playerRef?.current?.seekTo(playerRef.current.getCurrentTime() - 5);
  }
  //FastFowards the video player by adding 10
  function fastFowardHandler() {
    playerRef?.current?.seekTo(playerRef.current.getCurrentTime() + 10);
  }
  //Handles progress of the video player
  function progressHandler(state: any) {
    if (count > 2) {
      // toggling player control container
      playerControlsRef.current.style.visibility = "hidden";
    } else if (playerControlsRef.current.style.visibility === "visible") {
      count += 1;
    }
    if (!seeking) {
      setVideoState({ ...videoState, ...state });
    }
  }
  //Handles seeking
  function seekHandler(value: any) {
    setVideoState({ ...videoState, played: value / 100 });
    playerRef?.current?.seekTo(value / 100);
  }
  //Handles volume change
  function volumeChangeHandler(value: string) {
    const newVolume = Number.parseFloat(value) / 100;
    setVideoState({
      ...videoState,
      volume: newVolume,
      muted: Number(newVolume) === 0 ? true : false, // volume === 0 then muted
    });
  }
  //Mutes the video player
  function muteHandler() {
    setVideoState({ ...videoState, muted: !videoState.muted });
  }
  //Handles overlay visibility
  function mouseMoveHandler() {
    playerControlsRef.current.style.visibility = "visible";
    count = 0;
  }
  //Enables fullscreen
  const fullscreenHandler = () => {
    if (screenfull.isEnabled) {
      screenfull.request(playerRef.current.wrapper);
    }
  };
  //Find active chapter index
  const activeChapterIndex = course.chapters.findIndex(
    (chapter: any) => chapter.id === activeChapter.id
  );
  //Find active challenge index in chapter
  const activeChallengeIndex = activeChapter.challenges.findIndex(
    (challenge: any) => challenge.id === activeChallenge.id
  );
  //Select challenge
  const selectChallenge = (challenge: any) => {
    setActiveChallenge(challenge);
    setActiveChapter(course.chapters[Number.parseInt(challenge.chapterId) - 1]);
  };
  //Select next challenge
  const selectNextChallenge = () => {
    const nextChallengeIndex = activeChallengeIndex + 1;
    const nextChallenge = activeChapter.challenges[nextChallengeIndex];
    const nextChapterIndex = activeChapterIndex + 1;
    const nextChapter = course.chapters[nextChapterIndex];
    if (nextChallengeIndex < activeChapter.challenges.length) {
      setActiveChallenge(nextChallenge);
    } else {
      setActiveChapter(nextChapter);
      setActiveChallenge(nextChapter.challenges[0]);
    }
  };
  //Select next chapter
  const selectNextChapter = () => {
    const nextChapterIndex = activeChapterIndex + 1;
    const nextChapter = course.chapters[nextChapterIndex];
    if (nextChapterIndex < course.chapters.length) {
      setActiveChapter(nextChapter);
      setActiveChallenge(nextChapter.challenges[0]);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-8 lg:col-span-8">
        <div>
          <div
            className="relative w-full overflow-hidden rounded-md pt-[56.25%] [&>div]:absolute [&>div]:top-0 [&>div]:left-0 [&>div]:w-full!"
            onMouseEnter={mouseMoveHandler}
          >
            <ReactPlayer
              height="100%"
              muted={muted}
              onEnded={() => {
                setVideoState({
                  ...videoState,
                  playing: false,
                });
              }}
              onProgress={progressHandler}
              played={played}
              playing={playing}
              ref={playerRef}
              url={activeChallenge.url}
              volume={volume}
              width="100%"
            />
            <PlayerControls
              controlRef={playerControlsRef}
              currentTime={formatCurrentTime}
              duration={formatDuration}
              mute={muted}
              onForward={fastFowardHandler}
              onFullscreen={fullscreenHandler}
              onMute={muteHandler}
              onNext={selectNextChallenge}
              onPlayPause={playHandler}
              onRewind={rewindHandler}
              onSeek={(value) => {
                seekHandler(value);
              }}
              onVolumeChangeHandler={(value) => {
                volumeChangeHandler(value);
              }}
              played={played}
              playing={playing}
              subtitle={`Chapter ${activeChapter.id} - E0${
                activeChallengeIndex + 1
              }`}
              title={activeChapter.title}
              volume={volume}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between border-muted-200 border-b py-6 md:flex-row md:items-center dark:border-muted-800">
          <div className="mb-6 md:mb-0">
            <p className="text-muted-500 text-sm uppercase dark:text-muted-100">
              {t("Chapter")} {activeChapter.id} - E0{activeChallengeIndex + 1}
            </p>
            <h2 className="font-medium text-muted-800 text-xl capitalize tracking-wide dark:text-muted-100">
              {activeChallenge.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content={t("Like video")} position="top">
              <IconButton color="danger" variant="pastel">
                <Icon className="h-5 w-5" icon="pepicons-pencil:heart-filled" />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("Share video")} position="top">
              <IconButton color="contrast">
                <Icon className="h-5 w-5" icon="majesticons:share" />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("Contact")} position="top">
              <IconButton color="contrast">
                <Icon className="h-5 w-5" icon="fluent:mail-20-filled" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center justify-between border-muted-200 border-b py-6 dark:border-muted-800">
          <div className="flex items-center gap-2">
            <Avatar size="sm" src={course.author.picture} />
            <div>
              <p className="text-muted-500 text-xs dark:text-muted-100">
                {t("Author")}
              </p>
              <h2 className="font-medium text-base text-muted-800 tracking-wide dark:text-muted-100">
                {course.author.name}
              </h2>
            </div>
          </div>
          <div>
            <Button color="muted" onClick={selectNextChapter} variant="pastel">
              <span>{t("Next Chapter")}</span>
              <Icon className="h-4 w-4" icon="iconamoon:player-right-fill" />
            </Button>
          </div>
        </div>
        <div className="border-muted-200 border-b py-6 dark:border-muted-800">
          <div>
            <h2 className="mb-3 font-medium text-base text-muted-800 capitalize tracking-wide dark:text-muted-100">
              {t("Challenge description")}
            </h2>
            <p className="max-w-2xl text-muted-500 text-sm leading-snug dark:text-muted-100">
              {activeChallenge.description}
            </p>
          </div>
        </div>
        <div className="flex gap-8 border-muted-200 border-b dark:border-muted-800">
          <button
            className={`border-b-2 pt-4 pb-3 text-sm ${
              activeTab === "downloads"
                ? "border-primary-500 text-muted-800 dark:text-muted-100"
                : "border-transparent text-muted-400 hover:text-muted-600 dark:text-muted-500 dark:hover:text-muted-300"
            }
            `}
            onClick={() => {
              setActiveTab("downloads");
            }}
            type="button"
          >
            {t("Downloads")}
          </button>
          <button
            className={`border-b-2 pt-4 pb-3 text-sm ${
              activeTab === "comments"
                ? "border-primary-500 text-muted-800 dark:text-muted-100"
                : "border-transparent text-muted-400 hover:text-muted-600 dark:text-muted-500 dark:hover:text-muted-300"
            }
            `}
            onClick={() => {
              setActiveTab("comments");
            }}
            type="button"
          >
            {t("Comments")}
          </button>
          <button
            className={`border-b-2 pt-4 pb-3 text-sm ${
              activeTab === "reviews"
                ? "border-primary-500 text-muted-800 dark:text-muted-100"
                : "border-transparent text-muted-400 hover:text-muted-600 dark:text-muted-500 dark:hover:text-muted-300"
            }
            `}
            onClick={() => {
              setActiveTab("reviews");
            }}
            type="button"
          >
            {t("Reviews")}
          </button>
        </div>
        <div className="relative mt-8">
          {activeTab === "downloads" ? (
            <div>
              <div className="mx-auto mb-4 w-full max-w-4xl space-y-10 rounded-sm pb-8">
                <div className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <h3 className="mb-1 font-medium font-sans text-muted-800 dark:text-muted-100">
                      {t("Free downloads")}
                    </h3>
                    <p className="font-sans text-muted-500 text-xs md:max-w-[190px] dark:text-muted-400">
                      {t("Content that you can immediately download for free")}
                    </p>
                  </div>
                  <div className="md:col-span-8">
                    <div className="flex max-w-sm flex-col divide-y divide-muted-200 dark:divide-muted-800">
                      <div className="flex flex-col divide-y divide-muted-200 dark:divide-muted-800">
                        {course.downloads.free.map((download: any) => (
                          <div className="relative" key={download.id}>
                            <div className="flex items-center gap-2 px-4 py-3 font-sans text-muted-600 text-sm transition-colors duration-300 hover:bg-muted-100 dark:text-muted-400 dark:hover:bg-muted-800">
                              {download.type === "file" ? (
                                <Icon
                                  className="h-5 w-5 text-primary-500"
                                  icon="ph:file-text"
                                />
                              ) : (
                                ""
                              )}
                              {download.type === "repository" ? (
                                <Icon
                                  className="h-4 w-4 text-muted-900 dark:text-muted-100"
                                  icon="fa6-brands:github"
                                />
                              ) : (
                                ""
                              )}
                              <div>
                                <p>{download.title}</p>
                                {download.type === "file" ? (
                                  <p className="text-muted-400 text-xs">
                                    {t("File \u00B7")} {download.size}
                                  </p>
                                ) : (
                                  ""
                                )}
                                {download.type === "repository" ? (
                                  <p className="text-muted-400 text-xs">
                                    {t("Github repository")}
                                  </p>
                                ) : (
                                  ""
                                )}
                              </div>
                              {download.type === "file" ? (
                                <Button
                                  className="ms-auto"
                                  shape="full"
                                  size="sm"
                                  type="button"
                                >
                                  <Icon
                                    className="h-3 w-3"
                                    icon="lucide:arrow-down"
                                  />
                                  <span>{t("Download")}</span>
                                </Button>
                              ) : (
                                ""
                              )}
                              {download.type === "repository" ? (
                                <ButtonLink
                                  className="ms-auto"
                                  href={download.url}
                                  shape="full"
                                  size="sm"
                                  type="button"
                                >
                                  <span>{t("Access")}</span>
                                  <Icon
                                    className="h-3 w-3"
                                    icon="lucide:arrow-right"
                                  />
                                </ButtonLink>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <h3 className="mb-1 font-medium font-sans text-muted-800 dark:text-muted-100">
                      {t("Premium downloads")}
                    </h3>
                    <p className="font-sans text-muted-500 text-xs md:max-w-[190px] dark:text-muted-400">
                      {t("Content that is only available for subscribed users")}
                    </p>
                  </div>
                  <div className="md:col-span-8">
                    <div className="flex max-w-sm flex-col divide-y divide-muted-200 dark:divide-muted-800">
                      {course.downloads.premium.map((download: any) => (
                        <div className="relative" key={download.id}>
                          <div className="flex items-center gap-2 px-4 py-3 font-sans text-muted-600 text-sm transition-colors duration-300 hover:bg-muted-100 dark:text-muted-400 dark:hover:bg-muted-800">
                            {download.type === "file" ? (
                              <Icon
                                className="h-5 w-5 text-primary-500"
                                icon="ph:file-text"
                              />
                            ) : (
                              ""
                            )}
                            {download.type === "repository" ? (
                              <Icon
                                className="h-4 w-4 text-muted-900 dark:text-muted-100"
                                icon="fa6-brands:github"
                              />
                            ) : (
                              ""
                            )}
                            <div>
                              <p className="text-muted-700 dark:text-muted-100">
                                {download.title}
                              </p>
                              {download.type === "file" ? (
                                <p className="text-muted-400 text-xs">
                                  {t("File \u00B7")} {download.size}
                                </p>
                              ) : (
                                ""
                              )}
                              {download.type === "repository" ? (
                                <p className="text-muted-400 text-xs">
                                  {t("Github repository")}
                                </p>
                              ) : (
                                ""
                              )}
                            </div>
                            {download.type === "file" ? (
                              <Button
                                className="ms-auto"
                                shape="full"
                                size="sm"
                                type="button"
                              >
                                <Icon className="h-3 w-3" icon="ph:lock-fill" />
                                <span>{t("Download")}</span>
                              </Button>
                            ) : (
                              ""
                            )}
                            {download.type === "repository" ? (
                              <ButtonLink
                                className="ms-auto"
                                href={download.url}
                                shape="full"
                                size="sm"
                                type="button"
                              >
                                <span>{t("Access")}</span>
                                <Icon className="h-3 w-3" icon="ph:lock-fill" />
                              </ButtonLink>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {activeTab === "comments" ? (
            <div>
              <div className="mx-auto mb-4 w-full max-w-4xl space-y-10 rounded-sm pb-8">
                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <h3 className="mb-1 font-medium font-sans text-muted-800 dark:text-muted-100">
                      {course.comments.length} {t("Entr")}{" "}
                      {course.comments.length > 1 ? "ies" : "y"}
                    </h3>
                    <p className="font-sans text-muted-500 text-xs md:max-w-[190px] dark:text-muted-400">
                      {t("Subscribed user comments")}
                    </p>
                  </div>
                  <div className="md:col-span-9">
                    <div className="space-y-8">
                      {course.comments.map((comment: any) => (
                        <div className="flex w-full" key={comment.id}>
                          <div className="me-3 hidden shrink-0 md:block">
                            <Avatar size="sm" src={comment.user.picture} />{" "}
                          </div>
                          <Card
                            className="flex-1 px-4 py-2 leading-relaxed sm:px-6 sm:py-4"
                            color="contrast"
                          >
                            <h5 className="space-x-2">
                              <span className="font-medium text-muted-800 dark:text-muted-100">
                                {comment.user.name}
                              </span>
                              <span className="text-muted-400 text-xs">
                                {comment.user.date}
                              </span>
                            </h5>
                            <p className="text-muted-500 text-sm dark:text-muted-400">
                              {comment.user.content}
                            </p>
                            <div className="mt-2 flex w-full items-center justify-start text-sm">
                              <div className="flex items-center justify-center gap-3 font-medium text-muted-500 dark:text-muted-400">
                                <button
                                  className="flex items-center underline-offset-4 hover:text-primary-500 hover:underline"
                                  type="button"
                                >
                                  <span>{t("Like")}</span>
                                </button>
                                <small className="flex h-full items-center justify-center">
                                  {t("bull")}
                                </small>
                                <button
                                  className="flex items-center underline-offset-4 hover:text-primary-500 hover:underline"
                                  type="button"
                                >
                                  <span>{t("Reply")}</span>
                                </button>
                              </div>
                            </div>
                            <div className="mt-6 space-y-4 pb-2">
                              <div className="flex">
                                <div className="me-3 hidden shrink-0 md:block">
                                  <Avatar
                                    size="xs"
                                    src={comment.author.picture}
                                  />
                                </div>
                                <Card
                                  className="flex-1 px-4 py-2 leading-relaxed sm:px-6 sm:py-4"
                                  color="muted"
                                >
                                  <h5 className="space-x-2">
                                    <span className="font-medium text-muted-800 dark:text-muted-100">
                                      {comment.author.name}
                                    </span>
                                    <span className="text-muted-400 text-xs">
                                      {comment.author.date}
                                    </span>
                                  </h5>
                                  <p className="text-muted-500 text-xs sm:text-sm dark:text-muted-400">
                                    {comment.author.content}
                                  </p>
                                </Card>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {activeTab === "reviews" ? (
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {course.reviews.map((review: any) => (
                  <Card className="p-8" color="contrast" key={review.id}>
                    <div className="flex gap-1">
                      <Icon
                        className={`h-4 w-4 ${
                          review.rating >= 1
                            ? "text-yellow-400"
                            : "text-muted-300 dark:text-muted-700"
                        }`}
                        icon="uiw:star-on"
                      />
                      <Icon
                        className={`h-4 w-4 ${
                          review.rating >= 2
                            ? "text-yellow-400"
                            : "text-muted-300 dark:text-muted-700"
                        }`}
                        icon="uiw:star-on"
                      />
                      <Icon
                        className={`h-4 w-4 ${
                          review.rating >= 3
                            ? "text-yellow-400"
                            : "text-muted-300 dark:text-muted-700"
                        }`}
                        icon="uiw:star-on"
                      />
                      <Icon
                        className={`h-4 w-4 ${
                          review.rating >= 4
                            ? "text-yellow-400"
                            : "text-muted-300 dark:text-muted-700"
                        }`}
                        icon="uiw:star-on"
                      />
                      <Icon
                        className={`h-4 w-4 ${
                          review.rating === 5
                            ? "text-yellow-400"
                            : "text-muted-300 dark:text-muted-700"
                        }`}
                        icon="uiw:star-on"
                      />
                    </div>
                    <p className="mt-2 text-muted-400 text-xs leading-5">
                      {review.date}
                    </p>
                    <div className="mt-6 flex items-center space-x-1 text-muted-400">
                      <p className="text-sm">{review.course}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-muted-800 dark:text-muted-100">
                        {review.title}
                      </h3>
                      <p className="text-muted-500 text-sm leading-5 dark:text-muted-400">
                        {review.content}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex shrink-0 rounded-full border border-muted-200">
                        <Avatar size="xs" src={review.user.picture} />
                      </div>
                      <div>
                        <span className="block font-medium text-muted-800 text-sm leading-5 dark:text-muted-100">
                          {review.user.name}
                        </span>
                        <span className="block text-muted-400 text-xs">
                          {review.user.role}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="flex flex-col gap-6">
          <Card className="p-6" color="contrast">
            <div className="mb-2 flex items-center justify-between">
              <Tag className="capitalize" color="success" variant="pastel">
                {course.level}
              </Tag>
              <Link
                className="group flex items-center gap-2 text-muted-400 underline-offset-4 transition-colors duration-300 hover:text-primary-500 hover:underline"
                href="#"
              >
                <Icon
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                  icon="lucide:arrow-left"
                />
                <span className="text-sm">{t("Back")}</span>
              </Link>
            </div>
            <h2 className="mb-4 text-muted-800 text-xl dark:text-muted-100">
              {course.title}
            </h2>
            <p className="text-muted-500 text-sm dark:text-muted-100">
              {course.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-muted-400 text-xs uppercase leading-none">
                  {course.chapters.length} {t("Chapters")}
                </span>
                <span className="px-2">·</span>
                <span className="font-medium text-primary-500 text-sm">
                  {course.duration}
                </span>
              </div>
              <div>
                <Button color="primary">
                  {t("Enroll for")}{" "}
                  <span className="ps-2 font-semibold text-base">$89</span>
                </Button>
              </div>
            </div>
          </Card>
          {course.chapters.map((chapter: any) => (
            <ToggleBox
              color="contrast"
              header={
                <div>
                  <p className="text-muted-500 text-xs uppercase leading-none dark:text-muted-100">
                    {t("Chapter")}
                    {chapter.id}
                  </p>
                  <h2 className="font-medium text-base text-muted-800 capitalize tracking-wide dark:text-muted-100">
                    {chapter.title}
                  </h2>
                </div>
              }
              key={chapter.id}
              open={chapter === activeChapter ? true : false}
              spaced
            >
              <div className="flex items-center justify-between">
                <div>
                  <Tag
                    className="capitalize"
                    color={chapter.pricing === "free" ? "primary" : "warning"}
                    variant="pastel"
                  >
                    {chapter.pricing === "free" ? "Free" : "Premium"}
                  </Tag>
                </div>
                <div className="flex items-center gap-1 text-muted-400">
                  <Icon className="h-4 w-4" icon="mdi:timer" />
                  <span className="text-sm">{chapter.duration}</span>
                </div>
              </div>
              <div className="mt-4">
                <ul className="space-y-4 ps-2 pb-4">
                  {chapter.challenges.map((challenge: any) => (
                    <li className="flex items-center gap-3" key={challenge.id}>
                      <div className="relative">
                        <button
                          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
                            challenge === activeChallenge &&
                            !challenge.completed
                              ? "border-primary-500 bg-primary-500 text-white hover:enabled:bg-primary-600"
                              : "border-primary-500/10 bg-primary-500/10 text-primary-500"
                          }
                          `}
                          onClick={() => {
                            challenge === activeChallenge ? playHandler() : "";
                          }}
                          type="button"
                        >
                          {challenge === activeChallenge && playing ? (
                            <Icon
                              className="pointer-events-none h-4 w-4"
                              icon="iconamoon:player-pause-fill"
                            />
                          ) : (
                            <Icon
                              className="pointer-events-none h-4 w-4"
                              icon="iconamoon:player-play-fill"
                            />
                          )}
                          {challenge === activeChallenge ? (
                            <span className="pointer-events-none absolute top-1/2 left-1/2 z-10 block -translate-x-1/2 -translate-y-1/2">
                              <ProgressCircle
                                color="primary"
                                size={65}
                                thickness={1}
                                value={played * 100}
                              />
                            </span>
                          ) : (
                            ""
                          )}
                        </button>
                      </div>
                      <button
                        className={`block text-start text-sm transition-colors duration-300 ${
                          challenge === activeChallenge
                            ? "font-semibold text-primary-500"
                            : "text-muted-500 hover:text-muted-700 dark:text-muted-400 dark:hover:text-muted-100"
                        }
                          `}
                        onClick={() => {
                          selectChallenge(challenge);
                        }}
                        type="button"
                      >
                        {challenge.title}
                      </button>
                      <div className="ms-auto">
                        <span className="text-muted-400 text-xs">
                          {challenge.duration}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ToggleBox>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CoursePlayer;
