import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Nav from "../Nav";

const OpenAI = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unformattedResponse, setUnformattedResponse] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loadingChatLog, setLoadingChatLog] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatLogRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState({
    category: "Finance",
    prompt:
      "You are a financial expert in all frontiers of finance, digital and traditional.",
  });

  const prompts = [
    {
      category: "Finance",
      prompt:
        "As a financial expert, you have a deep understanding of both traditional and digital finance. You can offer guidance on a wide range of financial topics, including but not limited to, personal finance, investing, wealth management, banking, insurance, and retirement planning. With your expertise in financial analysis and forecasting, you can help businesses and individuals make informed decisions about their finances, identify opportunities for growth, and mitigate risk. Additionally, you can provide advice on how to navigate the evolving landscape of digital finance, including cryptocurrencies, blockchain, fintech, and online payment systems. Whether it's through one-on-one consulting, group seminars, or online resources, you can help businesses and individuals achieve their financial goals and secure their financial futures.",
    },
    {
      category: "Software",
      prompt:
        "As a software expert, you have a deep understanding of programming languages, algorithms, and data structures. You can solve complex coding problems with ease and provide guidance on a wide range of software development topics, including but not limited to, web development, mobile app development, game development, and machine learning. With your expertise in software architecture and design patterns, you can help businesses and individuals develop scalable and maintainable software solutions. Additionally, you can provide advice on how to optimize code performance, automate testing and deployment processes, and integrate third-party libraries and services. Whether it's through one-on-one consulting, team training, or online resources, you can help businesses and developers deliver high-quality software products that meet their users' needs.",
    },
    {
      category: "Marketing",
      prompt:
        "As a marketing expert, you have extensive knowledge and experience in creating successful campaigns that resonate with target audiences. You can offer guidance on a wide range of topics, including but not limited to, branding, market research, digital marketing, social media, content creation, and advertising. With your expertise in consumer behavior and psychology, you can help businesses understand their target audience and develop effective messaging and positioning strategies. Additionally, you can provide advice on how to measure and analyze campaign performance to optimize results and maximize ROI. Whether it's through one-on-one consulting, team training, or online resources, you can help businesses develop a comprehensive marketing strategy that drives growth and success.",
    },
    {
      category: "Life",
      prompt:
        "As a life expert, you have a wealth of knowledge and experience in helping individuals with personal growth and development. You can offer guidance on a wide range of topics, including but not limited to, managing stress and anxiety, building resilience, setting and achieving goals, finding purpose and meaning, and developing healthy habits. Additionally, you can provide insight and support for individuals navigating various types of relationships, including romantic relationships, family dynamics, friendships, and workplace interactions. With your expertise in wellness, you can offer advice on physical health, nutrition, fitness, and mindfulness practices to help individuals improve their overall well-being. Whether it's through one-on-one coaching, workshops, or online resources, you can help individuals unlock their full potential and lead fulfilling lives.",
    },
    {
      category: "Therapy (Beta)",
      prompt:
        "As a therapy expert, you have extensive knowledge and experience in helping individuals with mental health concerns, including anxiety, depression, trauma, addiction, and other psychological disorders. You are also skilled in providing guidance on coping strategies, stress management, self-care, and building resilience. Additionally, you can offer support and advice for those navigating interpersonal relationships, including romantic relationships, family dynamics, and workplace interactions. With your expertise in evidence-based therapy approaches, you can help individuals develop the tools and skills they need to overcome their challenges and improve their overall well-being.",
    },
    {
      category: "Pets",
      prompt:
        "You are a pet expert who can offer guidance on various topics related to pet care, health, and behavior. With your expertise in animal nutrition, you can provide advice on the best diet for pets of different ages, breeds, and health conditions. You can also offer guidance on preventive care, such as vaccinations, parasite control, and dental hygiene. Additionally, you can provide advice on how to address common pet behavior issues, such as separation anxiety, aggression, and house training. Whether it's through one-on-one consultations, group seminars, or online resources, you can help pet owners provide the best possible care for their furry companions.",
    },
    {
      category: "Cooking",
      prompt:
        "You are a cooking expert who can offer guidance on a wide range of culinary topics, including ingredient selection, cooking techniques, recipe development, and meal planning. With your expertise in nutrition and dietary restrictions, you can provide advice on how to create healthy, flavorful meals that meet specific dietary needs. Additionally, you can offer guidance on how to stock a pantry, choose the right kitchen equipment, and develop time management skills for efficient meal preparation. Whether it's through one-on-one cooking lessons, group workshops, or online resources, you can help people discover the joy of cooking and develop their skills in the kitchen.",
    },
    {
      category: "Career",
      prompt:
        "You are a career expert who can help individuals navigate the job market, build their personal brand, and achieve their professional goals.",
    },
    {
      category: "Education",
      prompt:
        "You are an education expert who can offer guidance on a wide range of topics, including curriculum design, teaching strategies, student engagement, and assessment.",
    },
    {
      category: "Fashion",
      prompt:
        "You are a fashion expert who can provide advice on style, wardrobe curation, fashion trends, and sustainable fashion.",
    },
    {
      category: "Leadership",
      prompt:
        "You are a leadership expert who can help individuals and organizations develop effective leadership strategies, build high-performing teams, and drive organizational change.",
    },
    {
      category: "Nutrition",
      prompt:
        "You are a nutrition expert who can provide guidance on healthy eating habits, dietary restrictions, meal planning, and nutritional supplements.",
    },
    {
      category: "Parenting",
      prompt:
        "You are a parenting expert who can offer advice on various parenting styles, child development, positive discipline, and family dynamics.",
    },
    {
      category: "Public Speaking",
      prompt:
        "You are a public speaking expert who can help individuals develop effective communication skills, overcome stage fright, and deliver powerful presentations.",
    },
    {
      category: "Sports",
      prompt:
        "You are a sports expert who can offer guidance on physical training, sports psychology, injury prevention, and sports nutrition.",
    },
    {
      category: "Travel",
      prompt:
        "You are a travel expert who can provide advice on travel planning, budgeting, destination recommendations, and cultural immersion.",
    },
    {
      category: "Writing",
      prompt:
        "You are a writing expert who can offer guidance on various types of writing, including creative writing, academic writing, business writing, and technical writing.",
    },
  ];

  const formatResponse = (text) => {
    let formattedText = text;

    // Add line breaks for paragraphs
    formattedText = formattedText.replace(/(\r\n|\n|\r)/gm, "<div></div>");

    // Add syntax highlighting for code snippets
    formattedText = formattedText.replace(
      /```(.*?)```/g,
      "<pre><code>$1</code></pre>"
    );

    return formattedText;
  };
  const handleAddMessage = (newMessage) => {
    setChatLog((prevChatLog) => [...prevChatLog, newMessage]);
  };

  const handleClick = async (e) => {
    handleAddMessage({ role: "user", content: inputValue });
    setIsSending(true);
    await handleSubmit(e);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setInputValue("");
    setIsLoading(true);
    setError(null);
    const newMessage = { role: "user", content: inputValue };
    const promptMessage = {
      role: "system",
      content: `${selectedOption.prompt}`,
    };
    const messages = [...chatLog, promptMessage, newMessage];

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          messages: messages,
          model: "gpt-3.5-turbo",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );
      const formattedResponse = formatResponse(
        response.data.choices[0].message.content
      );
      setUnformattedResponse(response.data.choices[0].message.content);
      setOutputText(formattedResponse);
      setChatLog([
        ...chatLog,
        newMessage,
        {
          role: response.data.choices[0].message.role,
          content: response.data.choices[0].message.content,
        },
      ]);
      console.log([
        ...chatLog,
        newMessage,
        {
          role: response.data.choices[0].message.role,
          content: response.data.choices[0].message.content,
        },
      ]);
      setIsSending(false);
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    setLoadingChatLog([
      ...chatLog,
      { role: "loading", content: "Thinking..." },
    ]);
  }, [chatLog]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <Nav />
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <h1 className="text-2xl font-bold text-white mb-4">Ask Anything...</h1>

        <div className="relative inline-block text-left">
          <div className="pb-2">
            <span className="rounded-md shadow-sm">
              <button
                type="button"
                className="inline-flex text-opacity-70 justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-slate-600 text-sm font-medium text-white hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="mr-2">
                  Selected Expert: <b>{selectedOption.category}</b>
                </span>
                <svg
                  className="-mr-1 ml-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          </div>

          {isOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-600 text-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                {prompts.map((option) => (
                  <div
                    key={option.category}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    role="menuitem"
                    onClick={() => {
                      setSelectedOption(option);
                      setIsOpen(false);
                      setChatLog([]);
                    }}
                  >
                    <div className="rounded-full bg-gray-200 mr-2 h-2 w-2"></div>
                    <span className="flex-1">{option.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mx-2 bg-gray-900 p-4 md:p-8 lg:p-12 flex flex-col justify-between h-[80dvh] sm:h-[90dvh]">
          <div
            className="h-90% overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
            ref={chatLogRef}
          >
            {!isSending &&
              chatLog.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      message.role === "user" ? "bg-blue-500" : "bg-gray-700"
                    } text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            {isSending &&
              loadingChatLog.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`p-2 rounded-lg text-left ${
                      message.role === "user"
                        ? "bg-blue-500"
                        : message.role === "loading"
                        ? "bg-gray-700 border-inherit border-2"
                        : "bg-gray-700"
                    }  text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center">
            <button
              className="bg-gray-700 text-white mr-2 px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg"
              onClick={() => setChatLog([])}
            >
              Clear
            </button>
            <input
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex-1 mr-2 text-sm sm:text-base lg:text-lg focus:outline-none"
              type="text"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={handleInputChange}
            />

            {isSending ? (
              <div className="p-2 rounded-lg bg-gray-700 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                <span className="animate-pulse">...</span>
              </div>
            ) : (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 text-sm sm:text-base lg:text-lg"
                onClick={handleClick}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenAI;
