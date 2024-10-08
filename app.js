import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { v2 as cloudinary } from 'cloudinary';
import { errorMiddleware } from './middleware/errorMiddleware.js'


dotenv.config({path: "./config/config.env"})

connectDB()
const app = express()


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});


app.get('/' , (req,res,next) => {
    res.send("<h1>Working</h1>")
})


// Middleware 
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    methods: ["POST" , "GET" , "DELETE" , "PUT"],
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


  



// Routes
import blogRouter from './routes/blog.js'
import userRouter from './routes/user.js'
import adminRouter from './routes/admin.js'
import galleryRouter from './routes/gallery.js'
import messageRouter from './routes/message.js'


app.use('/api/v1/user', userRouter);
app.use('/api/v1/blog' , blogRouter)
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', messageRouter);





app.listen(process.env.PORT , () => {
    console.log(`Server is Running on PORT:${process.env.PORT}`)
})








// using Error middle ware

app.use(errorMiddleware)