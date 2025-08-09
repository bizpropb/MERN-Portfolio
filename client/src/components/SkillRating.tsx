import React, { useState, useEffect } from 'react';

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
  readonly?: boolean;
  isGlowing?: boolean;
}

const SkillRatingComponent: React.FC<SkillRatingProps> = ({ skill, onUpdate, readonly = false, isGlowing = false }) => {
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
    if (level <= 4) return 'text-blue-500';
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
    <div className={`w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border transition-all duration-300 ${
      isGlowing 
        ? 'shadow-[0_0_20px_rgba(168,85,247,0.8)] border-purple-400' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-xl'
    }`}>
      <div className="">
        {/* Skill Header */}
        <div className="flex items-start justify-between mb-4"> 
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{skill.name}</h3>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getRatingColor(currentRating)}`}>
              {getRatingLabel(currentRating)}
            </div>
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
                className={`text-2xl transition-all duration-200 ${
                  readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                } ${
                  star <= (hoverRating || currentRating)
                    ? getRatingColor(hoverRating || currentRating)
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
            {isUpdating && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
    
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                currentRating <= 1 ? 'bg-red-500' :
                currentRating <= 2 ? 'bg-orange-500' :
                currentRating <= 3 ? 'bg-yellow-500' :
                currentRating <= 4 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: getProgressWidth(hoverRating || currentRating) }}
            ></div>
          </div>
    
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
        </div>
    
        {/* Skill Description */}
        {skill.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{skill.description}</p>
        )}
    
        {/* Skill Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{skill.endorsements}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Endorsements</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(skill.lastUsed).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Last Used</div>
          </div>
        </div>
    
        {/* Interactive Actions */}
        {!readonly && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => handleRatingClick(Math.min(5, currentRating + 1))}
              disabled={currentRating >= 5 || isUpdating}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Level Up
            </button>
            <button
              onClick={() => handleRatingClick(Math.max(1, currentRating - 1))}
              disabled={currentRating <= 1 || isUpdating}
              className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Level Down
            </button>
          </div>
        )}

        {/* Certifications */}
        {skill.certifications && skill.certifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {skill.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  🏆 {cert}
                </span>
              ))}
            </div>
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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'experience'>('level');
  const [glowingSkillId, setGlowingSkillId] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = userId 
        ? `http://localhost:5000/api/skills/user/${userId}`
        : 'http://localhost:5000/api/skills';
      
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

  const updateSkillRating = async (skillId: string, newLevel: number) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
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
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="mx-auto mt-6 flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-500"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {category === 'all' ? 'Filter by Category' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'level' | 'experience')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <option value="level" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Sort by</option>
            <option value="name" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Skill Name</option>
            <option value="experience" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Years of Experience</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="w-[90%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center">
        {filteredAndSortedSkills.map((skill) => (
          <SkillRatingComponent
            key={skill._id}
            skill={skill}
            onUpdate={updateSkillRating}
            readonly={readonly}
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