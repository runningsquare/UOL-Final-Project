import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StatisticsScreen = ({ navigation }) => {

    const [stats, setStats] = useState({
        totalWords: 0,
        highScores: { tower: 0, rush: 0, zen: 0 },
        newWords: [],
        wordDictionary: {},
        achievements: [],
        sessionHistory: []
    });
    const [expandedDictionary, setExpandedDictionary] = useState(false);

    // Load stats from AsyncStorage when component mounts
    useEffect(() => {
        const loadStats = async () => {
            try {
                const savedStats = await AsyncStorage.getItem("@ScrambleTower_stats");
            if (savedStats) {
                const parsedStats = JSON.parse(savedStats);
                setStats(parsedStats);
            }
            } catch (error) {
                console.error("Error loading stats:", error);
            }
        };

        loadStats();
    }, []);

    // Format date for session history
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>STATISTICS</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
                {/* Progress Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Progress</Text>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>✨ {stats.totalWords}</Text>
                        <Text style={styles.statLabel}>Total Words Unscrambled</Text>
                    </View>
                    
                    <View style={styles.highScoreContainer}>
                        <View style={[styles.statCard, styles.highScoreCard]}>
                            <Text style={styles.statValue}>🏆 {stats.highScores.tower}</Text>
                            <Text style={styles.statLabel}>Tower Mode</Text>
                        </View>
                        <View style={[styles.statCard, styles.highScoreCard]}>
                            <Text style={styles.statValue}>⏱️ {stats.highScores.rush}</Text>
                            <Text style={styles.statLabel}>Rush Mode</Text>
                        </View>
                        <View style={[styles.statCard, styles.highScoreCard]}>
                            <Text style={styles.statValue}>🧘 {stats.highScores.zen}</Text>
                            <Text style={styles.statLabel}>Zen Mode</Text>
                        </View>
                    </View>
                </View>

                {/* Learning Metrics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Learning</Text>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>📚 {stats.newWords.length}</Text>
                        <Text style={styles.statLabel}>New Words Discovered</Text>
                    </View>
                    {/* New Words Dictionary Card */}
                    <TouchableOpacity 
                        style={styles.statCard}
                        onPress={() => setExpandedDictionary(!expandedDictionary)}
                    >
                        <View style={styles.dictionaryHeader}>
                            <Text style={styles.statValue}>📖</Text>
                            <Text style={styles.statLabel}>Words Discovered Dictionary</Text>
                            <Icon 
                                name={expandedDictionary ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color="#fff" 
                            />
                        </View>
                        
                        {expandedDictionary && (
                            <View style={styles.dictionaryContent}>
                                {stats.wordDictionary && Object.keys(stats.wordDictionary).length > 0 ? (
                                    Object.entries(stats.wordDictionary).map(([word, meaning]) => (
                                        <View key={word} style={styles.wordItem}>
                                            <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                                            <Text style={styles.meaningText}>{meaning || "No definition available"}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>No words discovered yet</Text>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <MilestoneProgress stats={stats} />

                {/* Achievements */}
                {stats.achievements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <View style={styles.achievementsContainer}>
                            {stats.achievements.map((achievement, index) => (
                                <View key={index} style={styles.achievementBadge}>
                                    <Text style={styles.achievementText}>{achievement}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Session History */}
                {stats.sessionHistory.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Sessions</Text>
                        {stats.sessionHistory.slice(0, 3).map((session, index) => (
                            <View key={index} style={styles.sessionCard}>
                                <Text style={styles.sessionMode}>{session.mode}</Text>
                                <Text style={styles.sessionScore}>Score: {session.score}</Text>
                                <Text style={styles.sessionDate}>{formatDate(session.timestamp)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const PROGRESSION_MILESTONES = [
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

const MilestoneProgress = ({ stats }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {PROGRESSION_MILESTONES.map((milestone) => (
                <View key={milestone.name} style={styles.milestoneCard}>
                    <View style={styles.milestoneHeader}>
                        <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                        <Text style={styles.milestoneName}>{milestone.name}</Text>
                        {stats.achievements.includes(milestone.name) ? (
                            <Icon name="check-circle" size={20} color="#4CAF50" />
                        ) : (
                            <Text style={styles.milestoneProgress}>
                                {Math.min(stats.totalWords, milestone.threshold)}/{milestone.threshold}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    {stats.achievements.includes(milestone.name) && (
                        <Text style={styles.milestoneReward}>Reward: {milestone.reward}</Text>
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffcc66"
    },
    header: {
        flex: 0.13,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "flex-end",
        paddingBottom: 15,
        backgroundColor: "#669999",
        borderBottomWidth: 2
    },
    backButton: {
        marginLeft: 15,
        marginRight: 45
    },
    headerText: {
        fontFamily: "PlayfairDisplay_Bold",
        fontSize: 40,
        color: "#fff"
    },
    content: {
        padding: 15
    },
    scrollView: {
        flex: 1
    },
    section: {
        marginBottom: 25
    },
    sectionTitle: {
        fontFamily: "Montserrat_Bold",
        fontSize: 20,
        marginBottom: 15,
        color: "#447777"
    },
    statCard: {
        backgroundColor: "#669999",
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        alignItems: "center"
    },
    statValue: {
        fontFamily: "Montserrat_Bold",
        fontSize: 36,
        color: "#fff",
        marginBottom: 5
    },
    statLabel: {
        fontFamily: "Montserrat_Bold",
        fontSize: 16,
        color: "#fff"
    },
    highScoreContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    highScoreCard: {
        width: "30%",
        padding: 10
    },
    achievementsContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    achievementBadge: {
        backgroundColor: "#ffcc66",
        borderColor: "#669999",
        borderWidth: 2,
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        marginBottom: 10
    },
    achievementText: {
        fontFamily: "Montserrat_Bold",
        fontSize: 12,
        color: "#447777"
    },
    sessionCard: {
        backgroundColor: "#669999",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10
    },
    sessionMode: {
        fontFamily: "Montserrat_Bold",
        fontSize: 16,
        color: "#fff"
    },
    sessionScore: {
        fontFamily: "Montserrat_Bold",
        fontSize: 14,
        color: "#ffcc66",
        marginVertical: 5
    },
    sessionDate: {
        fontFamily: "Montserrat_Bold",
        fontSize: 12,
        color: "#fff"
    },
    dictionaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
    },
    dictionaryContent: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#447777",
        paddingTop: 15
    },
    wordItem: {
        marginBottom: 12,
    },
    wordText: {
        fontFamily: "Montserrat_Bold",
        fontSize: 16,
        color: "#ffcc66",
        marginBottom: 3
    },
    meaningText: {
        fontFamily: "Montserrat_Regular",
        fontSize: 14,
        color: "#fff"
    },
    emptyText: {
        fontFamily: "Montserrat_Regular",
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
        marginVertical: 10
    },
    milestoneCard: {
        backgroundColor: "#669999",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10
    },
    milestoneHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5
    },
    milestoneIcon: {
        fontSize: 24,
        marginRight: 10
    },
    milestoneName: {
        fontFamily: "Montserrat_Bold",
        fontSize: 16,
        color: "#ffcc66",
        flex: 1
    },
    milestoneProgress: {
        fontFamily: "Montserrat_Bold",
        fontSize: 14,
        color: "#fff"
    },
    milestoneDescription: {
        fontFamily: "Montserrat_Regular",
        fontSize: 14,
        color: "#fff",
        marginBottom: 5
    },
    milestoneReward: {
        fontFamily: "Montserrat_Bold",
        fontSize: 12,
        color: "#4CAF50"
    }
});

export default StatisticsScreen;