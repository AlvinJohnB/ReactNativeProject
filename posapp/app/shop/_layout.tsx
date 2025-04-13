import { Tabs } from 'expo-router'
import React from 'react'
import { Icon } from 'react-native-elements' // Replace with the correct library if different

const ShopLayout = () => {
  return (
    <Tabs>
      {/* Shop Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cash Register',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-register" type='material-community' color={color} size={size} />
          ),
        }}
      />

      {/* Homepage Tab */}
      <Tabs.Screen
        name="ticket" // Use name to define the homepage screen
        options={{
          title: 'Order Queue',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-plus" type='material-community' color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}

export default ShopLayout