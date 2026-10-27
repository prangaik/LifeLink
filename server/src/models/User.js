import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['donor', 'requester', 'reviewer', 'admin'],
      default: 'donor',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Specified'],
      default: 'Not Specified',
      required: function () {
        return this.role === 'donor';
      },
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    // GeoJSON Point: [Longitude, Latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: [true, 'Location coordinates are required'],
        default: [73.8567, 18.5204], // Pune default coordinates
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    notificationConsent: {
      type: Boolean,
      default: true,
    },
    notificationChannel: {
      type: String,
      enum: ['in-app', 'simulated-whatsapp'],
      default: 'in-app',
    },
    lastDonationDate: {
      type: Date,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isMedicallyVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial proximity search
userSchema.index({ location: '2dsphere' });
userSchema.index({ bloodGroup: 1, isAvailable: 1, notificationConsent: 1 });

// Password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
