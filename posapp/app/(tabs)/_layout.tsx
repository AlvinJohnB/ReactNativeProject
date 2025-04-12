import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

const TabLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Home Screen */}
      <Stack.Screen name="index" options={{ title: "Home" }} />

      {/* Uncomment or add more screens as needed */}
      {/* <Stack.Screen name="products" options={{ title: "Products" }} /> */}
    </Stack>
  );
};

export default TabLayout;