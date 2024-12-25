
const dotenv=require('dotenv')
dotenv.config()
const dbconfig=require('./config/dbConfig')
const user=require('./models/user')

const server=require('./app')
const port=process.env.PORT_NUMBER || 5000;



server.listen(port,()=>{
    console.log("lisenting to the port:",port)
})