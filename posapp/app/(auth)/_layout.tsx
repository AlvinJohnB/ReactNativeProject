import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Authlayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ title: "Login", headerShown: false}} />
    </Stack>
  )
}

export default Authlayout

const styles = StyleSheet.create({})