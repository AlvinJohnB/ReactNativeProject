import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'

const UsersPage = () => {
    const {id } = useLocalSearchParams();
  return (
    <View>
      <Text>UsersPage</Text>
      <Text> UserID - {id}</Text>
      <Link href="/(auth)">
              <Text>Log Out</Text>
        </Link>
    </View>
  )
}

export default UsersPage