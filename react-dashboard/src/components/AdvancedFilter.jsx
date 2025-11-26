import React, { useState } from 'react';

function AdvancedFilter({ onApplyFilters, initialFilters = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(initialFilters.tech || []);

  const technologies = [
    { id: '2g', label: '2G', category: 'wireless' },
    { id: '3g', label: '3G', category: 'wireless' },
    { id: 'lte', label: '4G/LTE', category: 'wireless' },
    { id: '5g', label: '5G', category: 'wireless' },
    { id: 'wireline', label: 'GPON/LSA/MSAN', category: 'wireline' },
    { id: 'other', label: 'Other', category: 'other' }
  ];

  const handleTechToggle = (techId) => {
    setSelectedTech(prev => 
      prev.includes(techId) 
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  const handleApply = () => {
    onApplyFilters({ tech: selectedTech });
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedTech([]);
    onApplyFilters({ tech: [] });
  };

  const getActiveFilterCount = () => {
    return selectedTech.length;
  };

  return (
    <div className="advanced-filter">
      <button 
        className="filter-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-icons">filter_list</span>
        Filter
        {getActiveFilterCount() > 0 && (
          <span className="filter-badge">{getActiveFilterCount()}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="filter-backdrop" onClick={() => setIsOpen(false)} />
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Advanced Filters</h3>
              <button 
                className="filter-close-button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="filter-body">
              <div className="filter-section">
                <h4>Technology</h4>
                <div className="filter-group">
                  <div className="filter-subgroup">
                    <label className="filter-subgroup-label">Wireless</label>
                    {technologies
                      .filter(t => t.category === 'wireless')
                      .map(tech => (
                        <label key={tech.id} className="filter-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedTech.includes(tech.id)}
                            onChange={() => handleTechToggle(tech.id)}
                          />
                          <span>{tech.label}</span>
                        </label>
                      ))}
                  </div>

                  <div className="filter-subgroup">
                    <label className="filter-subgroup-label">Wireline</label>
                    {technologies
                      .filter(t => t.category === 'wireline')
                      .map(tech => (
                        <label key={tech.id} className="filter-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedTech.includes(tech.id)}
                            onChange={() => handleTechToggle(tech.id)}
                          />
                          <span>{tech.label}</span>
                        </label>
                      ))}
                  </div>

                  <div className="filter-subgroup">
                    <label className="filter-subgroup-label">Other</label>
                    {technologies
                      .filter(t => t.category === 'other')
                      .map(tech => (
                        <label key={tech.id} className="filter-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedTech.includes(tech.id)}
                            onChange={() => handleTechToggle(tech.id)}
                          />
                          <span>{tech.label}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-footer">
              <button 
                className="filter-clear-button"
                onClick={handleClear}
              >
                Clear All
              </button>
              <button 
                className="filter-apply-button"
                onClick={handleApply}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdvancedFilter;
