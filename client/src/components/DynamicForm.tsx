import React, { useState, useEffect, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'url' | 'textarea' | 'select' | 'multiselect';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation: ValidationRule;
  helpText?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormData {
  [key: string]: string | string[];
}

interface DynamicFormProps {
  fields: FormField[];
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
  className?: string;
  enableRealTimeValidation?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  initialData = {},
  onSubmit,
  submitLabel = 'Submit',
  className = '',
  enableRealTimeValidation = true
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validation functions
  const validateField = useCallback((field: FormField, value: string | string[]): string | null => {
    const { validation } = field;
    const stringValue = Array.isArray(value) ? value.join(',') : value;

    // Required validation
    if (validation.required && (!stringValue || stringValue.trim() === '')) {
      return validation.message || `${field.label} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!stringValue || stringValue.trim() === '') {
      return null;
    }

    // Min length validation
    if (validation.minLength && stringValue.length < validation.minLength) {
      return validation.message || `${field.label} must be at least ${validation.minLength} characters`;
    }

    // Max length validation
    if (validation.maxLength && stringValue.length > validation.maxLength) {
      return validation.message || `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(stringValue)) {
      return validation.message || `${field.label} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(stringValue);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, []);

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    
    fields.forEach(field => {
      const value = formData[field.name] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    return newErrors;
  }, [fields, formData, validateField]);

  // Real-time validation effect
  useEffect(() => {
    if (enableRealTimeValidation) {
      const newErrors = validateForm();
      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }
  }, [formData, validateForm, enableRealTimeValidation]);

  const handleInputChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (enableRealTimeValidation) {
      const field = fields.find(f => f.name === name);
      if (field) {
        const value = formData[name] || '';
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [name]: error || ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
      showError 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:ring-blue-500'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            className={`${baseClasses} min-h-[100px] resize-vertical`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            className={baseClasses}
          >
            <option value="">Choose an option...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleInputChange(field.name, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map((field) => {
        const error = errors[field.name];
        const isTouched = touched[field.name];
        const showError = isTouched && error;

        return (
          <div key={field.name} className="space-y-1">
            <label 
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.validation.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {renderField(field)}

            {/* Help text */}
            {field.helpText && !showError && (
              <p className="text-sm text-gray-500">{field.helpText}</p>
            )}

            {/* Error message */}
            {showError && (
              <p className="text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {error}
              </p>
            )}

            {/* Success indicator for valid fields */}
            {isTouched && !error && formData[field.name] && (
              <p className="text-sm text-green-600 flex items-center">
                <span className="mr-1">✅</span>
                Looks good!
              </p>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || (!enableRealTimeValidation ? false : !isValid)}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>

      {/* Form validation summary */}
      {enableRealTimeValidation && (
        <div className="text-sm text-gray-600">
          {isValid ? (
            <p className="text-green-600 flex items-center">
              <span className="mr-1">✅</span>
              Form is valid and ready to submit
            </p>
          ) : (
            <p className="text-orange-600 flex items-center">
              <span className="mr-1">⚠️</span>
              Please fix the errors above to continue
            </p>
          )}
        </div>
      )}
    </form>
  );
};

// Example usage component for project creation
const ProjectForm: React.FC = () => {
  const projectFields: FormField[] = [
    {
      name: 'title',
      label: 'Project Title',
      type: 'text',
      placeholder: 'Enter project title...',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      helpText: 'Choose a descriptive title for your project'
    },
    {
      name: 'description',
      label: 'Project Description',
      type: 'textarea',
      placeholder: 'Describe your project...',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 2000
      },
      helpText: 'Provide a detailed description of your project'
    },
    {
      name: 'githubUrl',
      label: 'GitHub URL',
      type: 'url',
      placeholder: 'https://github.com/username/repo',
      validation: {
        pattern: /^https?:\/\/(www\.)?github\.com\/.*$/,
        message: 'Please enter a valid GitHub URL'
      },
      helpText: 'Link to your GitHub repository'
    },
    {
      name: 'liveUrl',
      label: 'Live Demo URL',
      type: 'url',
      placeholder: 'https://yourproject.com',
      validation: {
        pattern: /^https?:\/\/.*$/,
        message: 'Please enter a valid URL'
      },
      helpText: 'Link to the live version of your project'
    },
    {
      name: 'status',
      label: 'Project Status',
      type: 'select',
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'archived', label: 'Archived' }
      ],
      validation: { required: true }
    },
    {
      name: 'technologies',
      label: 'Technologies Used',
      type: 'multiselect',
      options: [
        { value: 'React', label: 'React' },
        { value: 'TypeScript', label: 'TypeScript' },
        { value: 'Node.js', label: 'Node.js' },
        { value: 'Express', label: 'Express' },
        { value: 'MongoDB', label: 'MongoDB' },
        { value: 'PostgreSQL', label: 'PostgreSQL' },
        { value: 'Tailwind CSS', label: 'Tailwind CSS' },
        { value: 'Next.js', label: 'Next.js' }
      ],
      validation: { required: true },
      helpText: 'Select all technologies used in this project'
    }
  ];

  const handleSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Project created successfully!');
        // Reset form or redirect
      } else {
        alert('Error creating project: ' + result.message);
      }
    } catch (error) {
      alert('Network error creating project');
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
      <DynamicForm
        fields={projectFields}
        onSubmit={handleSubmit}
        submitLabel="Create Project"
        enableRealTimeValidation={true}
      />
    </div>
  );
};

export { DynamicForm, ProjectForm };
export default DynamicForm;