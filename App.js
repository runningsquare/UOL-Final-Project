import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TowerScreen from "./components/TowerScreen";
import HomeScreen from "./components/HomeScreen";
import RushScreen from "./components/RushScreen";
import ZenScreen from "./components/ZenScreen";
import StatisticsScreen from "./components/StatisticsScreen";
import { initStats, clearStats } from "./components/statsUtils";
import SettingsScreen from "./components/SettingsScreen";

SplashScreen.preventAutoHideAsync(); // Prevents SplashScreen from auto hiding while fonts are in loading state

export default function App() {

  {/** Fonts config */}
  // Asynchronously load fonts
  const [loaded, error] = useFonts({
    "PlayfairDisplay_Bold": require("./assets/fonts/PlayfairDisplay-Bold.ttf"),
    "Montserrat_Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  // After custom fonts have loaded, hide splash screen and display app screen
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      initStats(); // Initialise statistics
    }
  }, [loaded, error]);

  // Display blank screen if font not loaded yet and has no error
  if (!loaded && !error) {
    return null;
  }

  {/** Set up navigation screens */}
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Tower" component={TowerScreen} />
        <Stack.Screen name="Rush" component={RushScreen} />
        <Stack.Screen name="Zen" component={ZenScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
