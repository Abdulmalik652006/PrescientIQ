const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
    title: { type: String, required: true }, // e.g. "Resource Shortage"
    description: { type: String },
    probability: { type: Number, required: true }, // 0-100
    impact: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: {
      type: String,
      enum: ['Open', 'Monitoring', 'Assigned', 'Resolved', 'Escalated'],
      default: 'Open',
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    affectedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    predictionWindow: { type: String }, // e.g. "Next 30 days"
    rootCause: { type: String },
    predictionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ severity: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
