const mongoose = require('mongoose');

const ForecastSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Demand', 'Revenue', 'Resource', 'Workload', 'Risk'],
      required: true,
    },
    period: { type: String, enum: ['7D', '30D', '90D', '6M', '1Y'], required: true },
    current: { type: Number, required: true },
    predicted: { type: Number, required: true },
    growthPercentage: { type: Number, required: true },
    confidence: { type: Number, required: true },
    series: [
      {
        date: { type: Date },
        actual: { type: Number, default: null },
        forecast: { type: Number, default: null },
        upperBound: { type: Number, default: null },
        lowerBound: { type: Number, default: null },
      },
    ],
    accuracy: { type: Number }, // most recent computed accuracy % for this forecast type
    previousAccuracy: { type: Number },
    predictionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Forecast', ForecastSchema);
