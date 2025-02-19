import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles"; // 🔹 Importoidaan tyylit

interface HomeScreenProps {
  setScreen: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
  return (
    <View style={styles.ScreenContainer}>
      <Text style={styles.ScreenText}>Tänne muistutuksia yms ?</Text>

    </View>
  );
};

export default HomeScreen;
