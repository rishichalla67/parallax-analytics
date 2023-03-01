import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Nav";

const OpenAI = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const formatResponse = (text) => {
    let formattedText = text;

    // Add line breaks for paragraphs
    formattedText = formattedText.replace(/(\r\n|\n|\r)/gm, "<div/><div/>");

    // Add syntax highlighting for code snippets
    formattedText = formattedText.replace(
      /```(.*?)```/g,
      "<pre><code>$1</code></pre>"
    );

    return formattedText;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          messages: [{ role: "user", content: inputText }],
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
      const formattedResponse = formatResponse(response.data.choices[0].text);
      setOutputText(formattedResponse);
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Nav />
      <div className="p-4 h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <h1 className="text-2xl font-bold text-white mb-4">Ask Anything...</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 rounded-lg bg-gray-100 focus:outline-none focus:bg-white"
            value={inputText}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
          />
          {!isLoading && (
            <div>
              <button
                className="bg-red-200 hover:bg-blue-700 text-black font-bold py-2 px-4 mt-4 rounded-full"
                type="submit"
                disabled={isLoading}
              >
                Submit
              </button>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-800 rounded-full animate-bounce">
                <div className="w-3 h-3 bg-white rounded-full inline-block animate-bounce-dot"></div>
              </div>
            </div>
          )}
        </form>

        <button
          className="bg-green-200 hover:bg-blue-700 text-black font-bold py-2 px-4 mt-4 rounded-full"
          onClick={clearInput}
        >
          Clear Input
        </button>
        {outputText && (
          <div className="mt-8">
            <label className="block font-bold text-white mb-2">Response:</label>
            <div className="relative">
              <p
                className="p-2 rounded-lg bg-gray-800 text-white text-left"
                dangerouslySetInnerHTML={{ __html: outputText }}
              />
              <button
                className="hover:bg-gradient-to-r from-indigo-900 via-indigo-3500 to-indigo-900 bg-slate-500 top-0 right-0 p-2 text-white"
                onClick={() => copyToClipboard(outputText)}
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-8 text-red-500">
            An error occurred: {error.message}
          </div>
        )}
      </div>
    </>
  );
};

export default OpenAI;
