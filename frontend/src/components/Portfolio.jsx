import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Download, ChevronDown } from 'lucide-react';
import { fetchProjects, fetchPortfolioBio } from '../services/api';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [portfolioBio, setPortfolioBio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(0);
  const projectRefs = useRef([]);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    loadPortfolioData();
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

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [projectsData, bioData] = await Promise.all([
        fetchProjects(),
        fetchPortfolioBio()
      ]);
      setProjects(projectsData);
      setPortfolioBio(bioData);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      // Dynamically import html2pdf
      const html2pdf = await import('html2pdf.js');
      
      // Create a custom PDF layout
      const pdfContent = document.createElement('div');
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.color = '#333';
      pdfContent.style.lineHeight = '1.6';
      
      // Add portfolio title and bio
      const title = document.createElement('div');
      title.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; color: #2d3748;">Architectural Portfolio</h1>
          ${portfolioBio?.bio_enabled && portfolioBio?.bio_text ? 
            `<p style="font-size: 14px; color: #718096; max-width: 600px; margin: 0 auto;">${portfolioBio.bio_text}</p>` 
            : ''}
        </div>
      `;
      pdfContent.appendChild(title);

      // Add each project on separate pages
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const projectDiv = document.createElement('div');
        projectDiv.style.pageBreakBefore = i > 0 ? 'always' : 'auto';
        projectDiv.style.padding = '20px 0';
        
        // Project header
        const projectHeader = `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 24px; color: #2d3748; margin-bottom: 10px;">${project.title}</h2>
            <div style="margin-bottom: 15px; font-size: 12px; color: #718096;">
              ${project.year ? `<span>Year: ${project.year}</span>` : ''}
              ${project.year && project.client ? ' • ' : ''}
              ${project.client ? `<span>Client: ${project.client}</span>` : ''}
              ${(project.year || project.client) && project.location ? ' • ' : ''}
              ${project.location ? `<span>Location: ${project.location}</span>` : ''}
            </div>
            ${project.description ? `<p style="margin-bottom: 20px; color: #4a5568;">${project.description}</p>` : ''}
          </div>
        `;
        projectDiv.innerHTML = projectHeader;

        // Add images
        if (project.images && project.images.length > 0) {
          const imagesDiv = document.createElement('div');
          
          for (let j = 0; j < Math.min(project.images.length, 2); j++) {
            const img = document.createElement('img');
            img.src = project.images[j];
            img.style.width = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'cover';
            img.style.marginBottom = '15px';
            img.style.border = '1px solid #e2e8f0';
            
            // Load image synchronously for PDF
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            
            imagesDiv.appendChild(img);
          }

          // Add plan view if available
          if (project.has_plan_view && project.plan_view) {
            const planTitle = document.createElement('h3');
            planTitle.textContent = 'Plan View';
            planTitle.style.fontSize = '16px';
            planTitle.style.marginTop = '20px';
            planTitle.style.marginBottom = '10px';
            planTitle.style.color = '#2d3748';
            imagesDiv.appendChild(planTitle);

            const planImg = document.createElement('img');
            planImg.src = project.plan_view;
            planImg.style.width = '100%';
            planImg.style.maxHeight = '250px';
            planImg.style.objectFit = 'contain';
            planImg.style.backgroundColor = '#f7fafc';
            planImg.style.border = '1px solid #e2e8f0';
            
            await new Promise((resolve) => {
              planImg.onload = resolve;
              planImg.onerror = resolve;
            });
            
            imagesDiv.appendChild(planImg);
          }

          projectDiv.appendChild(imagesDiv);
        }

        pdfContent.appendChild(projectDiv);
      }

      // PDF options
      const opt = {
        margin: [0.75, 0.5, 0.75, 0.5],
        filename: 'architectural-portfolio.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf.default().set(opt).from(pdfContent).save();
      
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
      <main id="portfolio-content" className="pt-20">
        {/* Portfolio Bio Section */}
        {portfolioBio?.bio_enabled && portfolioBio?.bio_text && (
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <div className="prose prose-slate max-w-none">
              <p className="text-xl text-slate-700 leading-relaxed">
                {portfolioBio.bio_text}
              </p>
            </div>
            <div className="mt-12 border-b border-slate-200"></div>
          </div>
        )}

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
                      crossOrigin="anonymous"
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
                      crossOrigin="anonymous"
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