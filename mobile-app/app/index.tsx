import React, { useState } from "react";
import { SafeAreaView, StatusBar, View, TouchableOpacity, Text } from "react-native";
import PatientHomeScreen from "./screens/PatientHomeScreen"; // For patients
import CaretakerHomeScreen from "./screens/CaretakerHomeScreen";
import PatientLocationScreen from "./screens/PatientLocationScreen"; // For patients
import CaretakerLocationScreen from "./screens/CaretakerLocationScreen"; // For caretakers
import LoginScreen from "./screens/LoginScreen";
import LocationTracker from "./components/LocationTracker";
import { HomeProvider } from "./components/HomeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles";

const App = () => {
  const [screen, setScreen] = useState("LoginScreen");

  // If user is logging in, show only LoginScreen
  if (screen === "LoginScreen") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={styles.statusBar.backgroundColor}
        />
        <View style={styles.screenContent}>
          <LoginScreen setScreen={setScreen} />
        </View>
      </SafeAreaView>
    );
  }

  // Once logged in, wrap content with HomeProvider and LocationTracker
  return (
    <HomeProvider>
      <LocationTracker>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={styles.statusBar.backgroundColor}
          />

          {/* Top navigation header */}
          <View style={styles.topNav}>
            {/* Logout button */}
            <TouchableOpacity
              onPress={() => setScreen("LoginScreen")}
              style={[
                styles.backButton,
                { display: (screen === "Home" || screen === "CaretakerHome") ? "flex" : "none" }
              ]}
            >
              <Text style={styles.navText}>Kirjaudu ulos</Text>
            </TouchableOpacity>

            {/* Back button for location screens */}
            <TouchableOpacity
              onPress={async () => {
                const role = await AsyncStorage.getItem("userRole");
                if (role === "caretaker") {
                  setScreen("CaretakerHome");
                } else {
                  setScreen("Home");
                }
              }}
              style={[
                styles.backButton,
                { display: (screen === "PatientLocationScreen" || screen === "CaretakerLocationScreen") ? "flex" : "none" }
              ]}
            >
              <Text style={styles.navText}>← Aloitus</Text>
            </TouchableOpacity>

            <Text style={styles.titleText}>
              {screen === "Home"
                ? "Aloitus (patient)"
                : screen === "CaretakerHome"
                ? "Aloitus (caretaker)"
                : screen === "PatientLocationScreen"
                ? "Sijainti (patient)"
                : screen === "CaretakerLocationScreen"
                ? "Sijainti (caretaker)"
                : "Kirjautuminen"}
            </Text>

            {/* Forward button for navigating to location screens */}
            <TouchableOpacity
              onPress={async () => {
                const role = await AsyncStorage.getItem("userRole");
                if (role === "caretaker") {
                  setScreen("CaretakerLocationScreen");
                } else {
                  setScreen("PatientLocationScreen");
                }
              }}
              style={[
                styles.forwardButton,
                { display: (screen === "Home" || screen === "CaretakerHome") ? "flex" : "none" }
              ]}
            >
              <Text style={styles.navText}>Sijainti →</Text>
            </TouchableOpacity>
          </View>

          {/* Main content area */}
          <View style={styles.screenContent}>
            {screen === "Home" && <PatientHomeScreen setScreen={setScreen} />}
            {screen === "CaretakerHome" && <CaretakerHomeScreen setScreen={setScreen} />}
            {screen === "PatientLocationScreen" && <PatientLocationScreen setScreen={setScreen} />}
            {screen === "CaretakerLocationScreen" && <CaretakerLocationScreen setScreen={setScreen} />}
          </View>
        </SafeAreaView>
      </LocationTracker>
    </HomeProvider>
  );
};

export default App;
