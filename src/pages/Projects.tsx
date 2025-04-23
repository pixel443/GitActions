import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { AlertTriangle, Clock, GitPullRequest, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

type Project = Database['public']['Tables']['projects']['Row'];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await getProjects(user.id);
        
        if (error) {
          throw error;
        }
        
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <Link
          to="/projects/new"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <Plus size={16} className="mr-1" />
          New Project
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <GitPullRequest className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by creating your first GitHub Action monitoring project.
          </p>
          <div className="mt-6">
            <Link to="/projects/new" className="btn-primary">
              <Plus size={16} className="mr-1 inline" />
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card p-6 hover:border-primary transition-all"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-xl truncate" title={project.name}>
                  {project.name}
                </h3>
                {!project.webhook_id && (
                  <div className="text-warning">
                    <AlertTriangle size={18} title="Webhook not configured" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {project.repository}
              </p>
              {project.description && (
                <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <Clock size={14} className="mr-1" />
                <span>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}