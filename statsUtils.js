import AsyncStorage from "@react-native-async-storage/async-storage";

// Define progression milestones
export const PROGRESSION_MILESTONES = [
    {
        name: "Word Novice",
        description: "Unscramble 10 words",
        icon: "📖",
        threshold: 10,
        reward: "Bronze badge"
    },
    {
        name: "Vocabulary Builder",
        description: "Unscramble 50 words",
        icon: "📚",
        threshold: 50,
        reward: "New word set"
    },
    {
        name: "Lexicon Master",
        description: "Unscramble 200 words",
        icon: "🏆",
        threshold: 200,
        reward: "Gold badge"
    }
];

// Initialize stats if they doesn't exist yet
export const initStats = async () => {
        const defaultStats = {
        totalWords: 0,
        highScores: { tower: 0, rush: 0, zen: 0 },
        newWords: [],
        wordDictionary: {},
        achievements: [],
        sessionHistory: []
    };

    try {
        const existingStats = await AsyncStorage.getItem("@ScrambleTower_stats");
        if (!existingStats) {
            await AsyncStorage.setItem("@ScrambleTower_stats", JSON.stringify(defaultStats));
        }
    } catch (error) {
        console.error("Error initializing stats:", error);
    }
};
  
// Update statistics after game
export const updateStats = async (gameMode, score, wordsFound) => {
    try {
        // Get latest statistics
        const statsString = await AsyncStorage.getItem("@ScrambleTower_stats");
        if (!statsString) return;
        
        const stats = JSON.parse(statsString);
        
        // // Initialize word dictionary if it doesn't exist
        if (!stats.wordDictionary) {
        stats.wordDictionary = {};
        }

        // Add new words with their meanings
        for (const word of wordsFound) {
            if (!stats.wordDictionary[word]) {
                // Fetch definition from Datamuse
                const definition = await fetchDatamuseDefinition(word);
                stats.wordDictionary[word] = definition;
            }
        }
      
        // Update total words found and game mode high score
        stats.totalWords += wordsFound.length;
        
        if (score > stats.highScores[gameMode.toLowerCase()]) {
        stats.highScores[gameMode.toLowerCase()] = score;
        }
    
        // Add new words found
        stats.newWords = [...new Set([...stats.newWords, ...wordsFound])]; // Removes duplicates

        // Add session to history
        stats.sessionHistory.unshift({
            mode: gameMode,
            score,
            timestamp: Date.now(),
            wordsFound
        });

        // Keep only last 10 sessions
        if (stats.sessionHistory.length > 10) {
            stats.sessionHistory = stats.sessionHistory.slice(0, 10);
        }

        // Check for achievements and milestones
        const newAchievements = await checkAchievements(stats);
        if (newAchievements.length > 0) {
            stats.achievements = [...stats.achievements, ...newAchievements];
        }   
            
        await AsyncStorage.setItem("@ScrambleTower_stats", JSON.stringify(stats));

        return newAchievements || [];
    } catch (error) {
      console.error("Error updating stats:", error);
      return [];
    }
};

// Resets stats on app reload (for debugging)
export const clearStats = async () => {
    const defaultStats = {
        totalWords: 0,
        highScores: { tower: 0, rush: 0, zen: 0 },
        newWords: [],
        accuracy: 0,
        achievements: [],
        sessionHistory: []
    };

    try {
        await AsyncStorage.setItem("@ScrambleTower_stats", JSON.stringify(defaultStats));
    } catch (error) {
        console.error("Error resetting stats:", error);
    }
};

// Helper function to check for achievements
const checkAchievements = async (stats) => {
    const achievements = [];

    // Check progression milestones
    PROGRESSION_MILESTONES.forEach(milestone => {
        if (stats.totalWords >= milestone.threshold && !stats.achievements.includes(milestone.name)) {
            achievements.push(milestone.name);
        }
    });

    // Keep existing achievements
    if (stats.highScores.tower >= 50 && !stats.achievements.includes("Tower Champion")) {
        achievements.push("Tower Champion");
    }

    return achievements;
};

// Helper function to fetch word definitions from Datamuse
const fetchDatamuseDefinition = async (word) => {
    try {
        const response = await fetch(`https://api.datamuse.com/words?sp=${word}&md=d`);
        const data = await response.json();
        
        // Datamuse returns definitions in a "defs" array
        if (data[0]?.defs) {
            // Format: "def1\def2" - take first definition and clean it
            const firstDef = data[0].defs[0].split("\t")[1];
            return firstDef || "Definition not found";
        }
        return "Definition not available";
    } catch (error) {
        console.error("Error fetching definition:", error);
        return "Definition not available";
    }
};