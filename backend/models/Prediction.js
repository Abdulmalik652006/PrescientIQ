const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['demand', 'revenue', 'resources', 'risk', 'team-performance', 'workload'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityType' },
    entityType: { type: String, enum: ['Team', 'Resource', null], default: null },
    horizon: { type: Number, required: true }, // days: 7,30,90,180
    inputFeatures: { type: mongoose.Schema.Types.Mixed, required: true },
    predictedValue: { type: Number, required: true },
    growthPercentage: { type: Number },
    confidence: { type: Number, required: true }, // 0-100
    riskScore: { type: Number }, // 0-100
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    explanation: { type: String },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }],
    modelVersion: { type: String, default: 'v1.0.0' },
    actualValue: { type: Number, default: null }, // filled in later for accuracy comparison
    actualRecordedAt: { type: Date, default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PredictionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
