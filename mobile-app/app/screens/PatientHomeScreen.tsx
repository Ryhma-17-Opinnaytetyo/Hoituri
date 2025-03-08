import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface HomeScreenProps {
  setScreen: (screen: string) => void;
}

// Esimerkkimuistutukset
const reminders = [
  { day: "Maanantai", medicine: "Keltainen juoma", dosage: 1, time: "09:00" },
  { day: "Tiistai", medicine: "Punainen pilleri", dosage: 2, time: "12:00" },
  { day: "Keskiviikko", medicine: "Oranssi pilleri", dosage: 2, time: "18:00" },
  { day: "Maanantai", medicine: "jalka voide", dosage: 1, time: "01:00" },
  { day: "Tiistai", medicine: "Punainen pilleri", dosage: 2, time: "12:00" },
  { day: "Keskiviikko", medicine: "Oranssi pilleri", dosage: 2, time: "18:00" },
  { day: "Maanantai", medicine: "burana", dosage: 2, time: "08:00" },
  { day: "Tiistai", medicine: "Punainen pilleri", dosage: 2, time: "12:00" },
  { day: "Keskiviikko", medicine: "Oranssi pilleri", dosage: 2, time: "12:00" },
  { day: "Maanantai", medicine: "UniPro unilääke", dosage: 7, time: "22:00" },
  { day: "Tiistai", medicine: "Punainen pilleri", dosage: 2, time: "12:00" },
  { day: "Keskiviikko", medicine: "Oranssi pilleri", dosage: 2, time: "18:00" },
  { day: "Maanantai", medicine: "Muisti Laastari", dosage: 1, time: "09:05" },
  { day: "Tiistai", medicine: "Punainen pilleri", dosage: 2, time: "12:00" },
  { day: "Keskiviikko", medicine: "Oranssi pilleri", dosage: 2, time: "18:00" },
];

const PatientHomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [emergencyPressed, setEmergencyPressed] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Päivitetään aika sekunnin välein

    return () => clearInterval(intervalId);
  }, []);

  // Haetaan nykyisen päivämäärän ja ajan komponentit
  const weekday = currentDateTime.toLocaleDateString("fi-FI", { weekday: "long" });
  const date = currentDateTime.toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" });
  const time = currentDateTime.toLocaleTimeString("fi-FI");

  const loadUserName = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      if (storedName) {
        setPatientName(storedName);
      }
    } catch (error) {
      console.error("Error loading user name", error);
    }
  };

  loadUserName();

  // Määritellään viikonpäivien järjestys
  const daysOrder: { [key: string]: number } = {
    "maanantai": 1,
    "tiistai": 2,
    "keskiviikko": 3,
    "torstai": 4,
    "perjantai": 5,
    "lauantai": 6,
    "sunnuntai": 7,
  };

  // Lasketaan nykyisen päivän indeksi
  const currentDayIndex = daysOrder[weekday.toLowerCase()];

  // Järjestetään muistutukset siten, että nykyisen päivän muistutukset tulevat ensin.
  const sortedReminders = reminders.slice().sort((a, b) => {
    const aIndex = daysOrder[a.day.toLowerCase()];
    const bIndex = daysOrder[b.day.toLowerCase()];
    // Lasketaan relatiiviset arvot nykyisestä päivästä (0 = tänään)
    const relativeA = (aIndex - currentDayIndex + 7) % 7;
    const relativeB = (bIndex - currentDayIndex + 7) % 7;
    if (relativeA !== relativeB) {
      return relativeA - relativeB;
    }
    // Jos muistutukset ovat samalta päivältä, verrataan kellonaikoja
    return a.time.localeCompare(b.time);
  });

  return (
    <View style={styles.ScreenContainer}>
      {/* Yläosan reaaliaikaiset tiedot */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={styles.ScreenText}>Käyttäjä: {patientName}</Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Tänään on {weekday}</Text>
        <Text style={{ fontSize: 16 }}>{date}</Text>
        <Text style={{ fontSize: 16 }}>{time}</Text>
      </View>

      {/* Lääkemuistutukset - ScrollView säilyy keskellä */}
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {sortedReminders.map((item, index) => {
          const isToday = item.day.toLowerCase() === weekday.toLowerCase();
          return (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 2,
                marginVertical: 2,
                borderRadius: 5,
                width: "100%",
                backgroundColor: isToday ? "#e0f7fa" : "transparent",
              }}
            >
              <Text>Päivä: {item.day}</Text>
              <Text>Lääke: {item.medicine}</Text>
              <Text>Annos: {item.dosage}</Text>
              <Text>Aika: {item.time}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* HÄTÄ-nappi lisätty HomeScreenin alaosaan */}
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <TouchableOpacity
          onPress={() => setEmergencyPressed((prev) => !prev)}
          style={{
            width: 100,
            height: 100,
            borderRadius: 99,
            backgroundColor: "red",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 34 }}>HÄTÄ</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, marginTop: 10 }}>
          {emergencyPressed ? "true" : "false"}
        </Text>
      </View>
    </View>
  );
};

export default PatientHomeScreen;
