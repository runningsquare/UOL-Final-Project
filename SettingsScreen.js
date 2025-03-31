import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = ({ navigation }) => {
  // State for settings
  const [settings, setSettings] = useState({
    darkMode: false,
    animationsEnabled: true,
    vibrationEnabled: true
  });

  // State for statistics
  const [stats, setStats] = useState({
    totalWords: 0,
    highScores: { tower: 0, rush: 0, zen: 0 },
    achievements: []
  });

  // Load settings and stats when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const savedSettings = await AsyncStorage.getItem("@ScrambleTower_settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Load stats
        const savedStats = await AsyncStorage.getItem("@ScrambleTower_stats");
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem("@ScrambleTower_settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    };
    
    saveSettings();
  }, [settings]);

  // Toggle setting
  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };  

  return (
    <ScrollView style={[styles.container, settings.darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={settings.darkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerText, settings.darkMode && styles.darkText]}>SETTINGS</Text>
      </View>

      {/* Visual Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting("darkMode")}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={settings.darkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Animations</Text>
          <Switch
            value={settings.animationsEnabled}
            onValueChange={() => toggleSetting("animationsEnabled")}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={settings.animationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>Vibration</Text>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={() => toggleSetting("vibrationEnabled")}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={settings.vibrationEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Game Statistics</Text>
        
        <View style={styles.statCard}>
          <Text style={[styles.statValue, settings.darkMode && styles.darkText]}>✨ {stats.totalWords}</Text>
          <Text style={[styles.statLabel, settings.darkMode && styles.darkText]}>Total Words Unscrambled</Text>
        </View>
        
        <View style={styles.highScoreContainer}>
          <View style={[styles.statCard, styles.highScoreCard]}>
            <Text style={[styles.statValue, settings.darkMode && styles.darkText]}>🏆 {stats.highScores.tower}</Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkText]}>Tower Mode</Text>
          </View>
          <View style={[styles.statCard, styles.highScoreCard]}>
            <Text style={[styles.statValue, settings.darkMode && styles.darkText]}>⏱️ {stats.highScores.rush}</Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkText]}>Rush Mode</Text>
          </View>
          <View style={[styles.statCard, styles.highScoreCard]}>
            <Text style={[styles.statValue, settings.darkMode && styles.darkText]}>🧘 {stats.highScores.zen}</Text>
            <Text style={[styles.statLabel, settings.darkMode && styles.darkText]}>Zen Mode</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => navigation.navigate("Statistics")}
        >
          <Text style={styles.detailsButtonText}>View Detailed Statistics</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, settings.darkMode && styles.darkText]}>Reset</Text>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={async () => {
            // Reset settings to default
            setSettings({
              darkMode: false,
              animationsEnabled: true,
              vibrationEnabled: true
            });
          }}
        >
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.resetButton, styles.resetStatsButton]}
          onPress={async () => {
            Alert.alert(
              "Reset Statistics",
              "Are you sure you want to reset all your game statistics? This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", onPress: async () => {
                  const defaultStats = {
                    totalWords: 0,
                    highScores: { tower: 0, rush: 0, zen: 0 },
                    newWords: [],
                    wordDictionary: {},
                    achievements: [],
                    sessionHistory: []
                  };
                  await AsyncStorage.setItem("@ScrambleTower_stats", JSON.stringify(defaultStats));
                  setStats(defaultStats);
                }}
              ]
            );
          }}
        >
          <Text style={styles.resetButtonText}>Reset Game Statistics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffcc66",
    padding: 15
  },
  darkContainer: {
    backgroundColor: "#333333"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 60
  },
  headerText: {
    fontFamily: "PlayfairDisplay_Bold",
    fontSize: 40,
    color: "#000"
  },
  darkText: {
    color: "#fff"
  },
  section: {
    marginBottom: 25,
    backgroundColor: "#669999",
    borderRadius: 10,
    padding: 15
  },
  darkSection: {
    backgroundColor: "#444444"
  },
  sectionTitle: {
    fontFamily: "Montserrat_Bold",
    fontSize: 20,
    marginBottom: 15,
    color: "#fff"
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  settingLabel: {
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
    flex: 1,
    color: "#fff"
  },
  statCard: {
    backgroundColor: "#447777",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center"
  },
  statValue: {
    fontFamily: "Montserrat_Bold",
    fontSize: 24,
    color: "#fff",
    marginBottom: 5
  },
  statLabel: {
    fontFamily: "Montserrat_Regular",
    fontSize: 14,
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
  detailsButton: {
    backgroundColor: "#447777",
    borderRadius: 5,
    padding: 10,
    alignItems: "center"
  },
  detailsButtonText: {
    fontFamily: "Montserrat_Bold",
    fontSize: 14,
    color: "#fff"
  },
  resetButton: {
    backgroundColor: "#ff6666",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginBottom: 10
  },
  resetStatsButton: {
    backgroundColor: "#cc3333"
  },
  resetButtonText: {
    fontFamily: "Montserrat_Bold",
    fontSize: 14,
    color: "#fff"
  }
});

export default SettingsScreen;