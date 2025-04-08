import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const Homepage = () => {
  return (
    <View>
      <Text>Homepage</Text>
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg"
        onPress={() => router.push('/products')}
      >
        <Text className="text-white text-center">Go to Products</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Homepage

const styles = StyleSheet.create({})