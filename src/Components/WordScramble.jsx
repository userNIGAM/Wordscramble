import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const scrambleWord = (word) => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const fetchRandomWord = async () => {
  try {
    const response = await fetch("https://random-word-api.herokuapp.com/word");
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching word:", error);
    return "default"; // Fallback word in case of an error
  }
};

const fetchWordHint = async (word) => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    const definition = data[0]?.meanings[0]?.definitions[0]?.definition;
    if (definition) return definition;
  } catch (error) {
    console.error("Error fetching definition:", error);
  }

  // If no definition, try getting synonyms
  try {
    const response = await fetch(`https://api.datamuse.com/words?ml=${word}`);
    const data = await response.json();
    if (data.length > 0) return `Similar word: ${data[0].word}`;
  } catch (error) {
    console.error("Error fetching synonyms:", error);
  }

  return "No hint available.";
};

const WordScramble = () => {
  const [originalWord, setOriginalWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    getNewWord();
  }, []);

  const getNewWord = async () => {
    const newWord = await fetchRandomWord();
    setOriginalWord(newWord);
    setScrambled(scrambleWord(newWord));
    setHint("");
  };

  const checkGuess = () => {
    if (userGuess.toLowerCase() === originalWord) {
      setMessage("🎉 Correct! Well done.");
    } else {
      setMessage("❌ Incorrect! Try again.");
    }
  };

  const nextWord = () => {
    setUserGuess("");
    setMessage("");
    getNewWord();
  };

  const showHint = async () => {
    const hintData = await fetchWordHint(originalWord);
    setHint(hintData);
  };

  return (
    <div
      className="container d-flex flex-column align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      <div
        className="card shadow-lg p-4 text-center bg-dark text-light"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="mb-3">Word Scramble Game</h2>
        <h3 className="text-warning fw-bold mb-3">{scrambled}</h3>
        <input
          type="text"
          className="form-control mb-3 text-center bg-secondary text-light border-light"
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          placeholder="Your guess..."
        />
        <div className="d-flex gap-2">
          <button className="btn btn-success w-50" onClick={checkGuess}>
            Check
          </button>
          <button className="btn btn-warning w-50" onClick={nextWord}>
            Next Word
          </button>
        </div>
        <button className="btn btn-info w-100 mt-3" onClick={showHint}>
          Hint
        </button>
        {hint && <p className="mt-3 fw-bold text-light">Hint: {hint}</p>}
        {message && <p className="mt-3 fw-bold text-info">{message}</p>}
      </div>
    </div>
  );
};

export default WordScramble;
