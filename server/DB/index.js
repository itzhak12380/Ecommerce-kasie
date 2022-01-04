require('dotenv').config()
const mongoose = require('mongoose')

const URL = process.env.mongodbUrl
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
}, (error) => {
    if (error) throw error
    console.log("connected to mongodb");
})