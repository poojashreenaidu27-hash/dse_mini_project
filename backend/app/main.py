from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.db.base import init_db
from backend.app.db.session import get_db
from backend.app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Application startup
    init_db()
    yield
    # Application shutdown


app = FastAPI(
    title="CampusFix API",
    version="1.0.0",
    description="CampusFix: An Anonymous Campus Complaint Management and Predictive Maintenance Analytics System",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# Configure CORS for local development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api")


@app.get("/api/v1/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Readiness probe checking database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "service": "CampusFix Backend API",
            "environment": settings.ENVIRONMENT,
            "database": "connected",
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "service": "CampusFix Backend API",
                "database_error": str(e) if settings.DEBUG else "Database connection failure",
            },
        )

