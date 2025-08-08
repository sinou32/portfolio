import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Download, ChevronDown } from 'lucide-react';
import { fetchProjects } from '../services/api';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(0);
  const projectRefs = useRef([]);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Add scroll snap behavior
    const handleScroll = (e) => {
      if (isScrolling.current) return;

      e.preventDefault();
      isScrolling.current = true;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextProject = Math.max(0, Math.min(projects.length - 1, currentProject + direction));

      if (nextProject !== currentProject) {
        setCurrentProject(nextProject);
        projectRefs.current[nextProject]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    };

    const container = containerRef.current;
    if (container && projects.length > 0) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      return () => container.removeEventListener('wheel', handleScroll);
    }
  }, [currentProject, projects.length]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      // Dynamically import html2pdf
      const html2pdf = await import('html2pdf.js');
      
      const element = document.getElementById('portfolio-content');
      const opt = {
        margin: 0.5,
        filename: 'architectural-portfolio.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf.default().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF export functionality temporarily unavailable. Please try again later.');
    }
  };

  const scrollToProject = (index) => {
    setCurrentProject(index);
    projectRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-slate-600">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" ref={containerRef}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Architectural Portfolio
          </h1>
          <div className="flex items-center gap-4">
            {/* Project navigation dots */}
            <div className="flex gap-2">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToProject(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentProject 
                      ? 'bg-slate-800 w-8' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <Button 
              onClick={exportToPDF}
              variant="outline" 
              size="sm"
              className="text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Scroll indicator */}
      {currentProject < projects.length - 1 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6">
          {projects.map((project, index) => (
            <div 
              key={project.id || project._id}
              ref={el => projectRefs.current[index] = el}
              className="min-h-screen flex flex-col justify-center py-16"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Project Header */}
              <div className="mb-8">
                <h2 className="text-4xl font-light text-slate-900 mb-6">
                  {project.title}
                </h2>
                <div className="flex flex-wrap gap-8 text-sm text-slate-600 mb-8">
                  {project.year && <span><strong>Year:</strong> {project.year}</span>}
                  {project.client && <span><strong>Client:</strong> {project.client}</span>}
                  {project.location && <span><strong>Location:</strong> {project.location}</span>}
                </div>
                {project.description && (
                  <p className="text-slate-700 leading-relaxed text-lg max-w-4xl mb-12">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Project Images */}
              <div className="space-y-8 mb-16">
                {/* Main Images */}
                {project.images && project.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="w-full">
                    <img 
                      src={image} 
                      alt={`${project.title} - Image ${imgIndex + 1}`}
                      className="w-full h-auto object-cover rounded-sm shadow-sm"
                      style={{ maxHeight: '70vh', objectFit: 'cover' }}
                    />
                  </div>
                ))}

                {/* Plan View */}
                {project.has_plan_view && project.plan_view && (
                  <div className="w-full">
                    <h3 className="text-lg font-medium text-slate-800 mb-4">Plan View</h3>
                    <img 
                      src={project.plan_view} 
                      alt={`${project.title} - Plan View`}
                      className="w-full h-auto object-cover rounded-sm shadow-sm bg-white p-4"
                      style={{ maxHeight: '60vh', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-300">
            © 2024 Architectural Portfolio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;