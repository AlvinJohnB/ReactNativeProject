import { Tabs } from 'expo-router';
import React from 'react';
import { Icon } from 'react-native-elements'; // Replace with the correct library if different

const ShopLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          display: 'flex',
          justifyContent: 'space-between', // Ensure tabs are spaced evenly
        },
        tabBarItemStyle: {
          flex: 1, // Make each tab take equal space
        },
      }}
    >
      {/* Order Queue Tab */}
      <Tabs.Screen
        name="ticket"
        options={{
          title: 'Order Queue',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-plus" type="material-community" color={color} size={size} />
          ),
        }}
      />

      {/* Hidden Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cash Register',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-register" type="material-community" color={color} size={size} />
          ),
          tabBarButton: () => null, // Hides this tab from the tab bar
        }}
      />

      {/* Another Visible Tab */}
      <Tabs.Screen
        name="[id]"
        options={{
          title: 'Cash Register',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-register" type="material-community" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default ShopLayout;