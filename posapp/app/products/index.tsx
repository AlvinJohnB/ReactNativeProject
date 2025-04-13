import { View, Text, FlatList, TextInput, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios'; 
import Constants from 'expo-constants';

const ProductPage = () => {

  const { apiUrl } = Constants.expoConfig?.extra || {}

  const router = useRouter(); // Use router for navigation
  const { width } = Dimensions.get('window'); // Get screen width

  // Calculate the number of columns and card width dynamically
  const numColumns = Math.floor(width / 180); // Each card is approximately 180px wide
  const cardWidth = width / numColumns - 16; // Subtract spacing between cards

  type Product = {
    _id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: {
      _id: string;
      name: string;
      color: string;
      __v: number;
    };
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    isPlaceholder?: boolean; // Add optional isPlaceholder property
  };

  const [productData, setProductData] = useState<Product[]>([{
    _id: "67f763ad96f6047ef70b682a",
    name: "Testing",
    sku: "3432423",
    price: 12,
    stock: 12,
    category: {
      _id: "67f7638d96f6047ef70b6825",
      name: "Testing",
      color: "#7f2d21",
      __v: 0
    },
    imageUrl: "http://192.168.43.144:5000/uploads/1744266157684",
    createdAt: "2025-04-10T06:22:37.709Z",
    updatedAt: "2025-04-10T06:22:37.709Z",
    __v: 0
  }]); // State to hold product data

  const [filteredData, setFilteredData] = useState<typeof productData>([]); // State for filtered data
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(productData); // Reset to full product list if query is empty
    } else {
      const filtered = productData.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) || // Filter by product name
        item.category.name.toLowerCase().includes(query.toLowerCase()) // Filter by category name
      );
      setFilteredData(filtered);
    }
  };



  // Fetch product data from the API
  const fetchProducts = async () => {
    try {
      await axios.get(`${apiUrl}/product/fetch-products`)
        .then((response) => {
          setProductData(response.data.data); // Set product data from API response
        });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add placeholders to maintain the number of columns
  const addPlaceholders = (data: typeof productData, numColumns: number) => {
    const totalItems = data.length;
    const remainder = totalItems % numColumns;

    if (remainder !== 0) {
      const placeholders = Array(numColumns - remainder).fill({ _id: `placeholder-${Math.random()}`, isPlaceholder: true });
      return [...data, ...placeholders];
    }

    return data;
  };



  // Render each product card
  const renderProduct = ({ item }: { item: typeof productData[0] }) => {
    if (item.isPlaceholder) {
      // Render an invisible placeholder card
      return (
        <View
          style={{
            width: cardWidth,
            marginBottom: 16,
            backgroundColor: 'transparent',
          }}
        />
      );
    }
  
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/products/[id]',
            params: { id: item._id.toString() },
          })
        }
        key={item._id}
        style={{
          width: cardWidth,
          backgroundColor: 'white',
          borderColor: item.category.color,
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Image
          source={{ uri: `${apiUrl}/uploads/${item.imageUrl}` }}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="cover"
        />
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>{item.category.name}</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>PHP {item.price}</Text>
  
        <Text
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: item.stock === 0 ? '#dc3545' : '#3b82f6',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          {item.stock === 0 ? 'Out of stock' : `Stock: ${item.stock}`}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
        className="p-3 mx-4 mb-0 mt-4 border border-gray-300 rounded-lg focus:border-blue-500"
      />
  
      <FlatList
        data={addPlaceholders(searchQuery ? filteredData : productData, numColumns)} // Add placeholders to the data
        renderItem={renderProduct}
        keyExtractor={(item) => item._id} // Use the unique ID as the key
        numColumns={numColumns} // Dynamically set the number of columns
        columnWrapperStyle={{ justifyContent: 'space-around', paddingHorizontal: 8 }} // Add spacing between rows
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }} // Add padding to avoid overlapping with the button
      />
  
      {/* Add Product Button */}
      <TouchableOpacity
        onPress={() => router.push('/products/addproduct')}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: '#3b82f6',
          borderRadius: 32,
          width: 64,
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
export default ProductPage;