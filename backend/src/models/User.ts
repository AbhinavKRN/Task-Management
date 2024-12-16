import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false 
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  try {
    const user = await User.findById(this._id).select('+password');
    if (!user) return false;
    
    return await bcrypt.compare(enteredPassword, user.password);
  } catch (error) {
    console.error('Password match error:', error);
    return false;
  }
};

const User = mongoose.model<UserDocument>('User', userSchema);
export default User;