#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Architectural Portfolio
Tests all backend functionality including authentication, CRUD operations, and data validation.
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = "https://13f8fd52-7f89-4ccf-9013-38a3ce3fcf07.preview.emergentagent.com/api"
ADMIN_PASSWORD = "architecture2024"

class ArchitecturalPortfolioTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        self.created_project_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    async def test_database_initialization(self):
        """Test 1: Database Initialization - Verify database seeding works on startup"""
        try:
            response = await self.session.get(f"{BACKEND_URL}/projects")
            if response.status == 200:
                projects = await response.json()
                if len(projects) >= 4:  # Should have sample projects
                    # Verify sample project structure
                    sample_project = projects[0]
                    required_fields = ["title", "description", "year", "client", "location", "images", "has_plan_view"]
                    missing_fields = [field for field in required_fields if field not in sample_project]
                    
                    if not missing_fields:
                        self.log_test("Database Initialization", True, 
                                    f"Database properly seeded with {len(projects)} projects")
                        return True
                    else:
                        self.log_test("Database Initialization", False, 
                                    f"Sample projects missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Database Initialization", False, 
                                f"Expected at least 4 sample projects, got {len(projects)}")
                    return False
            else:
                self.log_test("Database Initialization", False, 
                            f"Failed to fetch projects: HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Database Initialization", False, f"Exception: {str(e)}")
            return False
    
    async def test_public_portfolio_api(self):
        """Test 2: Public Portfolio API - GET /api/projects"""
        try:
            response = await self.session.get(f"{BACKEND_URL}/projects")
            if response.status == 200:
                projects = await response.json()
                
                # Verify response format
                if isinstance(projects, list) and len(projects) > 0:
                    # Check first project structure
                    project = projects[0]
                    expected_fields = ["_id", "title", "description", "year", "client", 
                                     "location", "images", "plan_view", "has_plan_view"]
                    
                    has_all_fields = all(field in project for field in expected_fields)
                    
                    if has_all_fields:
                        # Verify architectural project data
                        architectural_titles = ["Modern Residential Complex", "Cultural Arts Center", 
                                              "Sustainable Office Tower", "Waterfront Pavilion"]
                        found_titles = [p.get("title", "") for p in projects]
                        has_sample_data = any(title in found_titles for title in architectural_titles)
                        
                        if has_sample_data:
                            self.log_test("Public Portfolio API", True, 
                                        f"Successfully retrieved {len(projects)} architectural projects")
                            return True
                        else:
                            self.log_test("Public Portfolio API", False, 
                                        "No sample architectural projects found")
                            return False
                    else:
                        missing = [f for f in expected_fields if f not in project]
                        self.log_test("Public Portfolio API", False, 
                                    f"Project missing required fields: {missing}")
                        return False
                else:
                    self.log_test("Public Portfolio API", False, 
                                "Expected non-empty list of projects")
                    return False
            else:
                self.log_test("Public Portfolio API", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Public Portfolio API", False, f"Exception: {str(e)}")
            return False
    
    async def test_authentication_success(self):
        """Test 3: Authentication System - Successful login"""
        try:
            login_data = {"password": ADMIN_PASSWORD}
            response = await self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 200:
                data = await response.json()
                if "token" in data and "success" in data and data["success"]:
                    self.auth_token = data["token"]
                    self.log_test("Authentication Success", True, 
                                "Successfully authenticated with correct password")
                    return True
                else:
                    self.log_test("Authentication Success", False, 
                                f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Authentication Success", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Authentication Success", False, f"Exception: {str(e)}")
            return False
    
    async def test_authentication_failure(self):
        """Test 4: Authentication System - Failed login with wrong password"""
        try:
            login_data = {"password": "wrongpassword"}
            response = await self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 401:
                self.log_test("Authentication Failure", True, 
                            "Correctly rejected invalid password with 401")
                return True
            else:
                self.log_test("Authentication Failure", False, 
                            f"Expected 401, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Authentication Failure", False, f"Exception: {str(e)}")
            return False
    
    async def test_token_verification_valid(self):
        """Test 5: Token verification with valid token"""
        if not self.auth_token:
            self.log_test("Token Verification Valid", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.session.get(f"{BACKEND_URL}/auth/verify", headers=headers)
            
            if response.status == 200:
                data = await response.json()
                if "message" in data and "user" in data:
                    self.log_test("Token Verification Valid", True, 
                                "Valid token correctly verified")
                    return True
                else:
                    self.log_test("Token Verification Valid", False, 
                                f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Token Verification Valid", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Token Verification Valid", False, f"Exception: {str(e)}")
            return False
    
    async def test_token_verification_invalid(self):
        """Test 6: Token verification with invalid token"""
        try:
            headers = {"Authorization": "Bearer invalid_token_here"}
            response = await self.session.get(f"{BACKEND_URL}/auth/verify", headers=headers)
            
            if response.status == 401:
                self.log_test("Token Verification Invalid", True, 
                            "Invalid token correctly rejected with 401")
                return True
            else:
                self.log_test("Token Verification Invalid", False, 
                            f"Expected 401, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Token Verification Invalid", False, f"Exception: {str(e)}")
            return False
    
    async def test_create_project_authenticated(self):
        """Test 7: Create new architectural project (authenticated)"""
        if not self.auth_token:
            self.log_test("Create Project Authenticated", False, "No auth token available")
            return False
            
        try:
            project_data = {
                "title": "Test Architectural Project",
                "description": "A test project for the architectural portfolio API testing",
                "year": "2024",
                "client": "Test Client Architecture Firm",
                "location": "Test City, Test State",
                "images": [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                "plan_view": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "has_plan_view": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = await self.session.post(
                f"{BACKEND_URL}/admin/projects",
                json=project_data,
                headers=headers
            )
            
            if response.status == 200:
                created_project = await response.json()
                if "_id" in created_project and created_project["title"] == project_data["title"]:
                    self.created_project_id = created_project["_id"]
                    self.log_test("Create Project Authenticated", True, 
                                f"Successfully created project with ID: {self.created_project_id}")
                    return True
                else:
                    self.log_test("Create Project Authenticated", False, 
                                f"Invalid response format: {created_project}")
                    return False
            else:
                self.log_test("Create Project Authenticated", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Create Project Authenticated", False, f"Exception: {str(e)}")
            return False
    
    async def test_create_project_unauthenticated(self):
        """Test 8: Create project without authentication (should fail)"""
        try:
            project_data = {
                "title": "Unauthorized Test Project",
                "description": "This should fail",
                "year": "2024",
                "client": "Test Client",
                "location": "Test Location",
                "images": [],
                "plan_view": "",
                "has_plan_view": False
            }
            
            response = await self.session.post(
                f"{BACKEND_URL}/admin/projects",
                json=project_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 401:
                self.log_test("Create Project Unauthenticated", True, 
                            "Correctly rejected unauthenticated request with 401")
                return True
            else:
                self.log_test("Create Project Unauthenticated", False, 
                            f"Expected 401, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Create Project Unauthenticated", False, f"Exception: {str(e)}")
            return False
    
    async def test_update_project_authenticated(self):
        """Test 9: Update existing project (authenticated)"""
        if not self.auth_token or not self.created_project_id:
            self.log_test("Update Project Authenticated", False, 
                        "No auth token or project ID available")
            return False
            
        try:
            update_data = {
                "title": "Updated Test Architectural Project",
                "description": "Updated description for testing purposes",
                "year": "2024",
                "client": "Updated Test Client",
                "location": "Updated Test City, Updated State",
                "images": [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ],
                "plan_view": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "has_plan_view": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = await self.session.put(
                f"{BACKEND_URL}/admin/projects/{self.created_project_id}",
                json=update_data,
                headers=headers
            )
            
            if response.status == 200:
                updated_project = await response.json()
                if updated_project["title"] == update_data["title"]:
                    self.log_test("Update Project Authenticated", True, 
                                "Successfully updated project")
                    return True
                else:
                    self.log_test("Update Project Authenticated", False, 
                                f"Project not properly updated: {updated_project}")
                    return False
            else:
                self.log_test("Update Project Authenticated", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Update Project Authenticated", False, f"Exception: {str(e)}")
            return False
    
    async def test_update_project_unauthenticated(self):
        """Test 10: Update project without authentication (should fail)"""
        if not self.created_project_id:
            self.log_test("Update Project Unauthenticated", False, "No project ID available")
            return False
            
        try:
            update_data = {
                "title": "Unauthorized Update",
                "description": "This should fail"
            }
            
            response = await self.session.put(
                f"{BACKEND_URL}/admin/projects/{self.created_project_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 401:
                self.log_test("Update Project Unauthenticated", True, 
                            "Correctly rejected unauthenticated update with 401")
                return True
            else:
                self.log_test("Update Project Unauthenticated", False, 
                            f"Expected 401, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Update Project Unauthenticated", False, f"Exception: {str(e)}")
            return False
    
    async def test_data_validation_missing_fields(self):
        """Test 11: Data validation - missing required fields"""
        if not self.auth_token:
            self.log_test("Data Validation Missing Fields", False, "No auth token available")
            return False
            
        try:
            # Missing required 'title' field
            invalid_data = {
                "description": "Missing title field",
                "year": "2024"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = await self.session.post(
                f"{BACKEND_URL}/admin/projects",
                json=invalid_data,
                headers=headers
            )
            
            if response.status == 422:  # Validation error
                self.log_test("Data Validation Missing Fields", True, 
                            "Correctly rejected data with missing required fields")
                return True
            else:
                self.log_test("Data Validation Missing Fields", False, 
                            f"Expected 422, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Data Validation Missing Fields", False, f"Exception: {str(e)}")
            return False
    
    async def test_invalid_object_id(self):
        """Test 12: Invalid ObjectId format handling"""
        if not self.auth_token:
            self.log_test("Invalid ObjectId", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test with invalid ObjectId
            response = await self.session.put(
                f"{BACKEND_URL}/admin/projects/invalid_id_format",
                json={"title": "Test"},
                headers=headers
            )
            
            if response.status == 400:
                self.log_test("Invalid ObjectId", True, 
                            "Correctly rejected invalid ObjectId with 400")
                return True
            else:
                self.log_test("Invalid ObjectId", False, 
                            f"Expected 400, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Invalid ObjectId", False, f"Exception: {str(e)}")
            return False
    
    async def test_nonexistent_project_operations(self):
        """Test 13: Operations on non-existent project IDs"""
        if not self.auth_token:
            self.log_test("Nonexistent Project Operations", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but doesn't exist
            
            # Test update on non-existent project
            response = await self.session.put(
                f"{BACKEND_URL}/admin/projects/{fake_id}",
                json={"title": "Test"},
                headers=headers
            )
            
            if response.status == 404:
                self.log_test("Nonexistent Project Operations", True, 
                            "Correctly returned 404 for non-existent project")
                return True
            else:
                self.log_test("Nonexistent Project Operations", False, 
                            f"Expected 404, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Nonexistent Project Operations", False, f"Exception: {str(e)}")
            return False
    
    async def test_delete_project_authenticated(self):
        """Test 14: Delete project (authenticated)"""
        if not self.auth_token or not self.created_project_id:
            self.log_test("Delete Project Authenticated", False, 
                        "No auth token or project ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = await self.session.delete(
                f"{BACKEND_URL}/admin/projects/{self.created_project_id}",
                headers=headers
            )
            
            if response.status == 200:
                data = await response.json()
                if "message" in data and "deleted" in data["message"].lower():
                    self.log_test("Delete Project Authenticated", True, 
                                "Successfully deleted project")
                    return True
                else:
                    self.log_test("Delete Project Authenticated", False, 
                                f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Project Authenticated", False, 
                            f"HTTP {response.status}: {await response.text()}")
                return False
        except Exception as e:
            self.log_test("Delete Project Authenticated", False, f"Exception: {str(e)}")
            return False
    
    async def test_delete_project_unauthenticated(self):
        """Test 15: Delete project without authentication (should fail)"""
        try:
            fake_id = "507f1f77bcf86cd799439011"
            
            response = await self.session.delete(
                f"{BACKEND_URL}/admin/projects/{fake_id}"
            )
            
            if response.status == 401:
                self.log_test("Delete Project Unauthenticated", True, 
                            "Correctly rejected unauthenticated delete with 401")
                return True
            else:
                self.log_test("Delete Project Unauthenticated", False, 
                            f"Expected 401, got HTTP {response.status}")
                return False
        except Exception as e:
            self.log_test("Delete Project Unauthenticated", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print("🏗️  Starting Architectural Portfolio Backend API Tests")
        print(f"🔗 Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        # Run tests in sequence
        test_methods = [
            self.test_database_initialization,
            self.test_public_portfolio_api,
            self.test_authentication_success,
            self.test_authentication_failure,
            self.test_token_verification_valid,
            self.test_token_verification_invalid,
            self.test_create_project_authenticated,
            self.test_create_project_unauthenticated,
            self.test_update_project_authenticated,
            self.test_update_project_unauthenticated,
            self.test_data_validation_missing_fields,
            self.test_invalid_object_id,
            self.test_nonexistent_project_operations,
            self.test_delete_project_authenticated,
            self.test_delete_project_unauthenticated
        ]
        
        for test_method in test_methods:
            await test_method()
            await asyncio.sleep(0.1)  # Small delay between tests
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total


async def main():
    """Main test runner"""
    async with ArchitecturalPortfolioTester() as tester:
        success = await tester.run_all_tests()
        return success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)