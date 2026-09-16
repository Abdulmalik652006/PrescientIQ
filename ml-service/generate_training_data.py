"""
Generates ml-service/data/training_data.csv — realistic, related synthetic operational
history used to train all five models (demand, risk, resource, anomaly, team performance).

Run: python generate_training_data.py
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

DEPARTMENTS = ["Operations", "Engineering", "Customer Support", "Logistics", "Sales"]
REGIONS = ["North", "South", "East", "West", "Central"]

DAYS = 730  # 2 years of daily history per department
rows = []
today = datetime.today()

for dept in DEPARTMENTS:
    base_demand = np.random.randint(400, 900)
    trend_demand = base_demand
    base_capacity = np.random.randint(90, 140)

    for d in range(DAYS, -1, -1):
        date = today - timedelta(days=d)

        # seasonality + trend + noise for demand
        seasonal = 60 * np.sin((date.timetuple().tm_yday / 365) * 2 * np.pi)
        trend_step = np.random.uniform(-4, 6)
        trend_demand = np.clip(trend_demand + trend_step, base_demand * 0.5, base_demand * 1.9)
        demand = max(50, trend_demand + seasonal + np.random.randint(-30, 30))

        weekly_average = demand + np.random.uniform(-20, 20)
        monthly_average = demand + np.random.uniform(-40, 40)

        resource_utilization = np.clip(
            55 + (demand - base_demand) / base_demand * 40 + np.random.randint(-8, 8), 15, 100
        )
        workload = np.clip(resource_utilization * 0.9 + np.random.randint(-10, 10), 10, 100)
        performance = np.clip(100 - abs(workload - 70) * 0.6 + np.random.randint(-6, 6), 25, 100)
        absenteeism = np.clip(3 + (6 if workload > 85 else 0) + np.random.randint(-2, 3), 0, 25)
        historical_incidents = np.random.poisson(0.3 if workload > 88 else 0.05)
        team_capacity = base_capacity + np.random.randint(-10, 10)

        demand_growth = ((demand - base_demand) / base_demand) * 100

        # risk label derived from a realistic weighted combination (not arbitrary)
        risk_raw = (
            0.30 * resource_utilization
            + 0.30 * workload
            + 0.15 * absenteeism * 2
            + 0.15 * min(historical_incidents * 20, 100)
            + 0.10 * max(demand_growth, 0)
        )
        risk_raw = np.clip(risk_raw, 0, 100)
        if risk_raw >= 85:
            risk_level = "Critical"
        elif risk_raw >= 65:
            risk_level = "High"
        elif risk_raw >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # required resources derived from workload vs capacity (realistic relationship)
        required_resources = max(1, round((workload / 100) * team_capacity / 10))
        capacity_gap = round(((workload - resource_utilization) / 100) * team_capacity / 10, 1)

        # team performance features
        efficiency = np.clip(performance * 0.9 + np.random.randint(-5, 5), 20, 100)
        task_completion = np.clip(efficiency + np.random.randint(-8, 8), 10, 100)
        resource_count = max(1, round(team_capacity / 12))

        # anomaly label: extreme deviations
        is_anomaly = int(workload > 93 or resource_utilization > 95 or historical_incidents >= 2)

        rows.append(
            dict(
                date=date.strftime("%Y-%m-%d"),
                department=dept,
                region=np.random.choice(REGIONS),
                demand=round(demand, 1),
                previous_demand=round(demand - trend_step, 1),
                weekly_average=round(weekly_average, 1),
                monthly_average=round(monthly_average, 1),
                seasonality=round(seasonal, 2),
                resource_utilization=round(resource_utilization, 1),
                workload=round(workload, 1),
                performance=round(performance, 1),
                absenteeism=round(absenteeism, 1),
                historical_incidents=int(historical_incidents),
                demand_growth=round(demand_growth, 2),
                team_capacity=team_capacity,
                risk_level=risk_level,
                risk_score=round(risk_raw, 1),
                required_resources=required_resources,
                capacity_gap=capacity_gap,
                efficiency=round(efficiency, 1),
                task_completion=round(task_completion, 1),
                resource_count=resource_count,
                is_anomaly=is_anomaly,
                revenue=round(demand * np.random.uniform(18, 32), 1),
            )
        )

df = pd.DataFrame(rows)
df.to_csv("data/training_data.csv", index=False)
print(f"Generated {len(df)} rows -> data/training_data.csv")
print(df.head())
