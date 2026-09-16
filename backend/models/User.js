const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Analyst', 'Viewer'],
      default: 'Viewer',
    },
    department: { type: String, default: 'General' },
    avatarColor: { type: String, default: '#4F46E5' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      riskThreshold: { type: Number, default: 70 },
      predictionConfidenceThreshold: { type: Number, default: 80 },
      alertFrequency: { type: String, enum: ['realtime', 'hourly', 'daily'], default: 'realtime' },
      defaultForecastPeriod: { type: String, enum: ['7D', '30D', '90D', '180D', '1Y'], default: '30D' },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
