import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiencyLevel: number;
  yearsOfExperience: number;
  description: string;
  endorsements: number;
  certifications: string[];
  lastUsed: string;
}

interface SkillRatingProps {
  skill: Skill;
  onUpdate: (skillId: string, newLevel: number) => void;
  onDelete?: (skillId: string) => void;
  readonly?: boolean;
  isGlowing?: boolean;
}

const SkillRatingComponent: React.FC<SkillRatingProps> = ({ skill, onUpdate, onDelete, readonly = false, isGlowing = false }) => {
  const [currentRating, setCurrentRating] = useState(skill.proficiencyLevel);
  const [hoverRating, setHoverRating] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRatingClick = async (rating: number) => {
    if (readonly || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(skill._id, rating);
      setCurrentRating(rating);
    } catch (error) {
      console.error('Failed to update skill rating:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRatingColor = (level: number) => {
    if (level <= 1) return 'text-red-500';
    if (level <= 2) return 'text-orange-500';
    if (level <= 3) return 'text-yellow-500';
    if (level <= 4) return 'text-lime-500';
    return 'text-green-500';
  };

  const getRatingLabel = (level: number) => {
    if (level <= 1) return 'Beginner';
    if (level <= 2) return 'Novice';
    if (level <= 3) return 'Intermediate';
    if (level <= 4) return 'Advanced';
    return 'Expert';
  };

  const getProgressWidth = (level: number) => `${(level / 5) * 100}%`;

  return (
    <div className={`w-full lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary p-6 rounded-lg shadow-lg border transition-all duration-300 mb-6 ${
      isGlowing 
        ? 'shadow-[0_0_20px_rgba(168,85,247,0.8)] border-1 !border-primary transition-all duration-500' 
        : 'border hover:shadow-xl transition-all duration-500'
    }`}>
      <div className="">
        {/* Skill Header */}
        <div className="flex items-start justify-between mb-4"> 
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{skill.name}</h3>
            <span className="inline-block px-2 py-1 text-xs font-medium lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-full">
              {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className={`text-sm font-medium ${getRatingColor(currentRating)}`}>
                {getRatingLabel(currentRating)}
              </div>
            </div>
            {!readonly && onDelete && (
              <button
                onClick={() => onDelete(skill._id)}
                className="w-6 h-6 flex items-center justify-center lightmode-text-secondary dark:darkmode-text-secondary hover:text-danger rounded"
                title="Remove skill"
              >
                ×
              </button>
            )}
          </div>
        </div>
    
        {/* Interactive Rating Stars */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => !readonly && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={readonly || isUpdating}
                className={`text-2xl transition-all duration-300 ${
                  readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                } ${
                  star <= (hoverRating || currentRating)
                    ? getRatingColor(hoverRating || currentRating)
                    : 'lightmode-text-secondary dark:darkmode-text-secondary opacity-50'
                }`}
              >
                ★
              </button>
            ))}
            {isUpdating && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4"></div>
              </div>
            )}
          </div>
    
          {/* Progress Bar */}
          <div className="w-full lightmode-highlight lightmode-text-primary dark:darkmode-highlight dark:darkmode-text-primary rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                currentRating <= 1 ? 'bg-red-500' :
                currentRating <= 2 ? 'bg-orange-500' :
                currentRating <= 3 ? 'bg-yellow-500' :
                currentRating <= 4 ? 'bg-lime-500' : 'bg-green-500'
              }`}
              style={{ width: getProgressWidth(hoverRating || currentRating) }}
            ></div>
          </div>
    
          <div className="flex justify-between text-xs lightmode-text-secondary dark:darkmode-text-secondary">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
        </div>
    
        {/* Skill Description */}
        {skill.description && (
          <p className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-4">{skill.description}</p>
        )}
    
    
        {/* Interactive Actions */}
        {!readonly && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => handleRatingClick(Math.min(5, currentRating + 1))}
              disabled={currentRating >= 5 || isUpdating}
              className="flex-1 px-3 py-2 text-sm btn-primary-filled">
              Level Up
            </button>
            <button
              onClick={() => handleRatingClick(Math.max(1, currentRating - 1))}
              disabled={currentRating <= 1 || isUpdating}
              className="flex-1 px-3 py-2 text-sm btn-muted-filled">
              Level Down
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

interface SkillsManagerProps {
  userId?: string;
  readonly?: boolean;
}

const SkillsManager: React.FC<SkillsManagerProps> = ({ userId, readonly = false }) => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{name: string, category: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'experience'>('level');
  const [glowingSkillId, setGlowingSkillId] = useState<string | null>(null);
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState<string>('Add a skill');

  // Check if the current user is viewing their own skills
  const isOwnSkills = currentUser?.username === username;
  // Use the isOwnSkills check to determine readonly state
  const isReadonly = readonly || !isOwnSkills;

  useEffect(() => {
    fetchSkills();
    if (isOwnSkills) {
      fetchAvailableSkills();
    }
  }, [username]);

  const fetchSkills = async () => {
    try {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const endpoint = `http://localhost:5001/api/user/${username}/skills`;
      
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = await response.json();
      
      if (data.success) {
        setSkills(data.data.skills);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch skills');
      }
    } catch (err) {
      setError('Network error fetching skills');
      console.error('Skills fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/skills/available', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('Available skills response:', data);
      
      if (data.success) {
        setAvailableSkills(data.data.skills);
        console.log('Available skills set:', data.data.skills);
      } else {
        console.error('Failed to fetch available skills:', data.message);
      }
    } catch (err) {
      console.error('Available skills fetch error:', err);
    }
  };

  const addSkill = async (skillName: string, skillCategory: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: skillName,
          category: skillCategory,
          proficiencyLevel: 3, // Default to intermediate
          yearsOfExperience: 1, // Default to 1 year
          description: `${skillName} skill`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add the new skill to the list
        setSkills(prevSkills => [...prevSkills, data.data.skill]);
        // Reset dropdown
        setSelectedSkillToAdd('Add a skill');
        // Trigger glow effect
        setGlowingSkillId(data.data.skill._id);
        setTimeout(() => setGlowingSkillId(null), 2000);
      } else {
        alert('Error adding skill: ' + data.message);
      }
    } catch (error) {
      alert('Network error adding skill');
      console.error('Add skill error:', error);
    }
  };

  const updateSkillRating = async (skillId: string, newLevel: number) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:5001/api/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ proficiencyLevel: newLevel })
    });

    const data = await response.json();
    
    if (data.success) {
      setSkills(prevSkills => 
        prevSkills.map(skill => 
          skill._id === skillId 
            ? { ...skill, proficiencyLevel: newLevel }
            : skill
        )
      );
      
      // Trigger glow effect
      setGlowingSkillId(skillId);
      setTimeout(() => setGlowingSkillId(null), 2000);
    } else {
      throw new Error(data.message || 'Failed to update skill');
    }
  };

  const deleteSkill = async (skillId: string) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:5001/api/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      setSkills(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
    } else {
      throw new Error(data.message || 'Failed to delete skill');
    }
  };

  const filteredAndSortedSkills = skills
    .filter(skill => filter === 'all' || skill.category === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.proficiencyLevel - a.proficiencyLevel;
        case 'experience':
          return b.yearsOfExperience - a.yearsOfExperience;
        default:
          return 0;
      }
    });

  const categories = ['all', ...Array.from(new Set(skills.map(skill => skill.category)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchSkills}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      {/* Filters and Sorting */}
      <div className="mx-auto mt-6 flex flex-col sm:flex-row gap-4 mb-6 max-w-3xl">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="skillmanager-dropdown w-full px-3 py-2 border text-sm lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary "
          >
            {categories.map(category => (
              <option key={category} value={category} className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">
                {category === 'all' ? 'Filter by Category' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'level' | 'experience')}
            className="skillmanager-dropdown w-full px-3 py-2 border text-sm lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary "
          >
            <option value="level" className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">Sort by</option>
            <option value="name" className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">Skill Name</option>
            <option value="experience" className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary">Years of Experience</option>
          </select>
        </div>
        
        {isOwnSkills && (
          <div className="flex-1">
            <select
              value={selectedSkillToAdd}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSkillToAdd(value);
                if (value !== 'Add a skill') {
                  const skillToAdd = availableSkills.find(skill => skill.name === value);
                  if (skillToAdd) {
                    addSkill(skillToAdd.name, skillToAdd.category);
                  }
                }
              }}
              className="skillmanager-dropdown w-full px-3 py-2 border text-sm  lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary "
            >
              <option value="Add a skill" className="lightmode dark:darkmode">Add a skill</option>
              {availableSkills
                .filter(availableSkill => !skills.some(userSkill => userSkill.name === availableSkill.name))
                .map(skill => (
                  <option key={skill.name} value={skill.name} className="lightmode dark:darkmode">
                    {skill.name}
                  </option>
                ))
              }
            </select>
          </div>
        )}
      </div>

      {/* Skills Grid */}
      <div className="w-[90%] mx-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center">
        {filteredAndSortedSkills.map((skill) => (
          <SkillRatingComponent
            key={skill._id}
            skill={skill}
            onUpdate={updateSkillRating}
            onDelete={deleteSkill}
            readonly={isReadonly}
            isGlowing={glowingSkillId === skill._id}
          />
        ))}
        </div>
      </div>

      {filteredAndSortedSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No skills found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export { SkillRatingComponent, SkillsManager };
export default SkillsManager;