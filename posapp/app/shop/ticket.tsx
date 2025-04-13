import { View, Image, Text, TextInput, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import router from 'expo-router';
import Constants from 'expo-constants';
import { CameraView, Camera } from 'expo-camera'

const TicketPage = () => {

    const apiUrl = Constants.expoConfig?.extra?.apiUrl || ''; // Get API URL from environment variables with fallback
    
    type Product = {
        _id: string;
        name: string;
        sku: string;
        price: number;
        stock: number;
        qty: number;
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
    }
    const [products, setProducts] = useState<Product[]>([]); // List of products

  const [filteredData, setFilteredData] = useState(products); // State for filtered data
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
 
  const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.trim() === '') {
        setFilteredData(products); // Reset to full product list if query is empty
      } else {
        const filtered = products.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) // Filter by product name
          // item.category.name.toLowerCase().includes(query.toLowerCase()) // Filter by category name
        );
        setFilteredData(filtered);
      }
    };

    const [hasPermission, setHasPermission] = useState(false); // Camera permission
    const [isScanning, setIsScanning] = useState(false); // Barcode scanner state
    const [scanned, setScanned] = useState(false); // Prevent multiple scans

    useEffect(() => {
      const getCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      getCameraPermission();
    }, []);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
      // setIsScanning(false); // Stop scanning
      if (scanned) return; // Prevent multiple scans
      setScanned(true); // Set scanned to true
      const scannedProduct = products.find((item) => item.sku === data);
      if (scannedProduct) {
        // alert(`${scannedProduct.name} found. Do you want to add it to the cart?`);
        addToCartByBarcode(scannedProduct); // Add scanned product to cart
      } else {
        alert('Product not found');
      }
      setTimeout(() => setScanned(false), 1000); // Reset scanned state after 2 seconds
      
    };

    // Add product to cart by barcode
  const addToCartByBarcode = (product: typeof products[0]) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.sku === product.sku);
      if (existingProduct) {
        // If product exists, increment its quantity
        return prevCart.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If product doesn't exist, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  type Cart = {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    sku: string;
  }
  const [cart, setCart] = useState<Cart[]>([]); // List of items in the cart
  const [isPortrait, setIsPortrait] = useState(true); // Track orientation

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/product/fetch-products`); // Fetch products from the API
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToQueue = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to the cart before adding to the queue.');
      return;
    }
  
    try {
      const response = await axios.post(`${apiUrl}/order/add-to-queue`, {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        total: calculateTotalPrice(),
      });
  
      if (response.status === 201) {
        console.log ('Order added to queue:', response.data);
        alert('Order added to queue successfully!');
        setCart([]); // Clear the cart after successful submission
      } else {
        alert('Failed to add order to queue. Please try again.');
      }
    } catch (error) {
      console.error('Error adding order to queue:', error);
      alert('An error occurred while adding the order to the queue.');
    }
  };

  


  // Add product to cart
  const addToCart = (product: typeof products[0]) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        // If product exists, increment its quantity
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If product doesn't exist, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // Update quantity in cart
  const updateCartQuantity = (productId: string, change: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) } // Ensure quantity is at least 1
          : item
      )
    );
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Detect orientation changes
  const handleOrientationChange = () => {
    const { width, height } = Dimensions.get('window');
    setIsPortrait(height >= width); // Portrait if height is greater than width
  };

  useEffect(() => {
    handleOrientationChange(); // Set initial orientation
    const subscription = Dimensions.addEventListener('change', handleOrientationChange);
    return () => subscription?.remove(); // Cleanup listener
  }, []);

// Render a product item
    const renderProduct = ({ item }: { item: typeof products[0] }) => (
        <View className="flex-row justify-between items-center p-3 mb-2 bg-gray-100 rounded-lg shadow">
        <Image
            source={{ uri: `${apiUrl}/uploads/${item.imageUrl}` }}
            className="w-12 h-12 rounded-lg mr-3"
            resizeMode="cover"
        />
        <View className="flex-1">
            <Text className="text-base font-bold">{item.name}</Text>
            <Text className="text-gray-500">PHP {item.price}</Text>
        </View>
        <TouchableOpacity
            className="bg-blue-500 px-3 py-2 rounded-lg"
            onPress={() => addToCart(item)}
        >
            <Text className="text-white font-bold">Add to Cart</Text>
        </TouchableOpacity>
        </View>
    );

  // Render a cart item
  const renderCartItem = ({ item }: { item: { _id: string; name: string; price: number; quantity: number } }) => (
    <View className="flex-row justify-between items-center p-3 mb-2 bg-gray-100 rounded-lg shadow">
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Name</Text>
        <Text className="text-base">{item.name}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Price</Text>
        <Text className="text-base">PHP {item.price}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Qty</Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="px-2 py-1"
            onPress={() => updateCartQuantity(item._id, -1)} // Decrease quantity
          >
            <Text className="text-black font-bold">-</Text>
          </TouchableOpacity>
          <Text className="mx-2 text-base font-bold">{item.quantity}</Text>
          <TouchableOpacity
            className="px-2 py-1"
            onPress={() => updateCartQuantity(item._id, 1)} // Increase quantity
          >
            <Text className="text-black font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        className="bg-red-500 px-3 py-2 rounded-lg"
        onPress={() => removeFromCart(item._id)}
      >
        <Text className="text-white font-bold">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-5">

       
    
      <View className={`flex-1 ${isPortrait ? 'flex-col' : 'flex-row justify-between'}`}>
        {/* Products Section */}
        <View className={`flex-1 ${isPortrait ? 'mb-4' : 'mr-4'}`}>

          <Text className="text-lg font-bold">Products</Text>
               {/* Search Bar */}
               <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            className='border border-gray-300 rounded-lg focus:border-blue-500'
            />

          <TouchableOpacity
                    className="bg-blue-500 p-2 rounded-lg mt-1 mb-1"
                    onPress={() => setIsScanning(true)}
          >
          <Text className="text-white font-bold">Scan</Text>
        </TouchableOpacity>

        {/* Camera for Barcode Scanning */}
        {isScanning && hasPermission && (
          <View className="w-full mb-4 p-2">
          <CameraView
            style={{ height: 150, width: '100%' }}  
            className='mb-1'  
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
      

          <FlatList
            data={searchQuery ? filteredData : products} // Use filtered data if search query is presen
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </View>

        {/* Cart Section */}
        <View className="flex-1">
          <Text className="text-lg font-bold mb-2">Cart</Text>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }} // Add padding to avoid overlap with fixed bottom section
          />
        </View>
      </View>

      {/* Fixed Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 bg-gray-100 p-4 border-t border-gray-300 flex-row justify-between items-center">
        <Text className="text-lg font-bold">Total: PHP {calculateTotalPrice().toFixed(2)}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={addToQueue} // Add to queue button
          >
          <Text className="text-white font-bold">Add to Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TicketPage;