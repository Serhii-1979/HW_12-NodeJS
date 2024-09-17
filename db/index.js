import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db('my_database');
    }catch(error){
        console.error("Failed to connect", error);
        process.exit(1);
    }
}

export default connectDB;