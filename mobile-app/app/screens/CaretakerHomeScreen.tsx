import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles";

interface HomeScreenProps {
  setScreen: (screen: string) => void;
}

const CaretakerHomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [caretakerName, setCaretakerName] = useState("");
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        if (storedName) {
          setCaretakerName(storedName);
        }
        // Load the patients data from AsyncStorage
        const storedPatients = await AsyncStorage.getItem("patients");
        console.log("Stored patients:", storedPatients);
        if (storedPatients) {
          const patients = JSON.parse(storedPatients);
          console.log("Parsed patients:", patients);
          // Assuming patients is an array of objects with either a "name" or "userName" property
          if (patients.length > 0) {
            const names = patients
              .map((patient: any) => patient.userName || patient.name)
              .join(", ");
            setPatientName(names);
          }
        }
      } catch (error) {
        console.error("Error loading user data", error);
      }
    };

    loadUserData();
    return () => clearInterval(intervalId);
  }, []);

  const weekday = currentDateTime.toLocaleDateString("fi-FI", { weekday: "long" });
  const date = currentDateTime.toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" });
  const time = currentDateTime.toLocaleTimeString("fi-FI");

  return (
    <View style={styles.ScreenContainer}>
      {/* Top section with real-time information */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={styles.ScreenText}>Käyttäjä: {caretakerName}</Text>
        <Text style={styles.ScreenText}>Potilas: {patientName}</Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Tänään on {weekday}</Text>
        <Text style={{ fontSize: 16 }}>{date}</Text>
        <Text style={{ fontSize: 16 }}>{time}</Text>
      </View>

      <ScrollView style={{ width: "100%" }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Caretaker-specific content */}
        <Text>Caretaker Dashboard</Text>
      </ScrollView>
    </View>
  );
};

export default CaretakerHomeScreen;
