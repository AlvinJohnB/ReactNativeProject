import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Stack, router } from 'expo-router'

import '../global.css'

const RootLayout = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Default to false for testing

  // Simulate authentication check (replace with your actual logic)
useEffect(() => {
  setTimeout(() => {
    // Simulate successful authentication
    router.push('/(tabs)')
  }, 1000) // Simulate a delay for authentication check

}, [])

  

  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="products" options={{ headerShown: false }} />
        <Stack.Screen name="shop" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout