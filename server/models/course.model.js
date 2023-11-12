const { Schema, model } = require("mongoose")


const reviewSchema = new Schema({
    user:{
        type:Object,
        required:true
    },
    rating:{
        type:Number,
        default:0
    },
    comment:String,
    reviewReplies:[Object]
})

const linkSchema = new Schema({
    title:String,
    url:String
})

const questiontSchema = new Schema({
    user:{
        type:Object,
        required:true
    },
    question:String,
    questionReplies:[Object]
})

const courseDataSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    videoUrl:{
        type:String,
        required:true
    },
    description:String,
    videoLength:Number,
    VideoPlayer:String,
    links:[linkSchema],
    suggestion:String,
    questions:[questiontSchema]
})

const courseSchema = Schema({
    name:{
        type:String, 
        required:true
    },
    description:{
        type:String, 
        required:true
    },
    price:{
        type:Number, 
        required:true
    },
    estimatedPrice:{
        type:Number, 
    },
    thumbnail:{
        publicId:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    tags:{
        type:String, 
        required:true
    },
    level:{
        type:String, 
        required:true
    },
    demoUrl:{
        type:String, 
        required:true
    },
    benifits:[{title:String}],
    prerequisites:[{title:String}],
    reviews:[reviewSchema],
    courseData:[courseDataSchema],
    ratings:{
        type:Number,
        default:0
    },
    purchased:{
        type:Number,
        default:0
    },
},{timestamps:true})


module.exports = model("Course", courseSchema)