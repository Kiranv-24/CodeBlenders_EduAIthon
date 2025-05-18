import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetUserQuery } from "../api/user";
import { RiDiscussFill } from "react-icons/ri";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { CgProfile } from "react-icons/cg";
import { MdDashboard, MdChat } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdLeaderboard, MdAssignmentAdd } from "react-icons/md";
import { SiBookstack } from "react-icons/si";
import { PiExamFill } from "react-icons/pi";
import { BiSolidReport, BiSolidLogOut } from "react-icons/bi";
import { FaNewspaper, FaBook, FaRobot } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import AssistantIcon from "@mui/icons-material/Assistant";
import HomeIcon from "@mui/icons-material/Home";
import ClassIcon from "@mui/icons-material/Class";
import { LoaderIcon } from "react-hot-toast";
import { VideoCall } from "@mui/icons-material";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ChatIcon from '@mui/icons-material/Chat';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useTranslation } from "react-i18next";
import ChatBot from './ChatBot';

// Create a global floating button component
const FloatingChatButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed right-6 bottom-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
    aria-label="Open Chat Bot"
  >
    <FaRobot className="text-2xl" />
  </button>
);

const Leftbar = () => {
  const { t } = useTranslation();
  const data = GetUserQuery();
  const [user, setuser] = useState();
  const [loading, setloading] = useState(true);
  const location = useLocation();
  const [selected, setSelected] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setuser(data.data);
    if (data.data) {
      setloading(false);
    }
  }, [data.data]);

  useEffect(() => {
    const path = window.location.pathname;
    setSelected(path);
  }, []);

  return (
    <>
      {!loading ? (
        <div className="hidden lg:block h-full bg-white/90 backdrop-blur-md border-r border-violet-100 fixed w-[300px] overflow-y-auto shadow-xl transition-all duration-300 group/sidebar hover:bg-white/95 hover:shadow-violet-200/20 font-['Poppins']">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-indigo-200/30 rounded-full blur-3xl -z-10 group-hover/sidebar:opacity-75 transition-all duration-500"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-10 group-hover/sidebar:opacity-75 transition-all duration-500"></div>
          <div className="flex items-center justify-center h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAwIDYwMGMxNjUuNjg1IDAgMzAwLTEzNC4zMTUgMzAwLTMwMFM0NjUuNjg1IDAgMzAwIDBTMCAxMzQuMzE1IDAgMzAwczEzNC4zMTUgMzAwIDMwMCAzMDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-20 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-10"></div>
            <div>
              {user ? (
                <h1 className="text-2xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100 drop-shadow filter blur-none transform hover:scale-105 transition-all duration-300 cursor-default font-['Poppins']">
                  {t("sidebar_hello")}, {user?.name.toUpperCase()}{" "}
                </h1>
              ) : (
                <Link to="/login">{t("nav_login")}</Link>
              )}
            </div>
          </div>
          <div className="overflow-y-auto overflow-x-hidden flex-grow">
            <ul className="flex flex-col py-6 space-y-2 px-3">
              <li className="px-5">
                <div className="flex flex-row items-center h-8">
                  <div className="text-sm font-light tracking-wide text-gray-500">
                    {t("sidebar_dashboard")}
                  </div>
                </div>
              </li>
              {user?.role === "student" && (
                <li>
                  <div
                    className={
                      selected === "/user/sathi"
                        ? "bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-purple-500/5 text-indigo-700 rounded-xl relative flex items-center px-4 py-3.5 group shadow-sm transform hover:scale-[1.02] transition-all duration-300"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-indigo-600 rounded-xl relative flex items-center px-4 py-3.5 group transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
                    }
                  >
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100 group-hover:from-violet-200 group-hover:via-indigo-100 group-hover:to-purple-200 transition-all duration-300 shadow-sm group-hover:shadow-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-indigo-500/5 to-purple-500/0 animate-shimmer"></div>
                      <AssistantIcon className="text-xl text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10" />
                    </div>
                    <span className="ml-3 text-sm font-medium tracking-wide truncate group-hover:translate-x-1 transition-transform">
                      <Link
                        to="/user/sathi"
                        onClick={() => setSelected("/user/sathi")}
                      >
                        {t("sidebar_virtual_mentor")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              {/* <li>
                <div
                  className={
                    selected === "/user/chatbot"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <ChatIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/chatbot"
                      onClick={() => setSelected("/user/chatbot")}
                    >
                      {t("sidebar_ai_chatbot")}
                    </Link>
                  </span>
                </div>
              </li> */}
              <li>
                <div
                  className={
                    selected === "/user/meet"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover-bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <VideoCall className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/meet"
                      onClick={() => setSelected("/user/meet")}
                    >
                      {t("sidebar_video_call")}
                    </Link>
                  </span>
                </div>
                  <div
                  className={
                    selected === "/user/personal-meeting"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <SiBookstack className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/personal-meeting"
                      onClick={() => setSelected("/user/personal-meeting")}
                    >
                     {t("sidebar_personal_meetings")}
                    </Link>
                  </span>
                </div>
              </li>
               <li>
                  <div
                    className={
                      selected === "/user/chat"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/chat"
                        onClick={() => setSelected("/user/chat")}
                      >
                        {t("sidebar_chat")}
                      </Link>
                    </span>
                  </div>
                </li>
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/my-test"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/my-test"
                        onClick={() => setSelected("/mentor/my-test")}
                      >
                        {t("mentor_tests")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                <li>
                  <div
                    className={
                      selected === "/user/test"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/test"
                        onClick={() => setSelected("/user/test")}
                      >
                        {t("sidebar_tests")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/createtest"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/createtest"
                        onClick={() => setSelected("/mentor/createtest")}
                      >
                        {t("create_test")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}
              <li>
                <div
                  className={
                    selected === "/user/discuss"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <RiDiscussFill className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/discuss"
                      onClick={() => setSelected("/user/discuss")}
                    >
                      {t("discuss")}
                    </Link>
                  </span>
                </div>
              </li>
              {user?.role === "student" && (
                <li>
                  <div
                    className={
                      selected === "/user/book-meeting"
                        ? "border-zinc-700  bg-gray-50relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MeetingRoomIcon className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/book-meeting"
                        onClick={() => setSelected("/user/book-meeting")}
                      >
                        {t("sidebar_personal_meetings")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
            {user?.role == "student" ? (
                <li>
              <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4"></span>
                <BiSolidReport className="text-xl" />
                <span className="ml-2 text-sm tracking-wide truncate">
                  <Link to="/user/my-submissions">{t("sidebar_mysubmissions")}</Link>
                </span>
              </div>
            </li>
            ):""}
              <li>
                <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <HomeIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/">{t("home")}</Link>
                  </span>
                </div>
              </li>
              {/* <li>
                <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <MdLeaderboard className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/user/leaderboard">{t("leaderboard")}</Link>
                  </span>
                </div>
              </li> */}
              {user?.role === "mentor" ? (
                <li>
                  {/* <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <ClassIcon className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link to="/mentor/classroom">{t("your_classroom")}</Link>
                    </span>
                  </div> */}
                </li>
              ) : (
                ""
              )}
              <li>
                {/* <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <FaNewspaper className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/user/newsfeed">{t("news_feed")}</Link>
                  </span>
                </div> */}
              </li>
              {user?.role !== "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/user/material" ||
                      selected === "/mentor/material"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdAssignmentAdd className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to={`${
                          user?.role === "student"
                            ? "/user/material"
                            : "/mentor/material"
                        }`}
                        onClick={() => setSelected("/user/material")}
                      >
                        {t("sidebar_materials")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}{" "}
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/Meetings" ||
                      selected === "/mentor/Meetings"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdAssignmentAdd className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to={`${
                          user?.role === "student"
                            ? "/mentor/Meetings"
                            : "/mentor/Meetings"
                        }`}
                        onClick={() => setSelected("/mentor/Meetings")}
                      >
                        {t("your_meetings")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}{" "}
              <li className="px-5">
                <div className="flex flex-row items-center h-8">
                  <div className="text-sm font-light tracking-wide text-gray-500">
                    {t("settings")}
                  </div>
                </div>
              </li>
              <li>
                <div
                  className={
                    selected === "/user/profile"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4">
                    <CgProfile className="text-xl" />
                  </span>
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/profile"
                      onClick={() => setSelected("/user/profile")}
                    >
                      {t("profile")}
                    </Link>
                  </span>
                </div>
              </li>
              <li>
                <div
                  className={
                    selected === "/user/settings"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <AiFillSetting className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/settings"
                      onClick={() => setSelected("/user/settings")}
                    >
                      {t("settings")}
                    </Link>
                  </span>
                </div>
              </li>
              {user?.role === "mentor" && (
                <li>
                  <div
                    className={
                      selected === "/mentor/createMaterial"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <AiFillSetting className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/createMaterial"
                        onClick={() => setSelected("/mentor/createMaterial")}
                      >
                        {t("sidebar_create_material")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              {/* Topic Discussion Menu Item */}
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/topic-discussion"
                        ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdChat className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/topic-discussion"
                        onClick={() => setSelected("/mentor/topic-discussion")}
                      >
                        {t("topic_discussion")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                <li>
                  <div
                    className={
                      selected === "/user/topic-discussion"
                        ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdChat className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/topic-discussion"
                        onClick={() => setSelected("/user/topic-discussion")}
                      >
                        {t("topic_discussion")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              <li>
                <div
                  className={
                    selected === "/login"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <BiSolidLogOut className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      onClick={() => {
                        localStorage.removeItem("token");
                      }}
                      to="/login"
                    >
                      {t("sidebar_logout")}
                    </Link>
                  </span>
                </div>
              </li>
              {/* Digital Library Link for both roles */}
              <li>
                <div
                  className={
                    selected === "/mentor/digital-library" || selected === "/user/digital-library"
                      ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <LibraryBooksIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to={user?.role === "mentor" ? "/mentor/digital-library" : "/user/digital-library"}
                      onClick={() => setSelected(user?.role === "mentor" ? "/mentor/digital-library" : "/user/digital-library")}
                    >
                      {t("sidebar_digital_library")}
                    </Link>
                  </span>
                </div>
              </li>
              
              {/* Video Library Link for both roles */}
              <li>
                <div
                  className={
                    selected === "/mentor/video-upload" || selected === "/user/video-library"
                      ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <VideoLibraryIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to={user?.role === "mentor" ? "/mentor/video-upload" : "/user/video-library"}
                      onClick={() => setSelected(user?.role === "mentor" ? "/mentor/video-upload" : "/user/video-library")}
                    >
                      {user?.role === "mentor" ? t("sidebar_video_library") : t("sidebar_video_library")}
                    </Link>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center m-20">
          <LoaderIcon
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </div>
      )}
      
      {/* Floating Chat Button (visible on all pages) */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      
      {/* ChatBot Modal (centered in page) */}
      {isChatOpen && <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </>
  );
};

export default Leftbar;
