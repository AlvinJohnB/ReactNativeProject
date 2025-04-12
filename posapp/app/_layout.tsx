import { View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import '../global.css';

const RootLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Simulate an authentication check (e.g., check token or session)
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Simulate a delay for authentication check
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Replace this with your actual authentication logic
        const userToken = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!userToken); // Set authentication state based on token
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    // Show a loading spinner while checking authentication
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="products" options={{ title: "Products", headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ title: "Home", headerShown: false }} />  
    </Stack>
  );
};

export default RootLayout;