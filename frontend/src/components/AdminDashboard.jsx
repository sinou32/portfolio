import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Plus, Trash2, Upload, LogOut, Home } from 'lucide-react';
import { mockProjects, setAuthenticated } from '../mock';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = ({ onLogout, onGoHome }) => {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: '',
    client: '',
    location: '',
    images: [''],
    planView: '',
    hasPlanView: false
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      year: '',
      client: '',
      location: '',
      images: [''],
      planView: '',
      hasPlanView: false
    });
    setEditingProject(null);
    setShowAddForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      id: editingProject ? editingProject.id : Date.now()
    };

    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? projectData : p));
      toast({
        title: "Project updated",
        description: "Project has been successfully updated.",
      });
    } else {
      setProjects(prev => [...prev, projectData]);
      toast({
        title: "Project added",
        description: "New project has been successfully added.",
      });
    }

    resetForm();
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      year: project.year,
      client: project.client,
      location: project.location,
      images: project.images.length > 0 ? project.images : [''],
      planView: project.planView || '',
      hasPlanView: project.hasPlanView
    });
    setEditingProject(project);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Project deleted",
      description: "Project has been successfully deleted.",
      variant: "destructive"
    });
  };

  const handleLogout = () => {
    setAuthenticated(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-slate-800">
              Portfolio Admin
            </h1>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGoHome}
                className="text-slate-600 border-slate-300 hover:bg-slate-50"
              >
                <Home className="w-4 h-4 mr-2" />
                View Portfolio
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Project Button */}
        {!showAddForm && (
          <div className="mb-8">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8 border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-slate-700">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-slate-700">Year</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="border-slate-300"
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="client" className="text-slate-700">Client</Label>
                    <Input
                      id="client"
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-slate-700">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="border-slate-300 min-h-[120px]"
                    placeholder="Project description..."
                  />
                </div>

                <div>
                  <Label className="text-slate-700 mb-4 block">Project Images</Label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="Image URL"
                        className="border-slate-300"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageField(index)}
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    className="text-slate-600 border-slate-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="hasPlanView"
                      checked={formData.hasPlanView}
                      onCheckedChange={(checked) => handleInputChange('hasPlanView', checked)}
                    />
                    <Label htmlFor="hasPlanView" className="text-slate-700">
                      Include Plan View
                    </Label>
                  </div>
                  
                  {formData.hasPlanView && (
                    <div>
                      <Label htmlFor="planView" className="text-slate-700">Plan View URL</Label>
                      <Input
                        id="planView"
                        value={formData.planView}
                        onChange={(e) => handleInputChange('planView', e.target.value)}
                        className="border-slate-300"
                        placeholder="Plan view image URL"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white">
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <div className="grid gap-6">
          <h2 className="text-xl font-medium text-slate-800">
            Projects ({projects.length})
          </h2>
          
          {projects.map((project) => (
            <Card key={project.id} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {project.year && <span>Year: {project.year}</span>}
                      {project.client && <span>Client: {project.client}</span>}
                      {project.location && <span>Location: {project.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="text-sm text-slate-500">
                  {project.images.length} image{project.images.length !== 1 ? 's' : ''}
                  {project.hasPlanView && ' • Plan view included'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;