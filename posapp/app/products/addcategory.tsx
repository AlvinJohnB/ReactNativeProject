import { View, Text, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native'
import React, {useState} from 'react'
import WheelColorPicker from 'react-native-wheel-color-picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';

const AddCategory = () => {

    const { apiUrl } = Constants.expoConfig?.extra || {}
    const [color, setColor] = useState('#008000')
    const [showPicker, setShowPicker] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleInputChange = (text: string) => {
        setCategoryName(text);
        console.log(text)
    }
    
    const handleSubmit = async () => {
        console.log(categoryName.length)
        if (categoryName.length == 0) {
            setErrorMessage('Category name is required');
            return;
        }
        axios.post(`${apiUrl}/product/add-category`, {
            name: categoryName,
            color: color
        }).then((response) => {
            console.log('Category added successfully', response.data);
        }).catch((error) => {
            console.error('Error adding category', error);
        }).finally(() => {
            router.push('/products')
        });
    }
    
  return (

    <View className="flex-1 bg-gray-100">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
            <View className="w-full bg-white rounded-lg shadow-lg p-6">

                <Text className="text-xl font-bold mb-5">Add Category</Text>
                {errorMessage ? <Text className="text-red-500 mb-4">{errorMessage}</Text> : null}

                <View className="mb-4">
                    <Text className="mb-2 text-gray-700">Category Name</Text>
                    <TextInput
                    className="border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter category name"
                    onChangeText={handleInputChange}
                    />
                </View>


                <View className="mb-4">
                    <Text className="mb-2 text-gray-700">Color</Text>

                        <View className='flex-1 items-center'>

                        <TouchableOpacity
                        className='w-full items-center justify-center'
                        style={{ backgroundColor: color, height: 25, borderRadius: 5 }}
                        onPress={() => setShowPicker(!showPicker)}
                        >
                        { showPicker? <Text>Confirm Color</Text> : <Text></Text>}
                        </TouchableOpacity>

                        {showPicker && (
                        <View>
                            <WheelColorPicker
                            wheelHidden={false}
                            sliderSize={30}
                            color={color}
                            onColorChangeComplete={setColor}
                            />
                        </View>
                        )}
                        </View>

                        </View>


                <View className="mb-4 mt-5">

                <TouchableOpacity className="bg-blue-500 rounded px-4 py-2" onPress={handleSubmit}>
                <Text className="text-white text-center">Add Category</Text>
                </TouchableOpacity>

                </View>


                </View>
              
            
          </ScrollView>
        </View>

  )
}

export default AddCategory