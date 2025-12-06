const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send('Hello from server')
})
console.log('hi')

const port = 4000
app.listen(port , 'localhost',()=>{
    console.log(`server is running on ${port}`)
})