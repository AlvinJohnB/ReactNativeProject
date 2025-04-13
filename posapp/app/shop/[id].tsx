import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const OrderIdPage = () => {

  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>OrderIdPage - {id}</Text>
    </View>
  )
}

export default OrderIdPage