const connectToMongo=require('./db');
const express = require('express')
var cors = require('Cors')

connectToMongo();

const app = express()
const port = 4000
app.use(cors())
app.use(express.json())

//middle where
app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Hello World!Vikas')
// })

//Available Routes

app.use('/api/auth',require('./routes/auth'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})