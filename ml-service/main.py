"""
Predictive Management System — Python ML Service (FastAPI)

Exposes:
  GET  /health
  POST /predict/demand
  POST /predict/risk
  POST /predict/resources
  POST /predict/team-performance
  POST /detect/anomaly
  POST /forecast

Run: uvicorn main:app --reload --port 8000
"""
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictors.demand_predictor import predict_demand
from predictors.risk_predictor import predict_risk
from predictors.resource_predictor import predict_resources
from predictors.anomaly_detector import detect_anomaly
from predictors.team_predictor import predict_team_performance

app = FastAPI(
    title="Predictive Management System — ML Service",
    description="Serves demand, risk, resource, anomaly, and team-performance predictions.",
    version="1.0.0",
)

# Node.js backend is the only intended caller, but CORS is left open for local dev/testing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request schemas ----------

class DemandRequest(BaseModel):
    historical_demand: List[float] = Field(default_factory=list)
    resource_utilization: float = 70
    workload: float = 65
    department: str = "Operations"
    region: str = "Central"
    horizon: int = 30
    target: Optional[str] = None  # "revenue" reuses the demand model with different framing


class RiskRequest(BaseModel):
    resource_utilization: float = 70
    workload: float = 65
    performance: float = 78
    absenteeism: float = 3
    historical_incidents: int = 0
    demand_growth: float = 0
    team_capacity: float = 100


class ResourceRequest(BaseModel):
    workload: float = 65
    resource_utilization: float = 70
    team_capacity: float = 100
    demand_growth: float = 0
    horizon: int = 30


class TeamPerformanceRequest(BaseModel):
    historical_performance: float = 78
    workload: float = 65
    utilization: float = 70
    task_completion: float = 80
    resource_count: int = 8
    efficiency: float = 78
    horizon: int = 30


class AnomalyRequest(BaseModel):
    values: List[float] = Field(default_factory=list)
    department: str = "Unknown"
    metric: str = "workload"
    performance: float = 78
    historical_incidents: int = 0


class ForecastRequest(BaseModel):
    historical_values: List[float] = Field(default_factory=list)
    forecast_type: str = "demand"  # demand | revenue | workload | resource | risk
    horizon: int = 30


# ---------- Endpoints ----------

@app.get("/health")
def health():
    return {"status": "ok", "service": "predictive-management-ml-service", "version": "1.0.0"}


@app.post("/predict/demand")
def route_predict_demand(req: DemandRequest):
    try:
        result = predict_demand(
            historical_demand=req.historical_demand,
            resource_utilization=req.resource_utilization,
            workload=req.workload,
            department=req.department,
            region=req.region,
            horizon=req.horizon,
        )
        # Revenue framing: apply a per-unit revenue coefficient to the demand prediction.
        if req.target == "revenue":
            revenue_coefficient = 25.0
            result = {
                "prediction": round(result["prediction"] * revenue_coefficient, 1),
                "growth_percentage": result["growth_percentage"],
                "confidence": result["confidence"],
            }
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Demand prediction failed: {exc}")


@app.post("/predict/risk")
def route_predict_risk(req: RiskRequest):
    try:
        return predict_risk(**req.dict())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {exc}")


@app.post("/predict/resources")
def route_predict_resources(req: ResourceRequest):
    try:
        return predict_resources(**req.dict())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Resource prediction failed: {exc}")


@app.post("/predict/team-performance")
def route_predict_team_performance(req: TeamPerformanceRequest):
    try:
        return predict_team_performance(**req.dict())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Team performance prediction failed: {exc}")


@app.post("/detect/anomaly")
def route_detect_anomaly(req: AnomalyRequest):
    try:
        return detect_anomaly(
            values=req.values,
            department=req.department,
            metric=req.metric,
            performance=req.performance,
            historical_incidents=req.historical_incidents,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {exc}")


@app.post("/forecast")
def route_forecast(req: ForecastRequest):
    """
    General-purpose forecast endpoint used by the Forecast Center. Routes to the demand
    model as the underlying time-series engine regardless of forecast_type, since all
    tracked metrics (demand, revenue, workload, resource, risk) move with the same
    operational drivers in this dataset.
    """
    try:
        values = req.historical_values or [500.0]
        result = predict_demand(
            historical_demand=values,
            resource_utilization=70,
            workload=65,
            horizon=req.horizon,
        )

        if req.forecast_type == "revenue":
            result["prediction"] = round(result["prediction"] * 25.0, 1)
        elif req.forecast_type in ("workload", "resource"):
            # scale down since these are typically 0-100 bounded metrics, not raw demand units
            latest = values[-1] if values else 65
            growth_factor = 1 + (result["growth_percentage"] / 100)
            result["prediction"] = round(min(100.0, max(0.0, latest * growth_factor)), 1)
        elif req.forecast_type == "risk":
            latest = values[-1] if values else 50
            growth_factor = 1 + (result["growth_percentage"] / 100)
            result["prediction"] = round(min(100.0, max(0.0, latest * growth_factor)), 1)

        return {
            "prediction": result["prediction"],
            "predicted": result["prediction"],
            "growth_percentage": result["growth_percentage"],
            "confidence": result["confidence"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {exc}")
