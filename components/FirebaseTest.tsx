import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, database } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, push, get, query, limitToLast } from 'firebase/database';

export default function FirebaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const testRealtimeDB = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first to test Realtime Database');
      return;
    }

    try {
      // Add a test document to Realtime Database
      const testDoc = {
        message: 'Hello Firebase Realtime DB 2025!',
        timestamp: Date.now(),
        user: user.email
      };
      
      const testsRef = ref(database, 'tests');
      const newTestRef = await push(testsRef, testDoc);
      Alert.alert('Realtime DB Success', `Document added with ID: ${newTestRef.key}`);
      
      // Read data back
      const testsSnapshot = await get(testsRef);
      if (testsSnapshot.exists()) {
        const testsData = testsSnapshot.val();
        const testsCount = Object.keys(testsData).length;
        setTestData(`Found ${testsCount} test documents in Realtime DB`);
      } else {
        setTestData('No test documents found');
      }
      
    } catch (error: any) {
      Alert.alert('Realtime DB Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔥 Firebase Realtime DB 2025</Text>
        
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>✅ Connected to Firebase!</Text>
            <Text style={styles.userEmail}>User: {user.email}</Text>
            
            <TouchableOpacity style={styles.button} onPress={testRealtimeDB}>
              <Text style={styles.buttonText}>Test Realtime DB</Text>
            </TouchableOpacity>
            
            {testData ? (
              <Text style={styles.testData}>📊 {testData}</Text>
            ) : null}
            
            <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
      ) : (
        <View style={styles.authForm}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  userText: {
    fontSize: 18,
    color: '#34C759',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  testData: {
    fontSize: 14,
    color: '#34C759',
    marginVertical: 10,
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
});