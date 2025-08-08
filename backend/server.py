from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from typing import List, Optional
import logging
from datetime import datetime, timedelta
from bson import ObjectId

# Import our modules
from models import Project, ProjectCreate, ProjectUpdate, PortfolioBio, PortfolioBioUpdate, LoginRequest, LoginResponse
from auth import verify_password, create_access_token, verify_token
from database import db, projects_collection, bio_collection, seed_database, close_db_connection

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return payload


# Public endpoints
@api_router.get("/")
async def root():
    return {"message": "Architectural Portfolio API"}


@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    """Get all projects for public portfolio view"""
    try:
        projects_cursor = projects_collection.find({})
        projects = await projects_cursor.to_list(length=100)
        
        # Convert ObjectId to string for each project
        for project in projects:
            project["_id"] = str(project["_id"])
            
        return projects
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@api_router.get("/portfolio-bio", response_model=PortfolioBio)
async def get_portfolio_bio():
    """Get portfolio bio/description for public view"""
    try:
        bio = await bio_collection.find_one({})
        if bio:
            bio["_id"] = str(bio["_id"])
            return bio
        else:
            # Return default if none exists
            default_bio = {"_id": "default", "bio_text": "", "bio_enabled": False, "updated_at": datetime.utcnow()}
            return default_bio
    except Exception as e:
        logger.error(f"Error fetching bio: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Authentication endpoints
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Admin login"""
    if not verify_password(login_request.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": "admin"}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        message="Login successful",
        token=access_token,
        success=True
    )


@api_router.get("/auth/verify")
async def verify_authentication(current_user: dict = Depends(get_current_user)):
    """Verify current authentication status"""
    return {"message": "Authentication valid", "user": current_user["sub"]}


# Protected admin endpoints
@api_router.post("/admin/projects", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new project (admin only)"""
    try:
        # Add timestamps
        project_dict = project_data.dict()
        project_dict["created_at"] = datetime.utcnow()
        project_dict["updated_at"] = datetime.utcnow()
        
        # Insert into database
        result = await projects_collection.insert_one(project_dict)
        
        # Fetch the created project
        created_project = await projects_collection.find_one({"_id": result.inserted_id})
        created_project["_id"] = str(created_project["_id"])
        
        return created_project
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a project (admin only)"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="Invalid project ID")
        
        # Update data
        update_dict = project_data.dict()
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update in database
        result = await projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch updated project
        updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        updated_project["_id"] = str(updated_project["_id"])
        
        return updated_project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {e}")
        raise HTTPException(status_code=500, detail="Failed to update project")


@api_router.delete("/admin/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a project (admin only)"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="Invalid project ID")
        
        # Delete from database
        result = await projects_collection.delete_one({"_id": ObjectId(project_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")


@api_router.put("/admin/portfolio-bio", response_model=PortfolioBio)
async def update_portfolio_bio(
    bio_data: PortfolioBioUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update portfolio bio/description (admin only)"""
    try:
        # Update data
        update_dict = bio_data.dict()
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update or insert bio
        result = await bio_collection.update_one(
            {},  # Update any existing bio
            {"$set": update_dict},
            upsert=True
        )
        
        # Fetch updated bio
        updated_bio = await bio_collection.find_one({})
        if updated_bio:
            updated_bio["_id"] = str(updated_bio["_id"])
            return updated_bio
        else:
            raise HTTPException(status_code=500, detail="Failed to update bio")
            
    except Exception as e:
        logger.error(f"Error updating bio: {e}")
        raise HTTPException(status_code=500, detail="Failed to update bio")


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db():
    """Initialize database on startup"""
    await seed_database()


@app.on_event("shutdown")
async def shutdown_db():
    """Close database connection on shutdown"""
    await close_db_connection()