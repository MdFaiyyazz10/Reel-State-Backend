import express from 'express'



const app = express()


app.get('/' , (req,res,next) => {
    res.send("<h1>Working</h1>")
})