from fastapi import APIRouter

from backend.app.api.v1.endpoints.auth import router as auth_router
from backend.app.api.v1.endpoints.complaints import router as complaints_router
from backend.app.api.v1.endpoints.tracking import router as tracking_router
from backend.app.api.v1.endpoints.admin import router as admin_router
from backend.app.api.v1.endpoints.analytics import router as analytics_router
from backend.app.api.v1.endpoints.ml import router as ml_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth_router)
api_router.include_router(complaints_router)
api_router.include_router(tracking_router)
api_router.include_router(admin_router)
api_router.include_router(analytics_router)
api_router.include_router(ml_router)

