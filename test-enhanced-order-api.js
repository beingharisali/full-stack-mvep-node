const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testEnhancedOrderAPI() {
    try {
        console.log('🚀 Testing Enhanced Order API...\n');
        
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com', 
            password: 'admin123',
            role: 'admin'
        });
        
        const adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        console.log('\n2. Testing get all orders (admin)...');
        const allOrdersResponse = await axios.get(`${BASE_URL}/order/get-all`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        console.log('✅ Get all orders successful');
        console.log(`Total orders: ${allOrdersResponse.data.totalCount}`);
        console.log('Status Summary:', allOrdersResponse.data.statusSummary);
        
        if (allOrdersResponse.data.orders.length > 0) {
            console.log('\nSample Order Details:');
            const sampleOrder = allOrdersResponse.data.orders[0];
            console.log(`Order ID: ${sampleOrder._id}`);
            console.log(`Status: ${sampleOrder.status} (${sampleOrder.statusInfo.statusDisplay})`);
            console.log(`Customer: ${sampleOrder.user.name}`);
            console.log(`Total Amount: $${sampleOrder.totalAmount}`);
            console.log(`Status Changes: ${sampleOrder.statusInfo.totalStatusChanges}`);
            console.log(`Last Updated: ${new Date(sampleOrder.statusInfo.lastUpdated).toLocaleString()}`);
            
            if (sampleOrder.statusHistory.length > 0) {
                console.log('\nStatus History:');
                sampleOrder.statusHistory.forEach((entry, index) => {
                    console.log(`${index + 1}. ${entry.status} - ${new Date(entry.timestamp).toLocaleString()}`);
                });
            }
        }
        
        console.log('\n3. Testing get user orders...');
        const userOrdersResponse = await axios.get(`${BASE_URL}/order/get`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        console.log('✅ Get user orders successful');
        console.log(`User orders count: ${userOrdersResponse.data.length}`);
        
        if (userOrdersResponse.data.length > 0) {
            const userOrder = userOrdersResponse.data[0];
            console.log(`\nUser Order Status: ${userOrder.status}`);
            console.log(`Status Info:`, userOrder.statusInfo);
        }
        
        console.log('\n4. Testing get single order...');
        if (allOrdersResponse.data.orders.length > 0) {
            const orderId = allOrdersResponse.data.orders[0]._id;
            const singleOrderResponse = await axios.get(`${BASE_URL}/order/single/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            console.log('✅ Get single order successful');
            console.log(`Order Status: ${singleOrderResponse.data.statusDetails.currentStatus}`);
            console.log(`Can be cancelled: ${singleOrderResponse.data.statusDetails.canBeCancelled}`);
            console.log(`Formatted last updated: ${singleOrderResponse.data.statusDetails.formattedLastUpdated}`);
        }
        
        console.log('\n🎉 Enhanced Order API testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401 || error.response?.status === 404) {
            console.log('\n⚠️  Admin login failed. Trying with customer account...');
            try {
                const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
                    email: 'test1769419507786@example.com',
                    password: 'password123',
                    role: 'customer'
                });
                
                const customerToken = customerLogin.data.token;
                console.log('✅ Customer login successful');
                
                const customerOrders = await axios.get(`${BASE_URL}/order/get`, {
                    headers: {
                        'Authorization': `Bearer ${customerToken}`
                    }
                });
                
                console.log('✅ Customer orders retrieved successfully');
                console.log(`Orders count: ${customerOrders.data.length}`);
                
                if (customerOrders.data.length > 0) {
                    const order = customerOrders.data[0];
                    console.log(`\nOrder Status: ${order.status}`);
                    console.log(`Status Info:`, order.statusInfo);
                }
                
            } catch (customerError) {
                console.error('❌ Customer test also failed:', customerError.response?.data || customerError.message);
            }
        }
    }
}

testEnhancedOrderAPI();