const { Schema, model, Document } = require("mongoose")
const bcrypt = require("bcryptjs")
const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const userSchema = Schema({
    name: {
        type:String,
        required:[true, "Please enter your name"]
    },
    email:{
        type:String,
        required:[true, "Please enter your email"],
        validate:{
            validator:(value) => {
                return emailRegx.test(value)
            },
            message:"Please enter valid email"
        },
        unique:true
    },
    password:{
        type:String,
        select:false,
        minlength:[8, "Password at least 8 characters"],
    },
    avatar:{
        publicId:String,
        url:String
    },
    role:{
        type:String,
        default:"user"
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    courses:{
        type:Array,
        default:[]
    }
},{
    timestamps:true
})

userSchema.methods.comparePassword =async function(password) {
    return await bcrypt.compare(password, this.password)
}

module.exports = model("User", userSchema)