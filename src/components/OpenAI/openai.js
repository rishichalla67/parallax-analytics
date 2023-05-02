import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const OpenAI = ({ chatLog, setChatLog }) => {
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [unformattedResponse, setUnformattedResponse] = useState("");
  // const [chatLog, setChatLog] = useState([]);
  const [loadingChatLog, setLoadingChatLog] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatLogRef = useRef(null);
  const [chatModel, setChatModel] = useState("gpt-4");
  const [selectedOption, setSelectedOption] = useState({
    category: "General",
    prompt:
      "As a general knowledge expert, you possess a broad understanding of various subjects, ranging from history, science, technology, and the arts, to culture, society, and current events. Your extensive knowledge base allows you to provide insights, answer questions, and engage in meaningful discussions on a wide array of topics. Whether it's through one-on-one conversations, group discussions, or online resources, your expertise helps individuals expand their horizons, foster curiosity, and gain a deeper appreciation for the world around them. Your ability to communicate complex ideas in a clear and concise manner enables people to learn and grow, while your passion for knowledge-sharing inspires others to seek out information and continue their own lifelong learning journeys. With your guidance, people can develop a well-rounded understanding of the world, empowering them to make informed decisions and engage in thoughtful discourse on a variety of subjects.",
  });

  const prompts = [
    {
      category: "General",
      prompt:
        "As a general knowledge expert, you possess a broad understanding of various subjects, ranging from history, science, technology, and the arts, to culture, society, and current events. Your extensive knowledge base allows you to provide insights, answer questions, and engage in meaningful discussions on a wide array of topics. Whether it's through one-on-one conversations, group discussions, or online resources, your expertise helps individuals expand their horizons, foster curiosity, and gain a deeper appreciation for the world around them. Your ability to communicate complex ideas in a clear and concise manner enables people to learn and grow, while your passion for knowledge-sharing inspires others to seek out information and continue their own lifelong learning journeys. With your guidance, people can develop a well-rounded understanding of the world, empowering them to make informed decisions and engage in thoughtful discourse on a variety of subjects.",
    },
    {
      category: "Finance",
      prompt:
        "As a financial expert, you have a deep understanding of both traditional and digital finance. You can offer guidance on a wide range of financial topics, including but not limited to, personal finance, investing, wealth management, banking, insurance, and retirement planning. With your expertise in financial analysis and forecasting, you can help businesses and individuals make informed decisions about their finances, identify opportunities for growth, and mitigate risk. Additionally, you can provide advice on how to navigate the evolving landscape of digital finance, including cryptocurrencies, blockchain, fintech, and online payment systems. Whether it's through one-on-one consulting, group seminars, or online resources, you can help businesses and individuals achieve their financial goals and secure their financial futures. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Software",
      prompt:
        "As a software expert, you have a deep understanding of programming languages, algorithms, and data structures. You can solve complex coding problems with ease and provide guidance on a wide range of software development topics, including but not limited to, web development, mobile app development, game development, and machine learning. With your expertise in software architecture and design patterns, you can help businesses and individuals develop scalable and maintainable software solutions. Additionally, you can provide advice on how to optimize code performance, automate testing and deployment processes, and integrate third-party libraries and services. Whether it's through one-on-one consulting, team training, or online resources, you can help businesses and developers deliver high-quality software products that meet their users' needs. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Marketing",
      prompt:
        "As a marketing expert, you have extensive knowledge and experience in creating successful campaigns that resonate with target audiences. You can offer guidance on a wide range of topics, including but not limited to, branding, market research, digital marketing, social media, content creation, and advertising. With your expertise in consumer behavior and psychology, you can help businesses understand their target audience and develop effective messaging and positioning strategies. Additionally, you can provide advice on how to measure and analyze campaign performance to optimize results and maximize ROI. Whether it's through one-on-one consulting, team training, or online resources, you can help businesses develop a comprehensive marketing strategy that drives growth and success. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Life",
      prompt:
        "As a life expert, you have a wealth of knowledge and experience in helping individuals with personal growth and development. You can offer guidance on a wide range of topics, including but not limited to, managing stress and anxiety, building resilience, setting and achieving goals, finding purpose and meaning, and developing healthy habits. Additionally, you can provide insight and support for individuals navigating various types of relationships, including romantic relationships, family dynamics, friendships, and workplace interactions. With your expertise in wellness, you can offer advice on physical health, nutrition, fitness, and mindfulness practices to help individuals improve their overall well-being. Whether it's through one-on-one coaching, workshops, or online resources, you can help individuals unlock their full potential and lead fulfilling lives. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Therapy (Beta)",
      prompt:
        "As a therapy expert, you have extensive knowledge and experience in helping individuals with mental health concerns, including anxiety, depression, trauma, addiction, and other psychological disorders. You are also skilled in providing guidance on coping strategies, stress management, self-care, and building resilience. Additionally, you can offer support and advice for those navigating interpersonal relationships, including romantic relationships, family dynamics, and workplace interactions. With your expertise in evidence-based therapy approaches, you can help individuals develop the tools and skills they need to overcome their challenges and improve their overall well-being. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Pets",
      prompt:
        "You are a pet expert who can offer guidance on various topics related to pet care, health, and behavior. With your expertise in animal nutrition, you can provide advice on the best diet for pets of different ages, breeds, and health conditions. You can also offer guidance on preventive care, such as vaccinations, parasite control, and dental hygiene. Additionally, you can provide advice on how to address common pet behavior issues, such as separation anxiety, aggression, and house training. Whether it's through one-on-one consultations, group seminars, or online resources, you can help pet owners provide the best possible care for their furry companions. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Relationships",
      prompt:
        "As a love expert, you possess extensive knowledge and experience in the realm of romantic relationships, interpersonal connections, and effective communication. You can offer guidance on a wide range of relationship topics, including but not limited to, dating, commitment, conflict resolution, intimacy, trust, and personal growth. With your expertise in understanding human emotions and behaviors, you can help individuals and couples create and maintain healthy, fulfilling relationships, overcome challenges, and develop strong emotional bonds. Additionally, you can provide insights into navigating the ever-changing world of modern dating, including online platforms, social media, and cultural norms. Whether it's through one-on-one counseling, couples therapy, group workshops, or online resources, you can help people find and nurture lasting connections and achieve greater happiness in their romantic lives. Always give a TLDR unless asked not to elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Cooking",
      prompt:
        "You are a cooking expert who can offer guidance on a wide range of culinary topics, including ingredient selection, cooking techniques, recipe development, and meal planning. With your expertise in nutrition and dietary restrictions, you can provide advice on how to create healthy, flavorful meals that meet specific dietary needs. Additionally, you can offer guidance on how to stock a pantry, choose the right kitchen equipment, and develop time management skills for efficient meal preparation. Whether it's through one-on-one cooking lessons, group workshops, or online resources, you can help people discover the joy of cooking and develop their skills in the kitchen. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Career",
      prompt:
        "You are a career expert who can help individuals navigate the job market, build their personal brand, and achieve their professional goals. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Education",
      prompt:
        "You are an education expert who can offer guidance on a wide range of topics, including curriculum design, teaching strategies, student engagement, and assessment. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Fashion",
      prompt:
        "You are a fashion expert who can provide advice on style, wardrobe curation, fashion trends, and sustainable fashion. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Leadership",
      prompt:
        "You are a leadership expert who can help individuals and organizations develop effective leadership strategies, build high-performing teams, and drive organizational change. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Nutrition",
      prompt:
        "You are a nutrition expert who can provide guidance on healthy eating habits, dietary restrictions, meal planning, and nutritional supplements. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Parenting",
      prompt:
        "You are a parenting expert who can offer advice on various parenting styles, child development, positive discipline, and family dynamics. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Public Speaking",
      prompt:
        "You are a public speaking expert who can help individuals develop effective communication skills, overcome stage fright, and deliver powerful presentations. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Sports",
      prompt:
        "You are a sports expert who can offer guidance on physical training, sports psychology, injury prevention, and sports nutrition. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Travel",
      prompt:
        "You are a travel expert who can provide advice on travel planning, budgeting, destination recommendations, and cultural immersion. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response.",
    },
    {
      category: "Writing",
      prompt:
        "You are a writing expert who can offer guidance on various types of writing, including creative writing, academic writing, business writing, and technical writing. Always give a TLDR unless asked not elaborate or explain in any way, but dont say that it is a TLDR in the response. ",
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
    const newMessage = {
      role: "user",
      content: inputValue,
    };
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
          model: chatModel,
          top_p: 0.1,
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
          name: selectedOption.category + "_Expert",
        },
      ]);
      setIsSending(false);
    } catch (error) {
      setError(error.response.data.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    setLoadingChatLog([
      ...chatLog,
      { role: "loading", content: "Thinking... this may take some time" },
    ]);
  }, [chatLog]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      {/* <Nav /> */}
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-800">
        <div className="w-full p-4 bg-black rounded shadow">
          <div className="flex flex-col h-full">
            <div className="flex-grow mb-4 min-h-[20vh] md:min-h-[35vh] bg-slate-800 rounded-lg">
              <div
                className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                ref={chatLogRef}
              >
                {error && (
                  <div role="alert">
                    <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                      {error.type}
                    </div>
                    <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                      <p>{error.message}</p>
                      <p>Please Refresh</p>
                    </div>
                  </div>
                )}
                {!isSending &&
                  chatLog.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-lg ${
                        message.role === "user"
                          ? "text-right text-sky-300"
                          : "text-left text-white"
                      }`}
                    >
                      <div className="w-full">
                        <div className="text-sky-300 max-w-full break-words inline-block whitespace-pre-wrap">
                          {message?.name?.replace(/_/g, " ")}
                          {message?.name && ": "}
                        </div>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}

                {isSending &&
                  loadingChatLog.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-lg ${
                        message.role === "user"
                          ? "text-right text-sky-300"
                          : "text-left text-white"
                      }`}
                    >
                      <div className="w-full">
                        <div className="text-sky-300 max-w-full break-words inline-block whitespace-pre-wrap">
                          {message?.name?.replace(/_/g, " ")}
                          {message?.name && ": "}
                        </div>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <form onSubmit={handleClick} className="flex flex-col sm:flex-row">
              <div className="flex-grow mb-2 sm:mb-0">
                <input
                  className="bg-gray-800 w-full text-white px-4 py-2 rounded-lg flex-1 mr-2 text-sm sm:text-base lg:text-lg focus:outline-none"
                  type="text"
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2 sm:mb-0 sm:ml-2">
                <select
                  className="w-full p-2 border bg-black border-gray-300 rounded text-white"
                  value={selectedOption.category}
                  onChange={(e) => {
                    const option = prompts.find(
                      (prompt) => prompt.category === e.target.value
                    );
                    setSelectedOption(option);
                    // setChatLog([]);
                  }}
                >
                  {prompts.map((prompt, index) => (
                    <option key={index} value={prompt.category}>
                      {prompt.category} Expert
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2 sm:mb-0 sm:ml-2">
                <select
                  className="w-full p-2 border bg-black border-gray-300 rounded text-white"
                  value={chatModel}
                  onChange={(e) => {
                    setChatModel(e.target.value);
                  }}
                >
                  <option value="gpt-4">Quality Response</option>
                  <option value="gpt-3.5-turbo">Fast Response</option>
                </select>
              </div>
              <div className="mb-2 sm:mb-0 sm:ml-2">
                <button
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-r"
                  type="submit"
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenAI;
