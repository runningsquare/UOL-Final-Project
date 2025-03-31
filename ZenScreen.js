import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Vibration } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import React, {useState, useEffect} from "react";
import WordBlocks from "./WordBlocks.js";
import GameOverModal from "./GameOverModal.js";
import { updateStats, PROGRESSION_MILESTONES } from "./statsUtils.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ZenScreen = ({navigation}) => {

    const [rowsCount, setRowsCount] = useState(11); // Start with 8 rows
    const [fallAnimations, setFallAnimations] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [completedRows, setCompletedRows] = useState([]);
    const [showGameOverModal, setShowGameOverModaL] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [wordsFound, setWordsFound] = useState([]); // Track words found for stats update
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [settings, setSettings] = useState({
        vibrationEnabled: true,
        animationsEnabled: true,
        darkMode: false
    });

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem("@ScrambleTower_settings");
                if (savedSettings) {
                    setSettings(JSON.parse(savedSettings));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };
        loadSettings();
    }, []);

    // Create animations for starting rows
    useEffect(() => {
        const initialAnimations = Array.from({ length: rowsCount }, () =>
            settings.animationsEnabled ? new Animated.Value(-600) : new Animated.Value(0)
        );
        setFallAnimations(initialAnimations);
    }, [settings.animationsEnabled]);

    // Initialise animations for the initial rows
    useEffect(() => {
        if (settings.animationsEnabled) {
            fallAnimations.forEach((animation, index) => {
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 1000,
                    delay: index * 200,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            // Immediately set all animations to their final position
            fallAnimations.forEach(animation => {
                animation.setValue(0);
            });
        }
    }, [fallAnimations, settings.animationsEnabled]); 

    // Initialise animations when rowsCount changes
    useEffect(() => {
        if (rowsCount > 11) {
            // Create new fall animation for the latest row
            const newAnimation = new Animated.Value(settings.animationsEnabled ? -600 : 0);

            setFallAnimations((prevAnimations) => {
                const updatedAnimations = [...prevAnimations, newAnimation]; // New row on top
                if (!settings.animationsEnabled) {
                    newAnimation.setValue(0); // Immediately set to final position
                }
                return updatedAnimations;
            });

            if (settings.animationsEnabled) {
                Animated.timing(newAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            }
        }
    }, [rowsCount, settings.animationsEnabled]);

    // Game over handler
    const handleGameOver = () => {
        if (settings.vibrationEnabled) {
            Vibration.vibrate(300);
        }
        setGameOver(true);
        setShowGameOverModaL(true);
    };

    // Handle correctly unscrambled row
    const handleCorrectUnscramble = (rowIndex, completedWord) => {
        // Increment score
        setScore((prevScore) => prevScore + 1);

        // Update completed and unscrambled rows
        setCompletedRows((prevCompletedRows) => [...prevCompletedRows, rowIndex]);

        // Add a new row
        setRowsCount((prevCount) => prevCount + 1);

        // Track words found
        setWordsFound(prev => [...prev, completedWord.toLowerCase()]);

        // Trigger vibration if enabled
        if (settings.vibrationEnabled) {
            Vibration.vibrate(100); // Vibrate for 100ms
        }
    };

    // Handle open help button
    const handleHelpOpen = () => {
        setShowHelpModal(true);
    };

    // Handle close help button
    const handleHelpClose = () => {
        setShowHelpModal(false);
    };

    // Update styles based on dark mode
    const dynamicStyles = getDynamicStyles(settings.darkMode);

    return (
        <View style={dynamicStyles.container}>

            {/** Header */}
            <View 
                style={dynamicStyles.header}
            >
                <Text style={dynamicStyles.headerTitle}>ZEN</Text>
                <Text style={dynamicStyles.headerText}>Score: {score}</Text>
            </View>

            {/** Main */}
            <View style={dynamicStyles.main}>
                {Array.from({ length: rowsCount })
                    .map((_, index) => index) // Create array of indices
                    .reverse()
                    .filter((index) => !completedRows.includes(index)) // Filter out completed rows
                    .map((index) => (
                        <Animated.View
                            key={index}
                            style={{
                                transform: [
                                    {
                                        translateY: fallAnimations[index] || new Animated.Value(0)
                                    }
                                ],
                                zIndex: -1
                            }}
                        >
                            <WordBlocks onCorrectUnscramble={(word) => handleCorrectUnscramble(index, word)} />
                        </Animated.View>
                    ))
                }
            </View>

            {/** Bottom Tools */}
            <View style={dynamicStyles.bottomTools}>
                <TouchableOpacity style={dynamicStyles.toolButton} onPress={handleGameOver}>
                    <Icon name="check" size={25} color={"black"} />
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.toolButton} onPress={() => navigation.navigate("Home")}>
                    <Icon name="home" size={30} color={"black"} />
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.toolButton} onPress={handleHelpOpen}>
                    <Icon name="question-circle" size={30} color={"black"} />
                </TouchableOpacity>
            </View>

            {/** Help Modal */}
            <Modal transparent={true} visible={showHelpModal}>
                <View style={dynamicStyles.pauseOverlay}>
                    <View style={dynamicStyles.translucentBackground} />
                    <View style={dynamicStyles.helpModalContent}>
                        <Text style={dynamicStyles.helpModalTitle}>How to Play</Text>
                        <Text style={dynamicStyles.helpModalText}>
                            1. Unscramble the words in each row.
                            {"\n"}
                            2. Tap on the letters to arrange them.
                            {"\n"}
                            3. Spend as much time as you need and relax.
                            {"\n"}
                            4. The game ends when you press the check button at the screen bottom left.
                        </Text>
                        <TouchableOpacity style={dynamicStyles.closeHelpBtn} onPress={handleHelpClose}>
                            <Text style={dynamicStyles.closeHelpBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/** Game Over Modal */}
            <GameOverModal
                visible={showGameOverModal}
                score={score}
                onPlayAgain={async () => {
                    const achievements = await updateStats("Zen", score, wordsFound);
                    setUnlockedAchievements(achievements);
                    setShowGameOverModaL(false);
                    if (achievements.length > 0) {
                        setShowAchievementModal(true);
                    } else {
                        navigation.replace("Zen");
                    }
                }}
                onHome={async () => {
                    const achievements = await updateStats("Zen", score, wordsFound);
                    setUnlockedAchievements(achievements);
                    setShowGameOverModaL(false);
                    if (achievements.length > 0) {
                      setShowAchievementModal(true);
                    } else {
                      navigation.navigate("Home");
                    }
                }}
            />

            {/** Show Achievement Modal */}
            <Modal transparent={true} visible={showAchievementModal}>
                <View style={dynamicStyles.achievementOverlay}>
                    <View style={dynamicStyles.achievementModal}>
                        <Text style={dynamicStyles.achievementTitle}>🏆 Milestone Unlocked!</Text>
                        {unlockedAchievements && unlockedAchievements.map((achievement, index) => {
                            const milestone = PROGRESSION_MILESTONES.find(m => m.name === achievement);
                            return (
                                <View key={index} style={dynamicStyles.achievementItem}>
                                    <Text style={dynamicStyles.achievementName}>{milestone?.icon} {milestone?.name}</Text>
                                    <Text style={dynamicStyles.achievementText}>{milestone?.description}</Text>
                                    <Text style={dynamicStyles.achievementReward}>Reward: {milestone?.reward}</Text>
                                </View>
                            );
                        })}
                        <TouchableOpacity 
                            style={dynamicStyles.achievementButton}
                            onPress={() => {
                            setShowAchievementModal(false);
                                navigation.navigate("Home");
                            }}
                        >
                            <Text style={dynamicStyles.achievementButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <StatusBar style="auto" />

        </View>
    );
};

const getDynamicStyles = (darkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkMode ? "#333333" : "#669999",
        zIndex: 1
    },
    header: {
        flex: 0.13,
        width: "100%",
        backgroundColor: darkMode ? "#444444" : "#669999",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottomWidth: 2,
        borderBottomColor: darkMode ? "#555555" : "#447777",
        paddingBottom: 5
    },
    headerTitle: {
        fontFamily: "PlayfairDisplay_Bold",
        fontSize: 40,
        fontWeight: "bold",
        color: darkMode ? "#ffffff" : "#000000"
    },
    headerText: {
        fontFamily: "Montserrat_Bold",
        fontSize: 15,
        fontWeight: "bold",
        color: darkMode ? "#ffcc66" : "#ffcc66"
    },
    main: {
        flex: 0.79,
        backgroundColor: darkMode ? "#222222" : "#ffcc66",
        justifyContent: "flex-end",
        zIndex: -2
    },
    bottomTools: {
        flex: 0.08,
        backgroundColor: darkMode ? "#444444" : "#669999",
        width: "100%",
        borderTopWidth: 2,
        borderTopColor: darkMode ? "#555555" : "#447777",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },
    toolButton: {
        alignItems: "center",
        justifyContent: "center"
    },
    pauseOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    translucentBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    helpModalContent: {
        width: "80%",
        backgroundColor: darkMode ? "#444444" : "#ffcc66",
        borderRadius: 10,
        padding: 20,
        alignItems: "center"
    },
    helpModalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: darkMode ? "#ffffff" : "#000000",
        marginBottom: 10
    },
    helpModalText: {
        fontSize: 16,
        color: darkMode ? "#ffffff" : "#000000",
        marginBottom: 20
    },
    closeHelpBtn: {
        backgroundColor: "#669999",
        padding: 10,
        borderRadius: 5,
        width: "100%",
        alignItems: "center"
    },
    closeHelpBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    achievementOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)"
    },
    achievementModal: {
        backgroundColor: "#ffcc66",
        borderRadius: 15,
        padding: 20,
        width: "80%",
        alignItems: "center"
    },
    achievementTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#447777",
        marginBottom: 15,
        textAlign: "center"
    },
    achievementItem: {
        marginBottom: 15,
        width: "100%"
    },
    achievementName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#669999",
        marginBottom: 5
    },
    achievementText: {
        fontSize: 14,
        color: "#447777",
        marginBottom: 3
    },
    achievementReward: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#669999"
    },
    achievementButton: {
        backgroundColor: "#669999",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center"
    },
    achievementButtonText: {
        color: "#fff",
        fontWeight: "bold"
    }
});

export default ZenScreen;
