import { StatusBar } from "expo-status-bar";
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Animated } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
    const [darkMode, setDarkMode] = useState(false);

    // Load settings when screen focuses
    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem("@ScrambleTower_settings");
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                setDarkMode(settings.darkMode || false);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    useEffect(() => {
        // Load immediately on mount
        loadSettings();
        
        // Reload whenever screen comes into focus
        const unsubscribe = navigation.addListener('focus', loadSettings);
        
        return unsubscribe;
    }, [navigation]);

    const dynamicStyles = getDynamicStyles(darkMode);

    return (
        <SafeAreaView style={dynamicStyles.container}>

            {/** Header */}
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerText}>Scramble Tower</Text>
            </View>

            {/** Game Modes */}
            <View style={dynamicStyles.modes}>
                <ArrowButton text="TOWER" onPress={() => navigation.navigate("Tower")} darkMode={darkMode} />
                <ArrowButton text="RUSH" onPress={() => navigation.navigate("Rush")} darkMode={darkMode} />
                <ArrowButton text="ZEN" onPress={() => navigation.navigate("Zen")} darkMode={darkMode} />
            </View>

            {/** Game Utilities */}
            <View style={dynamicStyles.utilities}>
                <RightArrowButton text="STATISTICS" onPress={() => navigation.navigate("Statistics")} darkMode={darkMode} />
                <RightArrowButton text="SETTINGS" onPress={() => navigation.navigate("Settings")} darkMode={darkMode} />
            </View>

            <StatusBar style={darkMode ? "light" : "dark"} />

        </SafeAreaView>
    );
}
  
  
{/** Create Arrow Button */}
const ArrowButton = ({ text, onPress, darkMode }) => {

    {/** Handle Arrow Button Animation */}
    const width = new Animated.Value(0); // Initial animated value
    const dynamicStyles = getDynamicStyles(darkMode);

    const handlePressIn = () => {
        Animated.timing(width, {
            toValue: 100,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };

    const handlePressOut = () => {
        setTimeout(() => { // Delay so that press in plays out
        Animated.timing(width, {
            toValue: 0, // Reset back to original size
            duration: 500,
            useNativeDriver: false,
        }).start(() => {
            onPress();
        });
        }, 1000);
    };

    {/** Create Arrow Button */}
    return (
        <TouchableOpacity 
            style={dynamicStyles.arrowButton} 
            onPressIn={handlePressIn} 
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    dynamicStyles.rectangle,
                    { width: Animated.add(new Animated.Value(156), width) }
                ]}
            >
                <Text style={dynamicStyles.buttonText}>{text}</Text>
            </Animated.View>
            <View style={dynamicStyles.arrowHead}></View>
            <View style={dynamicStyles.arrowHeadOutline}></View>
        </TouchableOpacity>
    );
}

const RightArrowButton = ({ text, onPress, darkMode }) => {

    {/** Handle Arrow Button Animation */}
    const width = new Animated.Value(0); // Initial animated value
    const dynamicStyles = getDynamicStyles(darkMode);

    const handlePressIn = () => {
        Animated.timing(width, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: false,
        }).start();
    };

    const handlePressOut = () => {
        setTimeout(() => { // Delay so that press in plays out
            Animated.timing(width, {
                toValue: 0, // Reset back to original size
                duration: 1000,
                useNativeDriver: false,
            }).start(()=> {
                onPress();
            });
        }, 1000);
    };

    {/** Create Arrow Button */}
    return (
        <TouchableOpacity 
            style={dynamicStyles.arrowButton} 
            onPressIn={handlePressIn} 
            onPressOut={handlePressOut}
        >
            <View style={dynamicStyles.rightArrowHead}></View>
            <View style={dynamicStyles.rightArrowHeadOutline}></View>
            <Animated.View
                style={[
                    dynamicStyles.rectangle,
                    { width: Animated.add(new Animated.Value(156), width) }
                ]}
            >
                <Text style={dynamicStyles.buttonText}>{text}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}
  

// Dynamic styles based on dark mode
const getDynamicStyles = (darkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkMode ? "#333333" : "#ffcc66"
    },
    header: {
        flex: 0.1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    headerText: {
        fontFamily: "PlayfairDisplay_Bold",
        fontSize: 40,
        fontWeight: "bold",
        color: darkMode ? "#ffffff" : "#000000"
    },
    modes: {
        flex: 0.45,
        paddingTop: "8%"
    },
    utilities: {
        flex: 0.45,
        alignItems: "flex-end"
    },
    arrowButton: {
        flexDirection: "row",
        marginBottom: 15,
        alignItems: "center"
    },
    rectangle: {
        width: "40%",
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderTopColor: darkMode ? "#555555" : "#447777",
        borderBottomColor: darkMode ? "#555555" : "#447777",
        backgroundColor: "#669999",
        paddingVertical: 15,
        paddingHorizontal: 20
    },
    buttonText: {
        color: darkMode ? "#ffffff" : "#ffffff",
        fontSize: 18,
        fontFamily: "Montserrat_Bold"
    },
    arrowHead: {
        borderTopWidth: 25.5,
        borderBottomWidth: 25.5,
        borderLeftWidth: 25.5,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "#669999"
    },
    rightArrowHead: {
        right: "-7.5%",
        borderTopWidth: 25.5,
        borderBottomWidth: 25.5,
        borderRightWidth: 26,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderRightColor: "#669999"
    },
    arrowHeadOutline: {
        left: "-6.5%",
        zIndex: -1,
        borderTopWidth: 28.5,
        borderBottomWidth: 28.5,
        borderLeftWidth: 28.5,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: darkMode ? "#222222" : "#447777"
    },
    rightArrowHeadOutline: {
        zIndex: -1,
        borderTopWidth: 28.5,
        borderBottomWidth: 28.5,
        borderRightWidth: 29,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderRightColor: darkMode ? "#222222" : "#447777"
    }
});

export default HomeScreen;
