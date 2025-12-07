const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = true;
        console.log('MongoDB Connected:', conn.connection.host);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
        });

    } catch (error) {
        console.error('MongoDB not connected:', error.message);
        isConnected = false;
    }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
