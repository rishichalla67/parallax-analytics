import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav';

const OpenAI = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions',
        {
          prompt: inputText,
          max_tokens: 2048,
          model: "text-davinci-003"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer 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`,
          },
        }
      );
      setOutputText(response.data.choices[0].text);
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  return (
    <>
        <Nav/>
        <div className="p-4 h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <h1 className="text-2xl font-bold text-white mb-4">Ask Anything...</h1>
        <form onSubmit={handleSubmit}>
            <textarea
            className="w-full p-2 rounded-lg bg-gray-100 focus:outline-none focus:bg-white"
            value={inputText}
            onChange={handleChange}
            />
            <button
            className="bg-red-200 hover:bg-blue-700 text-black font-bold py-2 px-4 mt-4 rounded-full"
            type="submit"
            disabled={isLoading}
            >
            Submit
            </button>
        </form>
        {outputText && (
            <div className="mt-8">
            <label className="block font-bold text-white mb-2">
                Response:
            </label>
            <p className="p-2 rounded-lg bg-gray-100">{outputText}</p>
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
