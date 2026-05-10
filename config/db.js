import mongoose from "mongoose";

let cachaed = global.mongoose || {conn: null, promise: null};

export default async function connectDB() {
    if (cachaed.conn) {
        return cachaed.conn;
    };
    if (!cachaed.promise) {
        cachaed.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
            return mongoose;
        })
        try {
            cachaed.conn = await cachaed.promise;
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
        return cachaed.conn;
    }
}