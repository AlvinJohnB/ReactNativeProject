import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Button, Image, PermissionsAndroid, Platform, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { CameraView, Camera } from 'expo-camera'
import { Picker } from '@react-native-picker/picker';
import axios from 'axios'
import Constants from 'expo-constants'
import * as FileSystem from 'expo-file-system';

const ProductPage = () => {

   const { id } = useLocalSearchParams();
  const { apiUrl } = Constants.expoConfig?.extra || {}

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: '',
    price: '',
    category: '',
    retail_price: '',
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // State for the selected image
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]) 

  const [hasPermission, setHasPermission] = useState<boolean | null>(null) // Camera permission
  const [isScanning, setIsScanning] = useState(false) // State to toggle camera scanner

  const [loading, setLoading] = useState(false); // State to track loading status
  const [editMode, setEditMode] = useState(false); // State to track edit mode

  const [password, setPassword] = useState('') // State to store the entered password
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false) // State to toggle the password modal
  const [currentAction, setCurrentAction] = useState('') // State to track which action is being performed

  const [ restockQuantity, setRestockQuantity] = useState(0) // State to store the restock quantity
  const [isRestockModalVisible, setRestockModalVisible] = useState(false) // State to toggle the restock modal

  // Function to handle password confirmation
const handlePasswordConfirmation = (action: string) => {
  setCurrentAction(action) // Set the current action (edit, delete, or restock)
  setPasswordModalVisible(true) // Show the password modal
}

