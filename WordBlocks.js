// Source: API from Datamuse

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const WordBlocks = ({ onCorrectUnscramble, difficultyLevel=0 }) => {

  // Initialise states
  const [word, setWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [rows, setRows] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Fetch and scramble word with difficulty level
  useEffect(() => {
    const fetchWord = async () => {
      const fetchedWord = await getRandomWord(difficultyLevel);
      setWord(fetchedWord);
      setScrambledWord(scrambleWord(fetchedWord, difficultyLevel));
    };
    fetchWord();
  }, [difficultyLevel]);

  // Split words into rows of 5 characters
  useEffect(() => {
    const rowLength = 5;
    const tempRows = [];

    for (let i = 0; i < scrambledWord.length; i += rowLength) {
      tempRows.push(scrambledWord.slice(i, i + rowLength));
    }

    setRows(tempRows);
  }, [scrambledWord]);

  // Handle swapping letter blocks in the same row
  const handlePress = (rowIndex, letterIndex) => {
    if (selectedBlock === null) {
      // Select the block
      setSelectedBlock({ rowIndex, letterIndex });
    } else {
      // Swap blocks in the same row
      if (selectedBlock.rowIndex === rowIndex) {
        const newRows = [...rows];
        const chars = newRows[rowIndex].split("");

        // Swap letters
        const temp = chars[selectedBlock.letterIndex];
        chars[selectedBlock.letterIndex] = chars[letterIndex];
        chars[letterIndex] = temp;

        newRows[rowIndex] = chars.join("");
        setRows(newRows);

        // Check if the row is correctly unscrambled
        if (newRows[rowIndex] == word) {
            onCorrectUnscramble(word); // Pass the completed word back
        }

        // Clear selection
        setSelectedBlock(null);
      } else {
        // Replace selection if in a different row
        setSelectedBlock({ rowIndex, letterIndex });
      }
    }
  };

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.rowContainer}>
          {row.split("").map((letter, letterIndex) => (
            <View
              key={letterIndex}
              style={[
                styles.letterBox,
                {
                  borderColor:
                    selectedBlock &&
                    selectedBlock.rowIndex === rowIndex &&
                    selectedBlock.letterIndex === letterIndex
                      ? "yellow"
                      : undefined
                },
              ]}
            >
              <TouchableOpacity
                style={styles.touchArea}
                onPress={() => handlePress(rowIndex, letterIndex)}
              >
                <Text style={styles.letter}>{letter.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};


// Fetch random word
const getRandomWord = async (difficultyLevel = 0) => {
  try {
    // Define difficulty parameters
    const difficultySettings = [
      { max: 1000, topics: "common" },    // Easy - common words
      { max: 5000, topics: "general" },   // Medium
      { max: 10000, topics: "obscure" },  // Hard
      { max: 100000, topics: "challenging" } // Very hard
    ];
    
    // Select settings based on difficulty level (capped at 3)
    const { max, topics } = difficultySettings[Math.min(difficultyLevel, 3)];
    
    // First try to get words matching complexity criteria
    const complexQuery = `?sp=?????&max=${max}&v=${topics}`;
    let response = await fetch(`https://api.datamuse.com/words${complexQuery}`);
    let data = await response.json();
    
    // If no results or to ensure variety, fall back to basic query
    if (!data.length) {
      response = await fetch(`https://api.datamuse.com/words?sp=?????&max=${max}`);
      data = await response.json();
    }
    
    // Filter out any invalid words (ensure 5 letters)
    const validWords = data.filter(wordObj => 
      wordObj.word && wordObj.word.length === 5 && /^[a-z]+$/.test(wordObj.word)
    );
    
    if (validWords.length === 0) {
      console.warn("No valid words found, using fallback");
      return getFallbackWord(difficultyLevel);
    }
    
    // Words with uncommon letters for higher difficulty
    if (difficultyLevel >= 2) {
      const uncommonLetters = ["z", "q", "x", "j", "k", "v", "w", "y"];
      const complexWords = validWords.filter(wordObj => 
        uncommonLetters.some(letter => wordObj.word.includes(letter))
      );
      
      if (complexWords.length > 0) {
        return complexWords[Math.floor(Math.random() * complexWords.length)].word;
      }
    }
    
    return validWords[Math.floor(Math.random() * validWords.length)].word;
  } catch (error) {
    console.error("Error fetching word:", error);
    return getFallbackWord(difficultyLevel);
  }
};

// Fallback words by difficulty level
const getFallbackWord = (difficultyLevel) => {
  const fallbackWords = [
    ["apple", "house", "water", "music", "table"], // Easy
    ["quilt", "jumpy", "zebra", "vixen", "glyph"], // Medium
    ["fjord", "waltz", "sphinx", "rhythm", "xylem"], // Hard
    ["pyxie", "kvell", "qophs", "jiber", "xylic"] // Very hard
  ];
  const level = Math.min(difficultyLevel, 3);
  return fallbackWords[level][Math.floor(Math.random() * fallbackWords[level].length)];
};

// Scramble the word
const scrambleWord = (word, difficultyLevel = 0) => {
  const letters = word.split("");
  
  // Different scrambling algorithms based on difficulty
  switch(difficultyLevel) {
    case 0: // Easy - 1-2 adjacent swaps
      for (let i = 0; i < 2; i++) {
        const pos = Math.floor(Math.random() * (letters.length - 1));
        [letters[pos], letters[pos + 1]] = [letters[pos + 1], letters[pos]];
      }
      break;
      
    case 1: // Medium - 3-5 random swaps
      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const pos1 = Math.floor(Math.random() * letters.length);
        const pos2 = Math.floor(Math.random() * letters.length);
        [letters[pos1], letters[pos2]] = [letters[pos2], letters[pos1]];
      }
      break;
      
    default: // Hard - full shuffle with more randomness
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
  }
  
  const scrambled = letters.join("");
  return scrambled === word ? scrambleWord(word, difficultyLevel) : scrambled;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  letterBox: {
    width: 75,
    height: 75,
    marginTop: 4,
    marginHorizontal: 0.2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#669999",
    borderWidth: 4,
    borderTopColor: "#77aaaa",
    borderRightColor: "#77aaaa",
    borderBottomColor: "#447777",
    borderLeftColor: "#447777",
    borderRadius: 5
  },
  letter: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff"
  },
  touchArea: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
});

export default WordBlocks;
