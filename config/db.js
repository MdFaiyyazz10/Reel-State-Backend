import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Reel-state",
    })
    .then((con) => {
      console.log(`MongoDB Connected ${con.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
