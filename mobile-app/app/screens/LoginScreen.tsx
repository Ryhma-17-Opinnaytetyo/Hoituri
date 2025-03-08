import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import styles from "../styles";
import { loginUser, getPatients } from "../services/apiMobile.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginScreenProps {
  setScreen: (screenName: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setScreen }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Sähköposti ja salasana vaaditaan");
      Alert.alert("Virhe", "Sähköposti ja salasana vaaditaan");
      return;
    }

    setLoading(true);

    try {
      const userData = await loginUser(email, password, "mobile");

      await AsyncStorage.setItem("userId", userData.id);
      await AsyncStorage.setItem("userEmail", userData.email);
      await AsyncStorage.setItem("userName", userData.name);
      await AsyncStorage.setItem("userRole", userData.role);

      if (userData.role === "caretaker") {
        if (userData.relationships && userData.relationships.patientIds) {
          const caretakerPatientIds = userData.relationships.patientIds; // Array of patient IDs for this caretaker
          const allPatients = await getPatients(userData.id);
          // Filter to only include patients that are in the caretaker's patientIds list
          const filteredPatients = allPatients.filter((patient: any) =>
            caretakerPatientIds.includes(patient.id)
          );
          await AsyncStorage.setItem("patients", JSON.stringify(filteredPatients));
          console.log("Patient Info:", filteredPatients);
        }
        setScreen("CaretakerHome");
        console.log("caretaker");
      } else if (userData.role === "patient") {
        setScreen("Home");
        console.log("patient")
      } else {
        // Fallback in case the role isn't recognized
        console.log("no role")
      }
      //Alert.alert("Onnistui!", "Kirjautuminen onnistui!");
      //setScreen("Home"); // Change screen after successful login
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const errorMessage = (err as Error).message;

      if (errorMessage === "Doctors should use the web application") {
        setError("Lääkäreiden tulee käyttää web-sovellusta");
        //Alert.alert("Virhe", "Vain lääkärit voivat kirjautua tähän sovellukseen");
      } else {
        setError("Virheelliset tunnukset");
        //Alert.alert("Virhe", "Virheelliset tunnukset");
      }
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <View style={[styles.container, { justifyContent: "flex-start", paddingTop: 60 }]}>
      <View style={{ width: "100%", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#6200EE" }}>Hoituri</Text>
      </View>

      <Text style={styles.titleText}>Kirjaudu sisään</Text>

      {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Sähköposti"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Salasana"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kirjaudu</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;