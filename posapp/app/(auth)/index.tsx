import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'


import '../../global.css'


const LogIn = () => {

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [ errorMessage, setErrorMessage] = React.useState('')

  const usernameField = (text: string) =>{
    setUsername(text)
    // console.log(text)
  }

  const passwordField = (text: string) =>{
    setPassword(text)
  }

  const handleLogin = async () => {
    await axios.post('http://192.168.110.238:5000/auth/', {
      username: username,
      password: password
    }).then((response) => {
      if(response.data.error){
        setErrorMessage(response.data.error)
        // console.log(response.data.error)
      }else{
        console.log('Login successful')
        AsyncStorage.setItem('token', response.data.token)
        AsyncStorage.setItem('isLoggedIn', JSON.stringify(true))

        router.push('/(tabs)')
      }
    }).catch((error) => {
      console.error(error.message)
    })
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <View className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
          Login
        </Text>

        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500"
          placeholder="Username"
          // value={email}
          onChangeText={usernameField}
          // keyboardType="email-address"
        />
        

        <TextInput
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-blue-500"
          placeholder="Password"
          // value={password}
          onChangeText={passwordField}
          secureTextEntry
        />

        {errorMessage ? (
                  <Text className="text-red-500 mb-4 text-center font-bold">{errorMessage}</Text>
                ) : null}
       

        <TouchableOpacity
          className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md active:bg-blue-600"
          onPress={handleLogin}
        >
          <Text className="text-center text-white font-bold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>

  )
}

export default LogIn
