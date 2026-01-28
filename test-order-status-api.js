const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testOrderStatusAPI() {
    try {
        console.log('🚀 Testing Order Status Change API...\n');
        
        console.log('1. Registering test user...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123',
            role: 'customer'
        });
        
        console.log('✅ User registered successfully');
        console.log(`User ID: ${registerResponse.data.user.id}`);
        
        console.log('\n2. Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123',
            role: 'customer'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log(`Token: ${token.substring(0, 20)}...`);
        
        console.log('\n3. Checking for existing orders...');
        const ordersResponse = await axios.get(`${BASE_URL}/order/get`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let orderId;
        if (ordersResponse.data.length > 0) {
            orderId = ordersResponse.data[0]._id;
            console.log(`✅ Found existing order: ${orderId}`);
        } else {
            console.log('❌ No existing orders found. You need to create an order first through the frontend.');
            console.log('Please add items to cart and create an order, then run this test again.');
            return;
        }
        
        console.log('\n4. Testing status update API...');
        
        console.log('Testing valid status update (pending -> processing)...');
        try {
            const updateResponse = await axios.put(`${BASE_URL}/order/update-status/${orderId}`, {
                status: 'processing'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Status update successful');
            console.log(`New status: ${updateResponse.data.order.status}`);
            console.log(`Status history entries: ${updateResponse.data.order.statusHistory.length}`);
            
            if (updateResponse.data.order.statusHistory.length > 0) {
                console.log('\nStatus History:');
                updateResponse.data.order.statusHistory.forEach((entry, index) => {
                    console.log(`${index + 1}. Status: ${entry.status} | Timestamp: ${new Date(entry.timestamp).toISOString()} | Updated by: ${entry.updatedBy}`);
                });
            }
        } catch (error) {
            console.log('❌ Status update failed:', error.response?.data?.msg || error.message);
        }
        
        console.log('\nTesting invalid status update...');
        try {
            await axios.put(`${BASE_URL}/order/update-status/${orderId}`, {
                status: 'invalid-status'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Invalid status was accepted (this should not happen)');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Invalid status correctly rejected');
                console.log(`Error message: ${error.response.data.msg}`);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        console.log('\nTesting same status update (should not change)...');
        try {
            const sameStatusResponse = await axios.put(`${BASE_URL}/order/update-status/${orderId}`, {
                status: 'processing'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (sameStatusResponse.status === 200 && sameStatusResponse.data.msg.includes('unchanged')) {
                console.log('✅ Same status correctly identified as unchanged');
            } else {
                console.log('ℹ️ Status was updated (may have been different from expected)');
            }
        } catch (error) {
            console.log('❌ Same status test failed:', error.message);
        }
        
        console.log('\n🎉 API testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 400) {
            console.log('Error details:', error.response.data);
        }
    }
}

testOrderStatusAPI();