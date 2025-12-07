const express = require('express')
const cors = require('cors')


const userRouter = require("./routers/user")

const app = express()

app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send('Hello from server')
})
console.log('hi')

app.use('/api/user',userRouter)

const port = 4000
app.listen(port , 'localhost',()=>{
    console.log(`server is running on ${port}`)
})