// Function to validate the password and perform the action
const validatePasswordAndProceed = () => {
  if (password === 'asd') { // Replace 'your_password' with the actual password logic
    setPasswordModalVisible(false) // Hide the modal
    setPassword('') // Clear the password field

    // Perform the action based on the currentAction
    if (currentAction === 'edit') {
      editProduct()
    } else if (currentAction === 'delete') {
      handleDeleteProduct()
    } else if (currentAction === 'restock') {
      setRestockModalVisible(true) // Show the restock modal
    }
  } else {
    Alert.alert('Invalid Password', 'The password you entered is incorrect.')
  }
}


  const getProduct = async () => {
    try {
      const response = await axios.get(`${apiUrl}/product/fetch-product/${id}`);

      // console.log(response.data.product);
      const product = response.data.product;
      setFormData({
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        price: product.price,
        category: product.category.name,
        retail_price: product.retail_price,
      });
      setSelectedImage(`${apiUrl}/uploads/${product.imageUrl}`); // Set the selected image URI from the response
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }


  useEffect(() => {
    
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/product/fetch-category`);
        // console.log(response.data)
        const categories = response.data.categories;
        setCategories(categories); // Assuming you have a state like `const [categories, setCategories] = useState([])`
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    getProduct();
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
    console.log(result)
    setSelectedImage(selectedUri) // Set the selected image URI
    // handleInputChange('imageUrl', selectedUri) // Update the formData with the image URI
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

  const editProduct = async () => {
    setLoading(true)
  
    try {
      const formDataToSend = new FormData()
  
      // Append form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, String(formData[key as keyof typeof formData]))
      })
  
      // Append the image file
      if (selectedImage) {
        let fileUri = selectedImage
  
        if (selectedImage.startsWith('content://')) {
          const fileInfo = await FileSystem.getInfoAsync(selectedImage)
          fileUri = fileInfo.uri
        }
  
        const fileName = fileUri.split('/').pop()
        const response = await fetch(fileUri)
        const blob = await response.blob()
  
        formDataToSend.append('image', {
          uri: fileUri,
          name: fileName || 'image.jpg',
          type: blob.type || 'image/jpeg',
        } as any)
      }
  
      await axios.put(`${apiUrl}/product/edit-product/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
  
      router.push('/products')
    } catch (error) {
      console.error('Error editing product:', error)
      setErrorMessage('Failed to edit product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = () => {
    setEditMode(!editMode) // Toggle edit mode
  }

  const handleDeleteProduct = async () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await axios.delete(`${apiUrl}/product/delete-product/${id}`)
              router.push('/products')
            } catch (error) {
              console.error('Error deleting product:', error)
              setErrorMessage('Failed to delete product. Please try again.')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleRestockProduct = async (qty: number) => {

    setLoading(true)
    setRestockModalVisible(false) // Hide the restock modal
    try {
        const newStock = formData.stock + qty
        await axios.put(`${apiUrl}/product/restock-product/${id}`, { stock: newStock })
        setFormData((prevData) => ({ ...prevData, stock: newStock }))
        Alert.alert('Success', 'Product restocked successfully.')
        } catch (error) {
          console.error('Error restocking product:', error)
          setErrorMessage('Failed to restock product. Please try again.')
        } finally {
          setLoading(false)
        }
  }
  

  return (
    <View className="flex-1 bg-gray-100">

    {loading && (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )}

    
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View className="w-full bg-white rounded-lg shadow-lg p-6">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
            {editMode ? `Edit Product`: `Product Details`}
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
          ) : null}

          {/* Display Selected Image */}
          {selectedImage && (
            <View className="items-center flex-row mb-4">
              <View className='w-1/3'></View>
              <Image
                source={{ uri: selectedImage }}
                className="w-32 h-32 rounded-lg"
                style={{ resizeMode: 'cover' }}
              />
            </View>
          )}

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

          

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Product Name:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              editable={editMode}
            />
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">SKU:</Text>
            <TextInput
              className={`${editMode ? `w-1/3` : `w-2/3`} p-2 border border-gray-300 rounded-lg focus:border-blue-500`}
              placeholder="Enter SKU"
              value={formData.sku}
              onChangeText={(value) => handleInputChange('sku', value)}
              editable={editMode}
            />
            {editMode ? <TouchableOpacity
              className="flex-1 ml-2 text-center p-3 bg-blue-500 rounded-lg"
              onPress={() => setIsScanning(true)}
            >
              <Text className="text-white text-center font-bold">Scan</Text>
            </TouchableOpacity> : null}
            
          </View>

          

          {isScanning && hasPermission && (
            <View className="w-full h-64 mb-4">
              <CameraView
                // ref={(ref) => setCameraRef(ref)}
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
              enabled={editMode}
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
              <Picker.Item label={formData.category} value={formData.category} />
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
              value={formData.stock.toString()}
              onChangeText={(value) => handleInputChange('stock', value)}
              keyboardType='numeric'
              editable={editMode}
            />
          </View>


          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Price:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter price"
              value={formData.price.toString()}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="numeric"
              editable={editMode}
            />
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="w-1/3 text-gray-700 font-bold">Retail Price:</Text>
            <TextInput
              className="w-2/3 p-2 border border-gray-300 rounded-lg focus:border-blue-500"
              placeholder="Enter retail price"
              value={formData.retail_price.toString()}
              onChangeText={(value) => handleInputChange('retail_price', value)}
              keyboardType="numeric"
              editable={editMode}
            />
          </View>


          {/* Inline Buttons */}
          <View className="flex-row justify-between mt-4">
            {/* Edit Button */}
            { editMode ? 
            <TouchableOpacity
            className="flex-1 bg-blue-500 text-white p-3 rounded-lg shadow-md active:bg-blue-600 mr-2"
            onPress={() => {handlePasswordConfirmation('edit')}} // Function to handle editing the product
            style={{ flexBasis: '30%' }} // Ensures each button takes up 30% of the row
          >
            <Text className="text-center text-white font-bold">Save</Text>
          </TouchableOpacity>: 

          <TouchableOpacity
          className="flex-1 bg-blue-500 text-white p-3 rounded-lg shadow-md active:bg-blue-600 mr-2"
          onPress={handleEditProduct} // Function to handle editing the product
          style={{ flexBasis: '30%' }} // Ensures each button takes up 30% of the row
        >
          <Text className="text-center text-white font-bold">Edit</Text>
        </TouchableOpacity>
        }
            

            {/* Delete Button */}
            {editMode ? <TouchableOpacity
              className="flex-1 bg-red-500 text-white p-3 rounded-lg shadow-md active:bg-red-600 mr-2"
              onPress={() => {handlePasswordConfirmation('delete')}} // Function to handle deleting the product
              style={{ flexBasis: '30%' }} // Ensures each button takes up 30% of the row
            >
              <Text className="text-center text-white font-bold">Delete</Text>
            </TouchableOpacity>:
            null}
            

            {/* Restock Button */}
            {editMode? null : 
            <TouchableOpacity
            className="flex-1 bg-green-500 text-white p-3 rounded-lg shadow-md active:bg-green-600"
            onPress={() => {handlePasswordConfirmation('restock')}} // Function to handle restocking the product
            style={{ flexBasis: '30%' }} // Ensures each button takes up 30% of the row
          >
            <Text className="text-center text-white font-bold">Restock</Text>
          </TouchableOpacity>}
            
          </View>

          {/* Password Confirmation Modal */}
          <Modal
          visible={isPasswordModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPasswordModalVisible(false)} // Close the modal when the user presses back
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                width: '80%',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Enter Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 20,
                }}
                placeholder="Enter your password"
                secureTextEntry={true}
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => setPasswordModalVisible(false)} />
                <Button title="Confirm" onPress={validatePasswordAndProceed} />
              </View>
            </View>
          </View>
        </Modal>

          {/* Restock Modal */}
          <Modal
          visible={isRestockModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setRestockModalVisible(false)} // Close the modal when the user presses back
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                width: '80%',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Enter Quantity of Stock to Add
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  padding: 10,
                  marginBottom: 20,
                }}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={restockQuantity.toString()}
                onChangeText={(text) => setRestockQuantity(Number(text))}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => setRestockModalVisible(false)} />
                <Button title="Confirm" onPress={()=> handleRestockProduct(restockQuantity)} />
              </View>
            </View>
          </View>
        </Modal>
          
    

          

          
        </View>
      </ScrollView>
    </View>
  )
}

export default ProductPage