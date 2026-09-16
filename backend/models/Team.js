const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    region: { type: String, default: 'HQ' },
    memberCount: { type: Number, default: 0 },
    resourceCount: { type: Number, default: 0 },
    performance: { type: Number, default: 80 }, // 0-100
    utilization: { type: Number, default: 60 }, // 0-100
    efficiency: { type: Number, default: 75 }, // 0-100
    productivity: { type: Number, default: 75 }, // 0-100
    workload: { type: Number, default: 60 }, // 0-100
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    riskProbability: { type: Number, default: 10 }, // 0-100
    historicalPerformance: [
      {
        date: { type: Date, default: Date.now },
        performance: Number,
        utilization: Number,
        workload: Number,
      },
    ],
  },
  { timestamps: true }
);

TeamSchema.index({ department: 1 });

module.exports = mongoose.model('Team', TeamSchema);
