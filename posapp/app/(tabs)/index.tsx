import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const Homepage = () => {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Welcome Section */}
      <View className="bg-blue-500 p-6 rounded-lg mb-4">
        <Text className="text-white text-2xl font-bold">Welcome to the Dashboard!</Text>
        <Text className="text-white text-sm mt-2">Manage your products, categories, and more.</Text>
      </View>

      {/* Statistics Section */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-white p-4 rounded-lg shadow-md flex-1 mr-2">
          <Text className="text-gray-700 text-lg font-bold">Products</Text>
          <Text className="text-blue-500 text-2xl font-bold mt-2">120</Text>
        </View>
        <View className="bg-white p-4 rounded-lg shadow-md flex-1 ml-2">
          <Text className="text-gray-700 text-lg font-bold">Categories</Text>
          <Text className="text-blue-500 text-2xl font-bold mt-2">15</Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="space-y-4">
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg shadow-md mb-2"
          onPress={() => router.push('/products')}
        >
          <Text className="text-white text-center font-bold">Go to Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-500 p-4 rounded-lg shadow-md mb-2"
          onPress={() => router.push('../shop')}
        >
          <Text className="text-white text-center font-bold">Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-purple-500 p-4 rounded-lg shadow-md mb-2"
          // onPress={() => router.push('/reports')}
        >
          <Text className="text-white text-center font-bold">View Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Homepage;