import mongoose from "mongoose";

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/car-rental";
let connectedLogRegistered = false;

const connectWithUri = async (mongoUri) => {
    const connectionString = new URL(mongoUri);

    if (connectionString.pathname === "/") {
        connectionString.pathname = "/car-rental";
    }

    if (!connectedLogRegistered) {
        connectedLogRegistered = true;
        mongoose.connection.once('connected', ()=> console.log("Database Connected"));
    }

    await mongoose.connect(connectionString.toString(), {
        serverSelectionTimeoutMS: 10000,
    });
};

const connectDB = async ()=>{
    try {
        const mongoUri = process.env.MONGODB_URI;
        const localMongoUri = process.env.MONGODB_LOCAL_URI || DEFAULT_LOCAL_MONGO_URI;

        if(!mongoUri){
            console.warn("MONGODB_URI is not defined, falling back to local MongoDB.");
            await connectWithUri(localMongoUri);
            return;
        }

        try {
            await connectWithUri(mongoUri);
        } catch (primaryError) {
            console.error("Primary MongoDB connection failed:", primaryError.message);
            if (localMongoUri && localMongoUri !== mongoUri) {
                console.warn("Trying local MongoDB fallback...");
                await connectWithUri(localMongoUri);
                return;
            }

            throw primaryError;
        }
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export default connectDB;