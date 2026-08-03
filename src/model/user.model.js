import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      unique: true,
      required: true
    },
    
   email:{
    type:String,
    required:[true,"Email is required for creating a user"],
    trim:true,
    lowercase:true,
    match:[ /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/ , "Invalid email address"],
    unique:[true, "Email already exist"]
   },
   
   name:{
    type:String,
    required:[true,"Name is required to create a account"],
   },

   password:{
    type:String,
    required:[true,"Password is required to create a account"],
    minlength:[6, "passowrd should have more than 6 characters"],
    select: false
   }

},{
    timestamps:true
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password=hash
    return 
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const UserModel = mongoose.model("User",userSchema)

export default UserModel; 