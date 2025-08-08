# Backend Integration Contracts

## Database Models

### Project Model
```python
class Project:
    id: ObjectId
    title: str (required)
    description: str (optional)
    year: str (optional)
    client: str (optional) 
    location: str (optional)
    images: List[str] (required, at least 1)
    plan_view: str (optional)
    has_plan_view: bool (default: False)
    created_at: datetime
    updated_at: datetime
```

### Admin Authentication
```python
# Simple password-based auth for demo
ADMIN_PASSWORD = "architecture2024"
```

## API Endpoints

### Public Endpoints
- `GET /api/projects` - Get all projects for public portfolio view
- `POST /api/auth/login` - Admin login with password
- `GET /api/auth/verify` - Verify admin session

### Protected Admin Endpoints (require authentication)
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/{id}` - Update project
- `DELETE /api/admin/projects/{id}` - Delete project

## Frontend Integration Plan

### Mock Data Removal
Remove `/app/frontend/src/mock.js` and replace with API calls:

1. **Portfolio Component**: Replace `mockProjects` with API call to `/api/projects`
2. **Admin Login**: Replace local auth with API call to `/api/auth/login`
3. **Admin Dashboard**: Replace local CRUD operations with API calls to admin endpoints

### Authentication Flow
1. Admin login sends password to `/api/auth/login`
2. Backend validates password and returns session token
3. Token stored in localStorage and included in subsequent admin API calls
4. Session verification on page reload

### Enhanced Features to Add
1. **Smooth Scrolling**: Implement scroll-snap behavior where each scroll moves to next project
2. **PDF Export**: Re-enable html2pdf.js functionality after backend integration
3. **Image Upload**: Future enhancement for file uploads instead of URLs

## Data Migration
Current mock data will be seeded into MongoDB on backend startup for seamless transition.

## Error Handling
- Graceful handling of missing fields (don't display empty fields)
- Loading states for all API calls
- Error messages for failed operations
- Offline fallback behavior