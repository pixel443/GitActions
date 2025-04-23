import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, GitPullRequest } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [repository, setRepository] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a project');
      return;
    }

    // Validate repository format (owner/repo)
    if (!repository.match(/^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/)) {
      toast.error('Repository must be in the format "owner/repo"');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await createProject({
        name,
        repository,
        description: description || undefined,
        user_id: user.id,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Project created successfully');
      navigate(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Project
        </h1>
      </div>
      
      <div className="card p-6 sm:p-8 max-w-3xl">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GitPullRequest className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the details for your GitHub repository monitoring
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              placeholder="My GitHub Project"
            />
          </div>
          
          <div>
            <label htmlFor="repository" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub Repository*
            </label>
            <input
              type="text"
              id="repository"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              required
              className="form-input"
              placeholder="owner/repository"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: username/repository or organization/repository
            </p>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Brief description of this project"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}