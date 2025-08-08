import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { mockProjects } from '../mock';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Load mock projects
    setProjects(mockProjects);
  }, []);

  const exportToPDF = () => {
    const element = document.getElementById('portfolio-content');
    const opt = {
      margin: 0.5,
      filename: 'architectural-portfolio.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Architectural Portfolio
          </h1>
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
      </header>

      {/* Main Content */}
      <main id="portfolio-content" className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`mb-24 ${index !== projects.length - 1 ? 'border-b border-slate-200 pb-24' : ''}`}
            >
              {/* Project Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-light text-slate-900 mb-4">
                  {project.title}
                </h2>
                <div className="flex flex-wrap gap-6 text-sm text-slate-600 mb-6">
                  {project.year && <span><strong>Year:</strong> {project.year}</span>}
                  {project.client && <span><strong>Client:</strong> {project.client}</span>}
                  {project.location && <span><strong>Location:</strong> {project.location}</span>}
                </div>
                <p className="text-slate-700 leading-relaxed text-lg max-w-4xl">
                  {project.description}
                </p>
              </div>

              {/* Project Images */}
              <div className="space-y-8">
                {/* Main Images */}
                {project.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="w-full">
                    <img 
                      src={image} 
                      alt={`${project.title} - Image ${imgIndex + 1}`}
                      className="w-full h-auto object-cover rounded-sm shadow-sm"
                      style={{ maxHeight: '600px', objectFit: 'cover' }}
                    />
                  </div>
                ))}

                {/* Plan View */}
                {project.hasPlanView && project.planView && (
                  <div className="w-full">
                    <h3 className="text-lg font-medium text-slate-800 mb-4">Plan View</h3>
                    <img 
                      src={project.planView} 
                      alt={`${project.title} - Plan View`}
                      className="w-full h-auto object-cover rounded-sm shadow-sm bg-white"
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
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