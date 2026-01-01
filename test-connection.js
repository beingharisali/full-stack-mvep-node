require('dotenv').config();

const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MONGO_URI:', process.env.MONGO_URI); 
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connection successful!');
        
        console.log('Testing database operations...');
        
        const testSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Test document created successfully!');
        
        const doc = await TestModel.findOne({ name: 'Connection Test' });
        console.log('✅ Retrieved test document:', doc.name);
        
        await TestModel.deleteMany({ name: 'Connection Test' });
        console.log('✅ Test document cleaned up!');
        
        console.log('\n🎉 MongoDB connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during MongoDB connection test:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

testConnection();