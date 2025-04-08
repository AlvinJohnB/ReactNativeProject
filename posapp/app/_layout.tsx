import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

import '../global.css'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={ {headerShown: false}} />
      <Stack.Screen name="(tabs)"/>
    </Stack>
  )
}

export default RootLayout