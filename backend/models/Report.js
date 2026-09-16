const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    period: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Custom'], required: true },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    kpiSummary: { type: mongoose.Schema.Types.Mixed },
    analyticsSummary: { type: mongoose.Schema.Types.Mixed },
    predictionsSummary: { type: mongoose.Schema.Types.Mixed },
    risksSummary: { type: mongoose.Schema.Types.Mixed },
    resourcesSummary: { type: mongoose.Schema.Types.Mixed },
    teamsSummary: { type: mongoose.Schema.Types.Mixed },
    recommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }],
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
