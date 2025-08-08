// Mock data for architectural portfolio

export const mockProjects = [
  {
    id: 1,
    title: "Modern Residential Complex",
    description: "A contemporary residential development featuring sustainable design principles and innovative use of natural light. The project incorporates locally sourced materials and energy-efficient systems throughout.",
    year: "2023",
    client: "Green Living Development",
    location: "Seattle, Washington",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80"
    ],
    planView: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80",
    hasPlanView: true
  },
  {
    id: 2,
    title: "Cultural Arts Center",
    description: "A dynamic cultural hub designed to foster community engagement through art and performance. The building features flexible spaces that can adapt to various cultural events and exhibitions.",
    year: "2022",
    client: "City Arts Foundation",
    location: "Portland, Oregon",
    images: [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2121&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    ],
    planView: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
    hasPlanView: true
  },
  {
    id: 3,
    title: "Sustainable Office Tower",
    description: "A 20-story office building that achieves LEED Platinum certification through innovative sustainable design strategies including rainwater harvesting, solar panels, and green roof systems.",
    year: "2023",
    client: "EcoTech Solutions",
    location: "San Francisco, California",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    ],
    planView: null,
    hasPlanView: false
  },
  {
    id: 4,
    title: "Waterfront Pavilion",
    description: "An elegant pavilion structure designed for waterfront events and ceremonies. The design emphasizes transparency and connection with the natural waterfront environment.",
    year: "2021",
    client: "",
    location: "Vancouver, Canada",
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    ],
    planView: null,
    hasPlanView: false
  }
];

export const mockAuth = {
  password: "architecture2024",
  isAuthenticated: false
};

export const setAuthenticated = (status) => {
  mockAuth.isAuthenticated = status;
  if (typeof window !== 'undefined') {
    localStorage.setItem('archPortfolioAuth', JSON.stringify(status));
  }
};

export const checkAuthentication = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('archPortfolioAuth');
    if (stored) {
      mockAuth.isAuthenticated = JSON.parse(stored);
    }
  }
  return mockAuth.isAuthenticated;
};