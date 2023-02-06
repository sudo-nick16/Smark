import mongoose from "mongoose";

function db() {
    const dbUri = process.env.DB_URI!;
    mongoose.connect(dbUri, {}, () => {
        console.log("connected to db");
    })
}
