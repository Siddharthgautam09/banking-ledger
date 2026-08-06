import mongoose, { Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    _id: Types.ObjectId;
    userId: string;
    email: string;
    name: string;
    password: string;
    systemUser: boolean;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
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
    unique:true
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
   },
   systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select: false
   }
},{
    timestamps:true
})

userSchema.pre("save", async function(this: IUser){
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password=hash
})

userSchema.methods.comparePassword = async function(this: IUser, password: string){
    return await bcrypt.compare(password, this.password)
}

const UserModel = mongoose.model<IUser>("User",userSchema)

export default UserModel;
