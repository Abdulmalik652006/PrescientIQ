const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Human', 'Equipment', 'Compute', 'Facility', 'Other'],
      default: 'Human',
    },
    department: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    capacity: { type: Number, required: true, default: 100 },
    currentLoad: { type: Number, required: true, default: 50 },
    utilization: { type: Number, default: 50 }, // computed: currentLoad/capacity * 100
    status: {
      type: String,
      enum: ['Underutilized', 'Optimal', 'High', 'Critical'],
      default: 'Optimal',
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    availability: {
      type: String,
      enum: ['Available', 'Allocated', 'Overloaded', 'Offline'],
      default: 'Available',
    },
    historicalUtilization: [
      {
        date: { type: Date, default: Date.now },
        utilization: Number,
      },
    ],
  },
  { timestamps: true }
);

ResourceSchema.pre('save', function computeStatus(next) {
  this.utilization = this.capacity > 0 ? Math.round((this.currentLoad / this.capacity) * 100) : 0;

  if (this.utilization < 60) this.status = 'Underutilized';
  else if (this.utilization < 85) this.status = 'Optimal';
  else if (this.utilization < 95) this.status = 'High';
  else this.status = 'Critical';

  next();
});

ResourceSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);
