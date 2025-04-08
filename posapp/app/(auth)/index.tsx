import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {router } from 'expo-router'

import '../../global.css'


const LogIn = () => {
  return (
    // <View>
    //   <Text className='font-bold text-purple-800'>LogIn</Text>
    //   <Link href="/(tabs)/users/1">
    //     <Text>Logged In</Text>
    //   </Link>
    // </View>

    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <View className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
          Login
        </Text>

        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500"
          placeholder="Email"
          // value={email}
          // onChangeText={setEmail}
          keyboardType="email-address"
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

export default LogIn
