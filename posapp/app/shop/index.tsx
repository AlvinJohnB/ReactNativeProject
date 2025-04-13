import { ActivityIndicator, View, Image, Text, TextInput, FlatList, TouchableOpacity, Dimensions, Modal, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { CameraView, Camera } from 'expo-camera'

const ShopPage = () => {

  
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || ''; // Get API URL from environment variables with fallback
  const queueResetTimeOut = Constants.expoConfig?.extra?.queueResetTimeOut || 30000; // Get queue reset timeout from environment variables with fallback
 
  type Product = {
      _id: string;
      name: string;
      sku: string;
      price: number;
      stock: number;
      quantity: number;
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
  }; // Define product type
  
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


  const [cart, setCart] = useState<Product[]>([]); // List of items in the cart
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

  const [queue, setQueue] = useState<any[]>([]);

  type OrderData = {
    orderID: string;
    queueBy: string;
    products: any[];
    total: number;
  }; // Define type for order data

  const [orderData, setOrderData] = useState<OrderData | null>(null); // State for order data


  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${apiUrl}/order/queue`); // Fetch queue from the API
      setQueue(response.data.orders); // Set queue state
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  }
  useEffect(() => {
    fetchQueue(); // Initial fetch
    const interval = setInterval(fetchQueue, queueResetTimeOut); 
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []); // Fetch queue on component mount


  // Add product to cart
  const addToCart = (product: Product) => {
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
    return parseFloat(cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
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
    const renderProduct = ({ item }: { item: Product }) => (
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
            onPress={() => {
              addToCart(item)
            }}
        >
            <Text className="text-white font-bold">Add to Cart</Text>
        </TouchableOpacity>
        </View>
    );

  // Render a cart item
  const renderCartItem = ({ item }: { item: Product }) => (
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

  // render Queued Orders
  const renderQueueItem = ({ item }: { item: any }) => (
    <View className="flex-row justify-between items-center p-3 mb-2 bg-gray-100 rounded-lg shadow">
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Name</Text>
        <Text className="text-base">{item.orderID}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Items</Text>
        <Text className="text-base">{item.products.length}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500">Total</Text>
        <Text className="text-base">PHP {item.total}</Text>
      </View>
      
      <TouchableOpacity
        className="bg-blue-500 px-3 py-2 rounded-lg"
        onPress={() => {
          setQueueModalVisible(false); // Close the queue modal
          router.push(`/shop/${item._id}`); // Navigate to the product details page
        } }
      >
        <Text className="text-white font-bold">Select</Text>
      </TouchableOpacity>
    </View>
  );

    // Add product to cart
    const addToCartByQueue = (product: any) => {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item._id === product.product._id);
        if (existingProduct) {
          // If product exists, increment its quantity
          return prevCart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // If product doesn't exist, add it with quantity 1
          return [...prevCart, { ...product.product, quantity: product.quantity }];
        }
      });
    };

  const [isQueueModalVisible, setQueueModalVisible] = useState(false); // State for queue modal
  const [productMenu, setProductMenu] = useState(false); // State for product modal
  
  const [isCheckoutModalVisible, setCheckoutModalVisible] = useState(false); // State for checkout modal
  const [cashTendered, setCashTendered] = useState(''); // State for cash tendered
  const [modeOfPayment, setModeOfPayment] = useState('Cash'); // State for mode of payment
  const [change, setChange] = useState(0); // State for computed change

  const [loading, setLoading] = useState(false); // State to track loading status


  const handleCheckoutSubmit = async () => {
    setLoading
    const total = calculateTotalPrice();
  try {
    const order = {
    mode_of_payment: modeOfPayment,
    cash_tendered: parseFloat(cashTendered),
    change,
    total,
    items: cart.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    })),
    };

    const response = await axios.post(`${apiUrl}/order/add-completed-order`, order);

    if (response.status === 200) {
    alert('Order successfully created!');
    } else {
    alert('Failed to create order. Please try again.');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    alert('An error occurred while creating the order.');
  }

  
    if (!modeOfPayment.trim()) {
      alert('Please select a mode of payment.');
      return;
    }
  
    const cash = parseFloat(cashTendered);
    if (isNaN(cash) || cash < total) {
      alert('Cash tendered must be a valid number and greater than or equal to the total amount.');
      return;
    }
  
    setChange(parseFloat((cash - total).toFixed(2))); // Compute the change to 2 decimal points
    alert(`Checkout successful! Change: PHP ${change}`);
    setCheckoutModalVisible(false); // Close the modal
    setCart([]); // Clear the cart after checkout
    setLoading(false); // Reset loading state
  };

  useEffect(() => {
    const total = calculateTotalPrice();
    const cash = parseFloat(cashTendered);
    if (!isNaN(cash) && cash >= total) {
      setChange(parseFloat((cash - total).toFixed(2))); // Compute the change and round to 2 decimals
    } else {
      setChange(0); // Reset change if cash is invalid or less than total
    }
  }, [cashTendered, cart]);

  return (
    <View className="flex-1 p-5">

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


      {/* Queued Orders Modal */}
      <Modal
        visible={isQueueModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQueueModalVisible(false)} // Close the modal when the user presses back
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
              width: '70%',
              height: '70%',
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
              Queued Orders
            </Text>

            <FlatList
            data={queue} // Use filtered data if search query is presen
            renderItem={renderQueueItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />

           {/* Buttons */}
           <View className="flex-row-reverse pt-2">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg ml-2"
              onPress={() => setQueueModalVisible(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            </View>

            
            
          </View>
        </View>
      </Modal>


    {/* Product Modal */}
    <Modal
      visible={productMenu}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setProductMenu(false)} // Close the modal when the user presses back
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
            height: '70%',
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
            Products Menu
          </Text>
  
          {/* Search Bar */}
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            className='border border-gray-300 rounded-lg focus:border-blue-500 p-2 mb-4'
            />

          <FlatList
            data={searchQuery ? filteredData : products} // Use filtered data if search query is presen
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />

          {/* Buttons */}
          <View className="flex-row-reverse pt-2">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg ml-2"
              onPress={() => setProductMenu(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            </View>

        
        </View>
      </View>
    </Modal>

      

    {/* Checkout Modal */}       
    <Modal
      visible={isCheckoutModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setCheckoutModalVisible(false)} // Close the modal when the user presses back
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
            width: Dimensions.get('window').width < 600 ? '80%' : '50%',
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
          <Text className='text-3xl font-bold mb-2'>
            Checkout
          </Text>


          {/* Mode of Payment Input */}
          <Text>Enter Mode of Payment: (e.g., Cash, Card)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg focus:border-blue-500 p-2 mb-4"
            placeholder="Mode of Payment (e.g., Cash, Card)"
            value={modeOfPayment}
            onChangeText={setModeOfPayment}
          />

          {/* Cash Tendered Input */}
          <Text>Amount Tendered:</Text>
          <TextInput
            className="border border-gray-300 rounded-lg focus:border-blue-500 p-2 mb-4"
            placeholder="Cash Tendered"
            value={cashTendered}
            onChangeText={setCashTendered}
            keyboardType="numeric"
            // style={{
            //   borderWidth: 1,
            //   borderColor: '#ccc',
            //   borderRadius: 5,
            //   padding: 10,
            //   marginBottom: 10,
            // }}
          />

          {/* Total and Change */}
            <Text className="text-xl font-extrabold mb-2">
            Total: PHP {calculateTotalPrice().toFixed(2)}
            </Text>
            <Text className="text-2xl mb-2 font-extrabold">
            Change: PHP {change.toFixed(2)}
            </Text>

          {/* Buttons */}
            <View className="flex-row-reverse">
            <TouchableOpacity
              className="bg-red-500 px-4 py-2 rounded-lg ml-2"
              onPress={() => setCheckoutModalVisible(false)}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={handleCheckoutSubmit}
            >
              <Text className="text-white font-bold">Submit</Text>
            </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>

      
      

      <View className={`flex-1 ${isPortrait ? 'flex-col' : 'flex-row justify-between'}`}>
        {/* Products Section */}
        <View className={`flex-1 ${isPortrait ? 'mb-4' : 'mr-4'}`}>

          

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

          <View className="flex-row justify-between m-1">
         
          <TouchableOpacity
            onPress={() => setProductMenu(true)} // Navigate to products page
            className="bg-white p-4 rounded-lg shadow-md flex-1 ml-2"
          >
              <Text className="text-gray-700 text-lg font-bold">Products</Text>
              <Text className="text-blue-500 text-2xl font-bold mt-2">{products.length}</Text>
            </TouchableOpacity>
          

          <TouchableOpacity
            onPress={() => setQueueModalVisible(true)} // Navigate to products page
            className="bg-white p-4 rounded-lg shadow-md flex-1 ml-2"
          >
              <Text className="text-gray-700 text-lg font-bold">Queued Orders</Text>
              <Text className="text-blue-500 text-2xl font-bold mt-2">{queue.length}</Text>
          </TouchableOpacity>
        </View>


        </View>

        {/* Cart Section */}
        <View className="flex-1  bg-gray-200 p-2">

          <Text className="text-xl font-bold mb-2">Cart</Text>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }} // Add padding to avoid overlap with fixed bottom section
          />

          
            {/* Fixed Bottom Section */}
            <View className="absolute bottom-0 left-0 right-0 bg-gray-200 p-4 border-t border-gray-300 flex-row justify-between items-center">
              <Text className="text-2xl font-bold">Total: PHP {calculateTotalPrice().toFixed(2)}</Text>
              
              
              <View className='flex-row'>

                  <TouchableOpacity className="bg-red-500 px-4 py-2 rounded-lg mx-2">
                    <Text className="text-white font-bold">Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                    onPress={() => setCheckoutModalVisible(true)} // Open the checkout modal
                  >
                    <Text className="text-white font-bold">Checkout</Text>
                  </TouchableOpacity>

                  
              </View>              

            </View>
            
        </View>        

      </View>

    </View>
  );
};

export default ShopPage;