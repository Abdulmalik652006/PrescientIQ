const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    basedOnPrediction: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
    relatedAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
    relatedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    action: { type: String }, // e.g. "Allocate 2 additional resources to Team Gamma"
    expectedImpact: { type: String }, // e.g. "Risk reduction ~23%"
    expectedImpactValue: { type: Number }, // numeric estimate, e.g. -23 (percent)
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Applied', 'Dismissed'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
