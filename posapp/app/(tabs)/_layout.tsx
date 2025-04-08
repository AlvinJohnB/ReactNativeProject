import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const TabsLayout = () => {
  return (
    <Tabs>
        <Tabs.Screen name="index" options={{title: "Home"}}/>
    </Tabs>
  )
}

export default TabsLayout