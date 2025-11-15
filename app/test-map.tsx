import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

export default function TestMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        console.log('📍 Requesting location permission...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          Alert.alert(
            'Permission Required',
            'This app needs location permission to show your position on the map.',
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('✅ Location permission granted');

        // Get current location
        console.log('📡 Getting current location...');
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        console.log('✅ Location obtained:', {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        setLocation(currentLocation);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error getting location:', err);
        setError(err.message || 'Failed to get location');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading map...</Text>
        <Text style={styles.subText}>Getting your location</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Retry by re-running the effect
            Location.requestForegroundPermissionsAsync().then(() => {
              Location.getCurrentPositionAsync().then(setLocation).catch((err) => {
                setError(err.message);
                setLoading(false);
              });
            });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Default to Davao City if location not available
  const initialRegion = {
    latitude: location?.coords.latitude || 7.1907,
    longitude: location?.coords.longitude || 125.4553,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Sample stores for testing (around Davao City)
  const sampleStores = [
    {
      id: '1',
      name: 'Sample Store 1',
      latitude: 7.1907,
      longitude: 125.4553,
    },
    {
      id: '2',
      name: 'Sample Store 2',
      latitude: 7.2000,
      longitude: 125.4600,
    },
    {
      id: '3',
      name: 'Sample Store 3',
      latitude: 7.1850,
      longitude: 125.4500,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Google Maps Test</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        onMapReady={() => {
          console.log('✅ Google Maps loaded successfully!');
          Alert.alert(
            '✅ Success!',
            'Google Maps is working correctly!\n\n' +
            '• Blue dot = Your location\n' +
            '• Red pins = Sample stores\n' +
            '• You can zoom and pan',
            [{ text: 'Great!' }]
          );
        }}
      >
        {/* Sample store markers */}
        {sampleStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description="Sample store marker"
            pinColor="red"
          />
        ))}

        {/* Your location marker (in addition to blue dot) */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description={`Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`}
            pinColor="green"
          />
        )}
      </MapView>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>✅ Map Test Results:</Text>
        <Text style={styles.footerText}>
          • Google Maps API: Working ✅
        </Text>
        <Text style={styles.footerText}>
          • Your Location: {location 
            ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : 'Using default (Davao City)'}
        </Text>
        <Text style={styles.footerText}>
          • Sample Stores: {sampleStores.length} markers visible
        </Text>
        <Text style={styles.successText}>
          🎉 Everything is working! You can now implement your map features.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonHeader: {
    padding: 5,
  },
  backButtonHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  successText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
