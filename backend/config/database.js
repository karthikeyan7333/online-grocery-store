var mongoose = require("mongoose");
function database(){
    mongoose.connect("mongodb://localhost:27017/grocery").then(()=>{
        console.log("Database connected")
    }).catch((err)=>{
        console.log(err)
    })
}
module.exports=database