const express = require('express')
const cors = require('cors')
const path = require('path');


const userRouter = require("./routers/user")
const orgRouter = require("./routers/organizations");
const candidateRouter = require("./routers/candidate")
const authorizeUser = require('./utils/authUser');


const app = express()

app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));
app.use(cors())
app.use(express.json())
app.use(authorizeUser);


app.get('/',(req,res)=>{
    res.send('Hello from server')
})
console.log('hi')

app.use('/api/users',userRouter)
app.use('/api/candidates',candidateRouter)
app.use('/api/organizations',orgRouter)

const port = 4000
app.listen(port , 'localhost',()=>{
    console.log(`server is running on ${port}`)
})