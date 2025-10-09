import mongoose from "mongoose";

const option = {
  socketTimeoutMS: 30000,
};

const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, option);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(`Error`, error);
  }
};

export default connectDb;
