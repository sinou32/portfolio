from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db: AsyncIOMotorDatabase = client[os.environ.get('DB_NAME', 'architectural_portfolio')]

# Collections
projects_collection = db.projects
bio_collection = db.portfolio_bio

# Sample data for seeding
SAMPLE_PROJECTS = [
    {
        "title": "Modern Residential Complex",
        "description": "A contemporary residential development featuring sustainable design principles and innovative use of natural light. The project incorporates locally sourced materials and energy-efficient systems throughout.",
        "year": "2023",
        "client": "Green Living Development",
        "location": "Seattle, Washington",
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80"
        ],
        "plan_view": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80",
        "has_plan_view": True
    },
    {
        "title": "Cultural Arts Center",
        "description": "A dynamic cultural hub designed to foster community engagement through art and performance. The building features flexible spaces that can adapt to various cultural events and exhibitions.",
        "year": "2022",
        "client": "City Arts Foundation", 
        "location": "Portland, Oregon",
        "images": [
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        ],
        "plan_view": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
        "has_plan_view": True
    },
    {
        "title": "Sustainable Office Tower",
        "description": "A 20-story office building that achieves LEED Platinum certification through innovative sustainable design strategies including rainwater harvesting, solar panels, and green roof systems.",
        "year": "2023",
        "client": "EcoTech Solutions",
        "location": "San Francisco, California",
        "images": [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        ],
        "plan_view": "",
        "has_plan_view": False
    },
    {
        "title": "Waterfront Pavilion",
        "description": "An elegant pavilion structure designed for waterfront events and ceremonies. The design emphasizes transparency and connection with the natural waterfront environment.",
        "year": "2021",
        "client": "",
        "location": "Vancouver, Canada",
        "images": [
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        ],
        "plan_view": "",
        "has_plan_view": False
    }
]

# Default bio content
DEFAULT_BIO = {
    "bio_text": "",
    "bio_enabled": False
}


async def seed_database():
    """Seed database with sample projects if empty"""
    try:
        # Check if projects already exist
        project_count = await projects_collection.count_documents({})
        if project_count == 0:
            # Insert sample projects
            await projects_collection.insert_many(SAMPLE_PROJECTS)
            print(f"✅ Seeded database with {len(SAMPLE_PROJECTS)} projects")
        else:
            print(f"ℹ️  Database already has {project_count} projects")
        
        # Check if bio exists
        bio_count = await bio_collection.count_documents({})
        if bio_count == 0:
            # Insert default bio
            await bio_collection.insert_one(DEFAULT_BIO)
            print("✅ Initialized portfolio bio settings")
        else:
            print("ℹ️  Portfolio bio already configured")
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")


async def close_db_connection():
    """Close database connection"""
    client.close()