import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFreelancers } from '../api/freelancers';
import '../styles/pages/Freelancers.css';

const Freelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    skills: '',
    rating: 0,
  });

  useEffect(() => {
    // Add scroll animation observer
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.scroll-animation');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });
      
      elements.forEach(element => {
        observer.observe(element);
      });
    };

    // Fetch freelancers data
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        const data = await getFreelancers(filters);
        setFreelancers(data);
      } catch (error) {
        console.log('Using dummy data due to API error:', error);
        // Simulated data - will be used until backend is ready
        const dummyFreelancers = [
          {
            id: 1,
            name: 'John Doe',
            title: 'Full Stack Developer',
            category: 'Development',
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            hourlyRate: 45,
            rating: 4.9,
            reviewCount: 87,
            profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
            description: 'Experienced full stack developer with 5+ years in web application development.'
          },
          {
            id: 2,
            name: 'Sarah Smith',
            title: 'UI/UX Designer',
            category: 'Design',
            skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'User Research'],
            hourlyRate: 55,
            rating: 4.8,
            reviewCount: 64,
            profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
            description: 'Passionate UI/UX designer focused on creating intuitive and beautiful user experiences.'
          },
          {
            id: 3,
            name: 'David Chen',
            title: 'Mobile App Developer',
            category: 'Development',
            skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
            hourlyRate: 50,
            rating: 4.7,
            reviewCount: 49,
            profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg',
            description: 'Mobile app specialist with expertise in cross-platform development technologies.'
          },
          {
            id: 4,
            name: 'Emma Wilson',
            title: 'Content Writer',
            category: 'Writing',
            skills: ['Blog Writing', 'SEO', 'Copywriting', 'Technical Writing'],
            hourlyRate: 35,
            rating: 4.6,
            reviewCount: 41,
            profilePicture: 'https://randomuser.me/api/portraits/women/17.jpg',
            description: 'Experienced content writer with a knack for engaging, SEO-optimized content.'
          },
          {
            id: 5,
            name: 'Michael Brown',
            title: 'Digital Marketing Specialist',
            category: 'Marketing',
            skills: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing'],
            hourlyRate: 40,
            rating: 4.8,
            reviewCount: 56,
            profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
            description: 'Digital marketing expert specializing in growth strategies and online presence optimization.'
          },
          {
            id: 6,
            name: 'Lisa Johnson',
            title: 'Graphic Designer',
            category: 'Design',
            skills: ['Photoshop', 'Illustrator', 'Brand Identity', 'Typography'],
            hourlyRate: 45,
            rating: 4.9,
            reviewCount: 72,
            profilePicture: 'https://randomuser.me/api/portraits/women/28.jpg',
            description: 'Creative graphic designer with an eye for detail and innovative design solutions.'
          },
          {
            id: 7,
            name: 'Michael Turay',
            title: 'Mobile Technician',
            category: 'Technology',
            skills: ['Phone Repair', 'Tablet Repair', 'Diagnostics', 'Hardware Troubleshooting'],
            hourlyRate: 35,
            rating: 4.7,
            reviewCount: 43,
            profilePicture: 'https://randomuser.me/api/portraits/men/41.jpg',
            description: 'Experienced mobile technician specializing in smartphone and tablet repairs with quick turnaround times.'
          },
          {
            id: 8,
            name: 'Ryan J. Stewart',
            title: 'Developer',
            category: 'Development',
            skills: ['JavaScript', 'Python', 'AWS', 'Machine Learning', 'API Development'],
            hourlyRate: 60,
            rating: 4.9,
            reviewCount: 51,
            profilePicture: 'https://randomuser.me/api/portraits/men/53.jpg',
            description: 'Full-stack developer with expertise in cloud architecture and machine learning applications.'
          }
        ];
        
        setFreelancers(dummyFreelancers);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
    
    // Initialize scroll animations after loading
    setTimeout(() => {
      animateOnScroll();
    }, 500);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    // Filter by category
    if (filters.category && freelancer.category !== filters.category) {
      return false;
    }
    
    // Filter by minimum rating
    if (filters.rating > 0 && freelancer.rating < filters.rating) {
      return false;
    }
    
    // Filter by skills
    if (filters.skills) {
      const skillsArray = filters.skills.toLowerCase().split(',').map(s => s.trim());
      const hasSkill = skillsArray.some(skill => 
        freelancer.skills.some(s => s.toLowerCase().includes(skill))
      );
      if (!hasSkill) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="freelancers-page">
      <div className="hero-section scroll-animation">
        <div className="container">
          <h1>Find Expert Freelancers</h1>
          <p>Connect with skilled professionals for your project needs</p>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="What skills are you looking for?" 
              className="search-input"
            />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
      </div>

      <div className="container main-content">
        <div className="filters-section scroll-animation">
          <h2>Filters</h2>
          <div className="filter-group">
            <label>Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Technology">Technology</option>
              <option value="Virtual Assistant">Virtual Assistant</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Skills</label>
            <input 
              type="text" 
              name="skills" 
              placeholder="e.g., React, Design, Writing" 
              value={filters.skills} 
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Minimum Rating</label>
            <select 
              name="rating" 
              value={filters.rating} 
              onChange={handleFilterChange}
            >
              <option value="0">Any Rating</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </div>
        </div>

        <div className="freelancers-list">
          {loading ? (
            <div className="loading">Loading freelancers...</div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="no-results">No freelancers match your criteria</div>
          ) : (
            filteredFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="freelancer-card scroll-animation">
                <div className="freelancer-icon">
                  <img src={freelancer.profilePicture} alt={freelancer.name} />
                </div>
                <h3>{freelancer.name}</h3>
                <p className="freelancer-title">{freelancer.title}</p>
                <div className="freelancer-rating">
                  <span className="stars">
                    {'★'.repeat(Math.floor(freelancer.rating))}
                    {freelancer.rating % 1 >= 0.5 ? '★' : ''}
                    {'☆'.repeat(5 - Math.ceil(freelancer.rating))}
                  </span>
                  <span className="rating-text">
                    {freelancer.rating} ({freelancer.reviewCount})
                  </span>
                </div>
                <div className="freelancer-price">
                  <span className="price-value">${freelancer.hourlyRate}</span>/hr
                </div>
                <p className="freelancer-description">{freelancer.description}</p>
                <div className="freelancer-skills">
                  {freelancer.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <span className="skill-tag more-skills">+{freelancer.skills.length - 4}</span>
                  )}
                </div>
                <div className="freelancer-actions">
                  <Link to={`/freelancers/${freelancer.id}`} className="btn btn-primary">
                    View Profile
                  </Link>
                  <button className="btn btn-outline">Contact</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Freelancers;
