import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

const TabLayout = () => {
  return (
    <Stack>
      {/* Home Screen */}
      <Stack.Screen name="index" options={{ title: "Home", headerShown: false}} />
    </Stack>
  );
};

export default TabLayout;