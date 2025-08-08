from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = ""
    year: Optional[str] = ""
    client: Optional[str] = ""
    location: Optional[str] = ""
    images: List[str] = []
    plan_view: Optional[str] = ""
    has_plan_view: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class Project(ProjectBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class PortfolioBioBase(BaseModel):
    bio_text: str = ""
    bio_enabled: bool = False


class PortfolioBioUpdate(PortfolioBioBase):
    pass


class PortfolioBio(PortfolioBioBase):
    id: str = Field(alias="_id")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    message: str
    token: str
    success: bool