import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Nav from "../Nav";

const OpenAI = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unformattedResponse, setUnformattedResponse] = useState("");
  const [selectedOption, setSelectedOption] = useState({
    category: "Finance",
    prompt:
      "You are a financial expert in all frontiers of finance, digital and traditional.",
  });

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const clearInput = (event) => {
    setInputText("");
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  };

  const CopyIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-copy"
    >
      <rect x="9" y="9" width="10" height="10" rx="" ry="" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const prompts = [
    {
      category: "Finance",
      prompt:
        "You are a financial expert in all frontiers of finance, digital and traditional.",
    },
    {
      category: "Software",
      prompt:
        "You are a software expert who can solve complex coding problems with ease.",
    },
    {
      category: "Marketing",
      prompt:
        "You are a marketing expert who knows how to connect with audiences and create successful campaigns.",
    },
    {
      category: "Life",
      prompt:
        "You are a life expert who can provide guidance on personal growth, wellness, and relationships.",
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
    await handleSubmit(e);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setInputValue('');
    setIsLoading(true);
    setError(null);
    const newMessage = { role: "user", content: inputValue };
    const promptMessage = {
      role: "system",
      content: `${selectedOption.prompt}`,
    };
    const messages = [
      ...chatLog,
      promptMessage,
      newMessage,
    ];
    
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
      setChatLog([...chatLog, newMessage, {role: response.data.choices[0].message.role, content: response.data.choices[0].message.content}]);
      console.log([...chatLog, newMessage, {role: response.data.choices[0].message.role, content: response.data.choices[0].message.content}])
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  const [chatLog, setChatLog] = useState([]);
const [inputValue, setInputValue] = useState('');
const chatLogRef = useRef(null);

  useEffect(() => {
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [chatLog]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(chatLog.map((message) => message.text).join('\n'));
  };

  return (
    // <>
    //   <Nav />
    //   <div className="p-4 min-h-full h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
    //     <h1 className="text-2xl font-bold text-white mb-4">Ask Anything...</h1>
    //     <div className="relative inline-block text-left">
    //       <div className="pb-2">
    //         <span className="rounded-md shadow-sm">
    //           <button
    //             type="button"
    //             className="inline-flex text-opacity-70 justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-slate-600 text-sm font-medium text-white hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
    //             id="options-menu"
    //             aria-haspopup="true"
    //             aria-expanded="true"
    //             onClick={() => setIsOpen(!isOpen)}
    //           >
    //             <span className="mr-2">
    //               Selected Expert: <b>{selectedOption.category}</b>
    //             </span>
    //             <svg
    //               className="-mr-1 ml-2 h-5 w-5"
    //               xmlns="http://www.w3.org/2000/svg"
    //               viewBox="0 0 20 20"
    //               fill="currentColor"
    //               aria-hidden="true"
    //             >
    //               <path
    //                 fillRule="evenodd"
    //                 d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
    //                 clipRule="evenodd"
    //               />
    //             </svg>
    //           </button>
    //         </span>
    //       </div>

    //       {isOpen && (
    //         <div
    //           className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-600 text-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    //           role="menu"
    //           aria-orientation="vertical"
    //           aria-labelledby="options-menu"
    //         >
    //           <div className="py-1" role="none">
    //             {prompts.map((option) => (
    //               <div
    //                 key={option.category}
    //                 className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
    //                 role="menuitem"
    //                 onClick={() => {
    //                   setSelectedOption(option);
    //                   setIsOpen(false);
    //                 }}
    //               >
    //                 <div className="rounded-full bg-gray-200 mr-2 h-2 w-2"></div>
    //                 <span className="flex-1">{option.category}</span>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       )}
    //     </div>

    //     <form onSubmit={handleSubmit}>
    //       <textarea
    //         className="w-full p-2 rounded-lg text-white bg-slate-600 focus:outline-none "
    //         value={inputText}
    //         onChange={handleChange}
    //         onKeyDown={(e) => {
    //           if (e.key === "Enter") {
    //             handleSubmit(e);
    //           }
    //         }}
    //       />
    //       {!isLoading && (
    //         <div>
    //           <button
    //             className="bg-red-200 hover:bg-blue-700 text-black font-bold py-2 px-4 mt-4 rounded-full"
    //             type="submit"
    //             disabled={isLoading}
    //           >
    //             Submit
    //           </button>
    //         </div>
    //       )}

    //       {isLoading && (
    //         <div className="mt-8 flex items-center justify-center">
    //           <div className="w-6 h-6 bg-gray-800 rounded-full animate-bounce">
    //             <div className="w-3 h-3 bg-white rounded-full inline-block animate-bounce-dot"></div>
    //           </div>
    //         </div>
    //       )}
    //     </form>

    //     <button
    //       className="bg-green-200 hover:bg-blue-700 text-black font-bold py-2 px-4 mt-4 rounded-full"
    //       onClick={clearInput}
    //     >
    //       Clear Input
    //     </button>
    //     {outputText && (
    //       <div className="mt-8">
    //         <label className="block font-bold text-white mb-2">Response:</label>
    //         <div className="max-h-fit max-w-fit overflow-auto">
    //           <p
    //             className="min-w-fit p-2 rounded-lg bg-gray-800 text-white text-left"
    //             dangerouslySetInnerHTML={{ __html: outputText }}
    //           />
    //           <button
    //             className="hover:bg-gradient-to-r from-indigo-900 via-indigo-3500 to-indigo-900 bg-slate-500 w-full top-0 right-0 p-2 text-white"
    //             onClick={() => copyToClipboard(unformattedResponse)}
    //           >
    //             Copy
    //           </button>
    //         </div>
    //       </div>
    //     )}

    //     {error && (
    //       <div className="mt-8 text-red-500">
    //         An error occurred: {error.message}
    //       </div>
    //     )}
    //   </div>
    // </>


    <>
    <Nav/>
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
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-600 text-white ring-1 ring-black ring-opacity-5 focus:outline-none"
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
      <div className="mx-2 bg-gray-900 p-4 md:p-8 lg:p-12 flex flex-col justify-between h-[80dvh] sm:h-[90dvh]" >
    <div className="h-90% overflow-y-auto" ref={chatLogRef}>
      {chatLog.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? 'justify-end' : 'justify-start'
          } mb-2`}
        >
          <div
            className={`p-2 rounded-lg ${
              message.role === "user" ? 'bg-blue-500' : 'bg-gray-700'
            } text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
    
    <div className="flex items-center">
    {/* <button
        className="bg-gray-700 text-white mr-2 px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg"
        onClick={handleCopyClick}
      >
        Copy
      </button> */}
      <input
  className="bg-gray-800 text-white px-4 py-2 rounded-lg flex-1 mr-2 text-sm sm:text-base lg:text-lg focus:outline-none"
  type="text"
  placeholder="Type your message here..."
  value={inputValue}
  onChange={handleInputChange}
/>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 text-sm sm:text-base lg:text-lg"
        onClick={handleClick}
      >
        Send
      </button>
      
    </div>
  </div>
</div>
    </>
  );
};




export default OpenAI;
