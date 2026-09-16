/**
 * Seeds MongoDB with realistic, relationally-consistent demo data:
 *  - 20+ teams across departments/regions
 *  - 100+ resources tied to those teams
 *  - 1000+ days*department operational records (365 days x multiple departments)
 *  - 100+ alerts derived from actual high-risk operations
 *  - 100+ predictions with plausible values tied to team/department data
 *
 * Run with: npm run seed  (from backend/)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Team = require('../models/Team');
const Resource = require('../models/Resource');
const Operation = require('../models/Operation');
const Alert = require('../models/Alert');
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');

const DEPARTMENTS = ['Operations', 'Engineering', 'Customer Support', 'Logistics', 'Sales'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const TEAM_NAME_POOL = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const riskLevelFor = (utilization, workload) => {
  const score = utilization * 0.5 + workload * 0.5;
  if (score >= 92) return 'Critical';
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};

const run = async () => {
  await connectDB();
  console.log('[Seed] Connected. Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Resource.deleteMany({}),
    Operation.deleteMany({}),
    Alert.deleteMany({}),
    Prediction.deleteMany({}),
    Recommendation.deleteMany({}),
  ]);

  // --- Users ---
  console.log('[Seed] Creating demo users...');
  const users = await User.create([
    { name: 'Admin User', email: 'admin@predictive.io', password: 'password123', role: 'Admin', department: 'Operations' },
    { name: 'Maya Chen', email: 'manager@predictive.io', password: 'password123', role: 'Manager', department: 'Engineering' },
    { name: 'Raj Patel', email: 'analyst@predictive.io', password: 'password123', role: 'Analyst', department: 'Logistics' },
    { name: 'Sam Rivera', email: 'viewer@predictive.io', password: 'password123', role: 'Viewer', department: 'Sales' },
  ]);

  // --- Teams (20+) ---
  console.log('[Seed] Creating teams...');
  const teams = [];
  let teamCounter = 0;
  for (const dept of DEPARTMENTS) {
    const teamsPerDept = randInt(4, 5); // ensures 20-25 total
    for (let i = 0; i < teamsPerDept; i += 1) {
      const name = `Team ${TEAM_NAME_POOL[teamCounter % TEAM_NAME_POOL.length]}`;
      teamCounter += 1;

      const performance = randInt(60, 96);
      const utilization = randInt(40, 98);
      const workload = randInt(40, 99);
      const efficiency = randInt(60, 95);
      const productivity = randInt(60, 95);

      teams.push({
        name: `${name} (${dept.slice(0, 3).toUpperCase()})`,
        department: dept,
        region: pick(REGIONS),
        memberCount: randInt(5, 25),
        resourceCount: 0, // filled after resources are created
        performance,
        utilization,
        efficiency,
        productivity,
        workload,
        riskLevel: riskLevelFor(utilization, workload),
        riskProbability: clamp(Math.round((utilization + workload) / 2 - randInt(0, 15)), 5, 97),
        historicalPerformance: Array.from({ length: 12 }, (_, m) => ({
          date: new Date(new Date().getFullYear(), new Date().getMonth() - (11 - m), 1),
          performance: clamp(performance + randInt(-8, 8), 40, 100),
          utilization: clamp(utilization + randInt(-10, 10), 20, 100),
          workload: clamp(workload + randInt(-10, 10), 20, 100),
        })),
      });
    }
  }
  const createdTeams = await Team.insertMany(teams);
  console.log(`[Seed] Created ${createdTeams.length} teams.`);

  // --- Resources (100+) ---
  console.log('[Seed] Creating resources...');
  const RESOURCE_TYPES = ['Human', 'Equipment', 'Compute', 'Facility'];
  const resources = [];
  createdTeams.forEach((team, idx) => {
    const countForTeam = randInt(4, 8); // ensures 100+ across 20+ teams
    for (let i = 0; i < countForTeam; i += 1) {
      const capacity = randInt(80, 150);
      const currentLoad = randInt(20, 150);
      resources.push({
        name: `${team.name.split(' (')[0]} Resource ${i + 1}`,
        type: pick(RESOURCE_TYPES),
        department: team.department,
        team: team._id,
        capacity,
        currentLoad: Math.min(currentLoad, Math.round(capacity * 1.1)),
        availability: currentLoad > capacity ? 'Overloaded' : currentLoad > capacity * 0.6 ? 'Allocated' : 'Available',
        historicalUtilization: Array.from({ length: 8 }, (_, w) => ({
          date: new Date(Date.now() - (7 - w) * 7 * 24 * 60 * 60 * 1000),
          utilization: clamp(Math.round((currentLoad / capacity) * 100) + randInt(-15, 15), 10, 120),
        })),
      });
    }
  });

  const createdResources = [];
  for (const r of resources) {
    // use .create individually (not insertMany) so the pre-save utilization/status hook runs
    // eslint-disable-next-line no-await-in-loop
    createdResources.push(await Resource.create(r));
  }
  console.log(`[Seed] Created ${createdResources.length} resources.`);

  // update resourceCount per team
  for (const team of createdTeams) {
    const count = createdResources.filter((r) => String(r.team) === String(team._id)).length;
    // eslint-disable-next-line no-await-in-loop
    await Team.findByIdAndUpdate(team._id, { resourceCount: count });
  }

  // --- Operations (1000+) ---
  console.log('[Seed] Creating operational history (365 days x departments)...');
  const operations = [];
  const today = new Date();
  const DAYS = 365;

  for (const dept of DEPARTMENTS) {
    const baseDemand = randInt(400, 900);
    let trendDemand = baseDemand;

    for (let d = DAYS; d >= 0; d -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);

      // seasonal + trend + noise
      const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 60;
      const trendStep = randFloat(-4, 6);
      trendDemand = clamp(trendDemand + trendStep, baseDemand * 0.5, baseDemand * 1.8);
      const demand = Math.round(trendDemand + seasonal + randInt(-30, 30));

      const resourceUtilization = clamp(Math.round(55 + (demand - baseDemand) / baseDemand * 40 + randInt(-8, 8)), 20, 100);
      const workload = clamp(Math.round(resourceUtilization * 0.9 + randInt(-10, 10)), 15, 100);
      const performance = clamp(Math.round(100 - Math.abs(workload - 70) * 0.6 + randInt(-6, 6)), 30, 100);
      const revenue = Math.round(demand * randFloat(18, 32));
      const absenteeism = clamp(Math.round(3 + (workload > 85 ? randInt(1, 6) : 0)), 0, 20);
      const incidents = workload > 90 ? randInt(0, 3) : workload > 75 ? randInt(0, 1) : 0;

      let status = 'Normal';
      if (workload > 90 || resourceUtilization > 92) status = 'Anomalous';
      else if (workload > 78 || resourceUtilization > 80) status = 'Elevated';

      operations.push({
        date,
        department: dept,
        region: pick(REGIONS),
        demand,
        revenue,
        workload,
        resourceUtilization,
        performance,
        absenteeism,
        incidents,
        status,
      });
    }
  }
  await Operation.insertMany(operations);
  console.log(`[Seed] Created ${operations.length} operational records.`);

  // --- Alerts (100+), derived from actual high-risk teams/operations ---
  console.log('[Seed] Creating alerts...');
  const ALERT_TITLES = ['Resource Shortage', 'Demand Spike', 'Team Overload', 'Performance Decline', 'Utilization Breach'];
  const alerts = [];

  // Generate alerts weighted toward higher-risk teams (realistic relationship, not random noise)
  for (let i = 0; i < 130; i += 1) {
    const team = pick(createdTeams);
    const severityBase = team.riskLevel;
    const severity =
      severityBase === 'Critical' ? pick(['Critical', 'High']) : severityBase === 'High' ? pick(['High', 'Medium']) : pick(['Medium', 'Low']);

    const probability = clamp(
      severity === 'Critical' ? randInt(80, 98) : severity === 'High' ? randInt(65, 89) : severity === 'Medium' ? randInt(40, 70) : randInt(10, 45),
      5,
      99
    );

    const status = pick(['Open', 'Open', 'Monitoring', 'Assigned', 'Resolved', 'Escalated']);

    alerts.push({
      severity,
      title: pick(ALERT_TITLES),
      description: `Automated monitoring flagged elevated ${pick(['workload', 'utilization', 'demand'])} for ${team.name}.`,
      probability,
      impact: severity === 'Critical' ? 'High' : severity === 'High' ? 'High' : 'Medium',
      status,
      team: team._id,
      predictionWindow: `Next ${pick([7, 30, 90])} days`,
      rootCause: `${team.name} utilization (${team.utilization}%) and workload (${team.workload}%) exceed safe operating thresholds.`,
      resolvedAt: status === 'Resolved' ? new Date(Date.now() - randInt(1, 20) * 24 * 60 * 60 * 1000) : undefined,
      createdAt: new Date(Date.now() - randInt(0, 60) * 24 * 60 * 60 * 1000),
    });
  }
  const createdAlerts = await Alert.insertMany(alerts);
  console.log(`[Seed] Created ${createdAlerts.length} alerts.`);

  // --- Recommendations tied to a subset of alerts ---
  console.log('[Seed] Creating recommendations...');
  const recommendations = [];
  for (const alert of createdAlerts.slice(0, 60)) {
    if (!alert.team) continue;
    const team = createdTeams.find((t) => String(t._id) === String(alert.team));
    if (!team) continue;
    recommendations.push({
      title: `Address ${alert.title.toLowerCase()} in ${team.name}`,
      description: `Based on a ${alert.probability}% probability ${alert.severity.toLowerCase()} risk alert.`,
      relatedAlert: alert._id,
      relatedTeam: team._id,
      action: `Allocate ${randInt(1, 4)} additional resource(s) to ${team.name}`,
      expectedImpact: `Risk reduction ≈ ${randInt(10, 30)}%`,
      expectedImpactValue: -randInt(10, 30),
      priority: alert.severity,
      status: pick(['Pending', 'Applied', 'Dismissed']),
    });
  }
  const createdRecommendations = await Recommendation.insertMany(recommendations);
  console.log(`[Seed] Created ${createdRecommendations.length} recommendations.`);

  // link some alerts back to their recommendations
  for (const rec of createdRecommendations) {
    if (rec.relatedAlert) {
      // eslint-disable-next-line no-await-in-loop
      await Alert.findByIdAndUpdate(rec.relatedAlert, { $push: { recommendations: rec._id } });
    }
  }

  // --- Predictions (100+), tied to real departments/teams and realistic values ---
  console.log('[Seed] Creating predictions...');
  const PREDICTION_TYPES = ['demand', 'revenue', 'resources', 'risk', 'team-performance', 'workload'];
  const predictions = [];

  for (let i = 0; i < 140; i += 1) {
    const type = pick(PREDICTION_TYPES);
    const team = pick(createdTeams);
    const horizon = pick([7, 30, 90, 180]);
    const confidence = randInt(78, 98);
    const growthPercentage = randFloat(-25, 30);

    let predictedValue;
    if (type === 'demand') predictedValue = randInt(8000, 22000);
    else if (type === 'revenue') predictedValue = randInt(150000, 600000);
    else if (type === 'resources') predictedValue = randInt(2, 40);
    else if (type === 'risk') predictedValue = randInt(10, 95);
    else if (type === 'team-performance') predictedValue = randInt(55, 98);
    else predictedValue = randInt(40, 99);

    const hasActual = Math.random() < 0.4;

    predictions.push({
      type,
      entityId: type === 'team-performance' ? team._id : undefined,
      entityType: type === 'team-performance' ? 'Team' : null,
      horizon,
      inputFeatures: {
        resource_utilization: team.utilization,
        workload: team.workload,
        performance: team.performance,
        department: team.department,
      },
      predictedValue,
      growthPercentage,
      confidence,
      riskScore: type === 'risk' ? predictedValue : randInt(10, 80),
      riskLevel: type === 'risk' ? riskLevelFor(team.utilization, team.workload) : undefined,
      explanation: `Projected ${type} for ${team.department} over the next ${horizon} days based on historical trends.`,
      modelVersion: 'v1.0.0',
      actualValue: hasActual ? Math.round(predictedValue * randFloat(0.85, 1.15)) : null,
      actualRecordedAt: hasActual ? new Date() : null,
      requestedBy: pick(users)._id,
      createdAt: new Date(Date.now() - randInt(0, 90) * 24 * 60 * 60 * 1000),
    });
  }
  const createdPredictions = await Prediction.insertMany(predictions);
  console.log(`[Seed] Created ${createdPredictions.length} predictions.`);

  console.log('\n[Seed] Done. Summary:');
  console.log(`  Users:           ${users.length}`);
  console.log(`  Teams:           ${createdTeams.length}`);
  console.log(`  Resources:       ${createdResources.length}`);
  console.log(`  Operations:      ${operations.length}`);
  console.log(`  Alerts:          ${createdAlerts.length}`);
  console.log(`  Recommendations: ${createdRecommendations.length}`);
  console.log(`  Predictions:     ${createdPredictions.length}`);
  console.log('\nDemo credentials:');
  console.log('  admin@predictive.io / password123 (Admin)');
  console.log('  manager@predictive.io / password123 (Manager)');
  console.log('  analyst@predictive.io / password123 (Analyst)');
  console.log('  viewer@predictive.io / password123 (Viewer)');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
