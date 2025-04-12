import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ProductLayOut = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{title: "Products", headerShown: true}}/>
        <Stack.Screen name="[id]" options={{title: "Product Details"}}/>
        <Stack.Screen name="addproduct" options={{title: "Add Product"}}/>
        <Stack.Screen name="addcategory" options={{title: "Add Category"}}/>
        {/* Add more product-related screens here as needed */}
    </Stack>
  )
}

export default ProductLayOut