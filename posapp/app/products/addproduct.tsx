import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, PermissionsAndroid, Platform, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { CameraView, Camera } from 'expo-camera'
import { Picker } from '@react-native-picker/picker';
import axios from 'axios'
import Constants from 'expo-constants'


const AddProduct = () => {

  const { apiUrl } = Constants.expoConfig?.extra || {}

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: '',
    price: '',
    imageUrl: '',
    category: '',
    retail_price: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // State for the selected image
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]) 

  const [hasPermission, setHasPermission] = useState<boolean | null>(null) // Camera permission
  const [isScanning, setIsScanning] = useState(false) // State to toggle camera scanner
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null) // Reference to the camera


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/product/fetch-category`);
        console.log(response.data)
        const categories = response.data.categories;
        setCategories(categories); // Assuming you have a state like `const [categories, setCategories] = useState([])`
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    }
    requestCameraPermission()
  }, [])

  // Handle barcode scanning
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setIsScanning(false) // Stop scanning
    handleInputChange('sku', data) // Update the SKU field with the scanned data
    // Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`)
  }

// Open image picker
const handleImagePicker = async () => {
  // Request permissions
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (permissionResult.granted === false) {
    alert('Permission to access gallery is required!')
    return
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  })

  if (!result.canceled) {
    const selectedUri = result.assets[0].uri
    setSelectedImage(selectedUri) // Set the selected image URI
    handleInputChange('imageUrl', selectedUri) // Update the formData with the image URI
  }
}

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  // Handle form submission
  const handleAddProduct = () => {
    // Validate required fields
    const requiredFields: (keyof typeof formData)[] = ['name', 'sku', 'stock', 'price', 'category', 'retail_price']
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      setErrorMessage('All required fields must be filled.')
      return
    }

    // Simulate product submission
    console.log('Product added:', formData)
    setErrorMessage('')
    router.push('/products') // Navigate back to the products page
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View className="w-full bg-white rounded-lg shadow-lg p-6">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
            Add Product
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
          ) : null}

          {/* Inline Form */}
          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Image:</Text>
            <TouchableOpacity
              className="w-2/3 p-2 border border-gray-300 rounded-lg bg-gray-200"
              onPress={handleImagePicker}
            >
              <Text className="text-gray-700 text-center">
                {selectedImage ? 'Change Image' : 'Browse Image'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Display Selected Image */}
          {selectedImage && (
            <View className="items-center mb-4">
              <Image
                source={{ uri: selectedImage }}
                className="w-32 h-32 rounded-lg"
                style={{ resizeMode: 'cover' }}
              />
            </View>
          )}

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Product Name:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">SKU:</Text>
            <TextInput
              className="w-1/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter SKU"
              value={formData.sku}
              onChangeText={(value) => handleInputChange('sku', value)}
            />
            <TouchableOpacity
              className="flex-1 ml-2 text-center p-3 bg-blue-500 rounded-lg"
              onPress={() => setIsScanning(true)}
            >
              <Text className="text-white text-center font-bold">Scan</Text>
            </TouchableOpacity>
          </View>

          

          {isScanning && hasPermission && (
            <View className="w-full h-64 mb-4">
              <CameraView
                ref={(ref) => setCameraRef(ref)}
                style={{ flex: 1 }}
                // type={CameraType.back}
                onBarcodeScanned={handleBarCodeScanned}
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-red-500 p-2 rounded-lg"
                onPress={() => setIsScanning(false)}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}


          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Category:</Text>

          
            {formData.category === 'add_category' ? (
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter new category"
                // value={formData.category}
                // onBlur={(event) => handleInputChange('category', event.nativeEvent.text)}
              />
              ) : (
            <Picker
              selectedValue={formData.category}
              onValueChange={(itemValue) => {
              if (itemValue === 'add_category') {
                router.push('/products/addcategory'); // Navigate to the add category modal
              } else {
                handleInputChange('category', itemValue);
              }
              }}
              style={{ flex: 1 }}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((category) => (
              <Picker.Item key={category.name} label={category.name} value={category.name} />
              ))}
              <Picker.Item label="Add Category" value="add_category" />
            </Picker>
            )}
          
          </View>

          
          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Stock:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter stock quantity"
              value={formData.stock}
              onChangeText={(value) => handleInputChange('stock', value)}
            />
          </View>


          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Price:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter price"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="numeric"
            />
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Retail Price:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter retail price"
              value={formData.retail_price}
              onChangeText={(value) => handleInputChange('retail_price', value)}
              keyboardType="numeric"
            />
          </View>

          {/* <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Category:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter category"
              value={formData.category}
              onChangeText={(value) => handleInputChange('category', value)}
            />
          </View> */}

          
    
          

          

          {/* Submit Button */}
          <TouchableOpacity
            className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md active:bg-blue-600"
            onPress={handleAddProduct}
          >
            <Text className="text-center text-white font-bold">Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default AddProduct