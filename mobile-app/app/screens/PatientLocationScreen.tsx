// screens/LocationScreen.tsx
import React, { useContext, useMemo } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { LocationContext } from "../components/LocationTracker";
import { HomeContext } from "../components/HomeContext";
import styles from "../styles";

interface LocationScreenProps {
  setScreen: (screen: string) => void;
}

const PatientLocationScreen: React.FC<LocationScreenProps> = ({ setScreen }) => {
  const { location } = useContext(LocationContext);
  const { homeSet, homeLocation, setHomeSet, setHomeLocation } = useContext(HomeContext);

  if (!location) {
    return (
      <View style={[styles.locationScreenContainer, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const outsideHome = useMemo(() => {
    if (homeSet && homeLocation) {
      const latOffset = 50 / 111320;
      const lngOffset = 50 / (111320 * Math.cos(homeLocation.latitude * Math.PI / 180));
      const minLat = homeLocation.latitude - latOffset / 2;
      const maxLat = homeLocation.latitude + latOffset / 2;
      const minLng = homeLocation.longitude - lngOffset / 2;
      const maxLng = homeLocation.longitude + lngOffset / 2;
      return (
        location.latitude < minLat ||
        location.latitude > maxLat ||
        location.longitude < minLng ||
        location.longitude > maxLng
      );
    }
    return false;
  }, [homeSet, homeLocation, location]);

  const getHtmlContent = (): string => {
    let rectangleCode = "";
    if (homeSet && homeLocation) {
      rectangleCode = `
        var latOffset = 50 / 111320; 
        var lngOffset = 50 / (111320 * Math.cos(${homeLocation.latitude} * Math.PI / 180));
        var southWest = [${homeLocation.latitude} - latOffset/2, ${homeLocation.longitude} - lngOffset/2];
        var northEast = [${homeLocation.latitude} + latOffset/2, ${homeLocation.longitude} + lngOffset/2];
        var bounds = [southWest, northEast];
        var homeArea = L.rectangle(bounds, { color: "red", weight: 2 });
        homeArea.addTo(map);
      `;
    }
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <style>
            html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script>
            var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([${location.latitude}, ${location.longitude}]).addTo(map)
              .bindPopup("Olet tässä")
              .openPopup();
            ${rectangleCode}
          </script>
        </body>
      </html>
    `;
  };

  const handleSetHome = () => {
    setHomeLocation(location);
    setHomeSet(true);
    Alert.alert("Koti asetettu", "Oletus kotisijainti on asetettu.");
  };

  return (
    <View style={styles.locationScreenContainer}>
      <View style={styles.headerContainer}>
        {homeSet && outsideHome && (
          <Text style={styles.warningText}>OLET KODIN ULKOPUOLELLA!</Text>
        )}
        <Text>PATIENT LOCATION</Text>
        <Text style={styles.ScreenText}>Latitude: {location.latitude.toFixed(6)}</Text>
        <Text style={styles.ScreenText}>Longitude: {location.longitude.toFixed(6)}</Text>
      </View>
      <View style={styles.mapContainer}>
        <WebView originWhitelist={["*"]} source={{ html: getHtmlContent() }} style={styles.webview} />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleSetHome} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>Aseta koti</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PatientLocationScreen;
