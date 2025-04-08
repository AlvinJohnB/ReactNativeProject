import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import {router } from 'expo-router'

const Register = () => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
          <View className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
              Register
            </Text>
    
            <TextInput
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Name"
              // value={email}
              // onChangeText={setEmail}
            />
    
            <TextInput
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Password"
              // value={password}
              // onChangeText={setPassword}
              secureTextEntry
            />
    
            <TouchableOpacity
              className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md active:bg-blue-600"
              onPress={()=>{router.push('/(tabs)')}}
            >
              <Text className="text-center text-white font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
  )
}

export default Register