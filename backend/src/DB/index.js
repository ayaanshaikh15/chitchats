import mongoose from "mongoose";
 const connectDB=async()=>{
  try{
    const mongouri=process.env.MONGO_URL
    if(!mongouri){
        throw new Error("MONGO_URL is not defined in .env file");
    }
   
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully"+conn.connection.host);
  }catch(err){
    console.log(err);
  }
}
export default connectDB;