import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required : true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
 
    {timestamps: true});


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
    
}


export default mongoose.model("User", userSchema);