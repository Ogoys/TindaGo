import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { debugFirebaseConfig, testFirebaseConnection } from '../FirebaseDebug';

export default function NetworkDebug() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDebugTests = async () => {
    setTesting(true);
    setTestResults([]);

    addLog('🚀 Starting network and Firebase debug tests...');

    // Test 1: Environment Variables
    addLog('📋 Checking environment variables...');
    debugFirebaseConfig();

    // Test 2: Network connectivity
    addLog('🌐 Testing basic network connectivity...');
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD'
      });
      if (response.ok) {
        addLog('✅ Basic network connection: OK');
      } else {
        addLog('❌ Basic network connection: Failed');
      }
    } catch (error) {
      addLog('❌ Basic network connection: Error - ' + error);
    }

    // Test 3: Firebase connection
    addLog('🔥 Testing Firebase connection...');
    const firebaseOk = await testFirebaseConnection();
    addLog(firebaseOk ? '✅ Firebase connection: OK' : '❌ Firebase connection: Failed');

    // Test 4: Firebase Auth endpoint
    addLog('🔐 Testing Firebase Auth endpoint...');
    try {
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`;
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test123', returnSecureToken: true })
      });

      if (authResponse.status === 400) {
        addLog('✅ Firebase Auth endpoint: Reachable (400 = expected for invalid request)');
      } else {
        addLog(`⚠️ Firebase Auth endpoint: Unexpected response ${authResponse.status}`);
      }
    } catch (error) {
      addLog('❌ Firebase Auth endpoint: Error - ' + error);
    }

    // Test 5: Firebase Database endpoint
    addLog('📊 Testing Firebase Database endpoint...');
    try {
      const dbUrl = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL;
      if (dbUrl) {
        const dbResponse = await fetch(`${dbUrl}/.json`);
        if (dbResponse.ok) {
          addLog('✅ Firebase Database endpoint: Reachable');
        } else {
          addLog(`❌ Firebase Database endpoint: Failed ${dbResponse.status}`);
        }
      } else {
        addLog('❌ Firebase Database URL not configured');
      }
    } catch (error) {
      addLog('❌ Firebase Database endpoint: Error - ' + error);
    }

    addLog('🏁 Debug tests completed!');
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Network & Firebase Debug</Text>

      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={runDebugTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? '🔄 Running Tests...' : '🚀 Run Debug Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.logContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.logText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});