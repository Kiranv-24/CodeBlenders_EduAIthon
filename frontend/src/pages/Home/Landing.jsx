import React, { useState, useEffect } from "react";import { Link } from "react-router-dom";import { Typewriter } from "react-simple-typewriter";import { useNavigate } from "react-router";import axios from "axios";import { useTranslation } from "react-i18next";import i18n from "../../Language/i18n";import LanguageSelector from "../../Components/LanguageSelector";
import CancelIcon from "@mui/icons-material/Cancel";
import primaryImage from "../../assets/primary-background.png";
// import Demo from "../../assets/demo.jpg";
import Chatbot from "../../assets/chatbot.png";


import * as Links from "./Links";
import Container from "./Container";
import { GetUserQuery } from "../../api/user";
import OutboundIcon from "@mui/icons-material/Outbound";
import { BiRightArrow } from "react-icons/bi";

import { GoGlobe } from "react-icons/go";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AiOutlineArrowRight } from "react-icons/ai";

import MapCommunities from "./Mapbox/MapCommunities";
import Searchbox from "../../Components/SearchBox";
import { ImCross } from "react-icons/im";
import { LoaderIcon } from "react-hot-toast";

const Landing = () => {
  const [dropDown, setDropDown] = useState(false);
  const [sitestatus, setsitestatus] = useState(true);
  const data = GetUserQuery();
  const [user, setuser] = useState();
  const [scrollLeft, setScrollLeft] = useState(0);
  const [chatbot, setChatbot] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setloading] = useState(false);
  const [chatquestion, setChatquestion] = useState([
    { bot: "Hi this is Sathi Bot how may i help u?" },
    { user: "Hi i want some answer" },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    console.log(question);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        `question=${encodeURIComponent(question)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response) {
        setloading(false);
        setAnswer(response.data.answer);
      }

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const array = [1, 2, 3, 4, 5, 6];
  const arr = [1, 2, 3];

  const scrollLeftHandler = () => {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollStep = 100;
    scrollContainer.scrollLeft -= scrollStep;

    setScrollLeft(scrollContainer.scrollLeft);
  };
  const scrollRightHandler = () => {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollStep = 100;
    scrollContainer.scrollLeft += scrollStep;
    setScrollLeft(scrollContainer.scrollLeft);
  };
  const code = "ERR_NETWORK";
  const checkstatus = async () => {
    await axios
      .get(`${import.meta.env.VITE_BASE_URL}/v1/user/get-allquestions`)
      .then((res) => {
        console.log(res.data, "status site");
        setsitestatus(true);
      })
      .catch((err) => {
        console.log(err.code);
        setsitestatus(false);
      });
  };
  useEffect(() => {
    setuser(data?.data);
    checkstatus();
  }, [data.data]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const navigate = useNavigate();

  const NavLinks = ({ obj }) => {
    return !obj.protected ? (
      <Link
        to={obj.path}
        className="hover:text-theme cursor-pointer tracking-widest  "
      >
        {t(obj.name)}
      </Link>
    ) : user ? (
      <Link
        to={obj.path}
        className="hover:text-theme cursor-pointer tracking-widest  "
      >
        {t(obj.name)}
      </Link>
    ) : (
      ""
    );
  };
  const handleChange = (e) => {
    e.preventDefault();
    const value = document.getElementById("language").value;
    console.log(value);
  };
  return (
    <div className="min-h-screen bg-[#f0fdf4] text-center">
      <section>
        <div
          className="cursor-pointer w-16 h-16 fixed bottom-6 right-6 z-50 transition-transform hover:scale-105"
          onClick={() => setChatbot(true)}
        >
          <button className="w-full h-full rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <img className="w-full h-full object-cover" src={Chatbot} alt="Chat Assistant" />
          </button>
        </div>
        <div
          className={`${
            chatbot ? "" : "hidden"
          } w-[350px] h-[400px] bg-white rounded-xl fixed bottom-24 right-6 p-4 shadow-xl border border-emerald-100 z-40`}
        >
          <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
            <h3 className="text-lg font-semibold text-emerald-800">Chat Assistant</h3>
            <ImCross
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors"
              onClick={() => setChatbot(false)}
            />
          </div>
          <div className="flex-1 overflow-y-auto my-4 space-y-4 px-2 h-[300px]">
            {answer && (
              <div className="bg-emerald-50 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">A</div>
                  <strong className="text-emerald-700">Assistant</strong>
                </div>
                <p className="text-gray-700 ml-10">{answer}</p>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg mt-auto border border-emerald-100"
          >
            <input
              type="text"
              placeholder="Search for the meeting..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-emerald-400"
              value={question}
              onChange={handleQuestionChange}
            />

            <button type="submit" className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              {loading ? (
                <h1>
                  <LoaderIcon />
                </h1>
              ) : (
                <BiRightArrow />
              )}
            </button>
          </form>
        </div>
      </section>

      <section className="fixed inset-x-0 mx-auto w-full custom-navbar-width z-10 py-5 ">
        <nav className="bg-white/95 backdrop-blur-sm lg:flex hidden flex-row justify-between px-6 py-4 rounded-xl shadow-lg items-center z-10 transition-all duration-300 hover:shadow-xl">
          <div className="mx-2 w-[200px]">
            <Link to="" className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Code</span>
              <span className="text-emerald-700">Blenders</span>
            </Link>
          </div>

          <div className=" mx-2  list-none space-x-10  flex-row-center text-lg text-primary font-comf">
            {Links.Navbar_Links.map((obj, id) => (
              <NavLinks obj={obj} />
            ))}

            {/* <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
              &nbsp;
              <span>
                {data?.data?.role === "mentor" ? (
                  <Link to="/mentor/Meetings">Meetings</Link>
                ) : (
                  <Link to="/user/book-meeting">Book a call</Link>
                )}
              </span>
              d
            </li> */}

            {user && user?.role == "student" ? (
              <Link to="/user/leaderboard">
                <button className="  ">DASHBOARD</button>
              </Link>
            ) : (
              user && (
                <Link to="/mentor/classroom">
                  <button className=" ">DASHBOARD</button>
                </Link>
              )
            )}
            {user ? (
              <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
                &nbsp;<span>Hello, {data?.data?.name}</span>
              </li>
            ) : (
              ""
            )}
            <LanguageSelector />
            {user ? (
              <button
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                LOG OUT
              </button>
            ) : (
              <Link to="/login">
                <button className=" primary-btn ">Login</button>
              </Link>
            )}
          </div>
        </nav>

        <nav className="text-primary flex lg:hidden flex-row justify-between px-5 py-2 my-4 rounded-lg shadow-md items-center text-para   z-10  border-nav bg-white space-x-5">
          <div className="mx-2 w-[100px]">
            <Link to="/" className="text-4xl font-right ">
              Code<span className="text-theme">Blendes</span>
            </Link>
          </div>
          <div className="mx-2  flex-row-between">
            <p
              className="text-4xl font-heading "
              onClick={() => setDropDown(!dropDown)}
            >
              <GiHamburgerMenu />
            </p>
          </div>
        </nav>
      </section>

      {dropDown && (
        <section className="absolute inset-x-0 mx-auto custom-navbar-width top-32 z-10 font-comf">
          <div className=" flex flex-col list-none top-32 rounded-lg leading-10 text-left px-7  py-3 custom-navbar-width border-2 border-[#cbcdd4] bg-white z-10">
            {Links.Navbar_Links.map((obj, id) => (
              <NavLinks obj={obj} />
            ))}
            <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
              <span>English</span>&nbsp;
              <GoGlobe />
            </li>

            <Link
              to="/user/leaderboard"
              className=" my-5 px-10 text-medium font-theme py-1 w-full bg-theme rounded-full z-10"
            >
              GET STARTED
            </Link>
          </div>
        </section>
      )}

      <section className="relative py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="absolute inset-0 z-0 opacity-10" style={{ 
          backgroundImage: `url(${primaryImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 pt-20">
          {!sitestatus ? (
            <div className="bg-red-500/90 backdrop-blur-sm p-4 flex items-center gap-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <CancelIcon
                style={{
                  color: "white",
                  margin: "2px",
                }}
              />
              <h1 className="text-lg font-semibold text-white">
                {t('site_status_down')}
              </h1>
            </div>
          ) : (
            <div className="bg-emerald-500/90 backdrop-blur-sm p-4 flex items-center gap-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <OutboundIcon
                style={{
                  color: "white",
                  marginLeft: "2px",
                }}
              />
              <h1 className="text-lg font-semibold text-white">
                {t('site_status_up')}
              </h1>
            </div>
          )}
          <div className="md:text-7xl text-3xl md:my-5 my-3 font-merri">
            <span>
              <Typewriter
                words={[
                  "Learn Concepts",
                  "Find Resources",
                  "Appear For Tests",
                  "Daily Monitoring",
                  "Track Progress",
                  "1:1 Mentorship",
                  "Resolve Doubts",
                ]}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={150}
                deleteSpeed={100}
                delaySpeed={1000}
              />
            </span>
          </div>

          <p className="md:text-lg text-sm font-comf"></p>
          {user && (
            <Link to="/user" className=" primary-btn ">
              DASHBOARD
            </Link>
          )}
        </div>
      </section>

     
    </div>
  );
};

export default Landing;
