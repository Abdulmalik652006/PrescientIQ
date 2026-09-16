const mongoose = require('mongoose');

const OperationSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    department: { type: String, required: true },
    region: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    demand: { type: Number, required: true },
    revenue: { type: Number, required: true },
    workload: { type: Number, required: true }, // 0-100
    resourceUtilization: { type: Number, required: true }, // 0-100
    performance: { type: Number, required: true }, // 0-100
    absenteeism: { type: Number, default: 0 }, // 0-100 (% of team out)
    incidents: { type: Number, default: 0 }, // count of operational incidents that day
    status: {
      type: String,
      enum: ['Normal', 'Elevated', 'Anomalous'],
      default: 'Normal',
    },
  },
  { timestamps: true }
);

OperationSchema.index({ date: -1, department: 1, region: 1 });

module.exports = mongoose.model('Operation', OperationSchema);
