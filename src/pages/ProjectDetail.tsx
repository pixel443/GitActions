import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, deleteProject, setupGitHubWebhook, createEvent, updateEvent, deleteEvent } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Bell, GitBranch, GitPullRequest, Trash, Plus, AlertTriangle, RefreshCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import EventForm from '../components/EventForm';

type Project = Database['public']['Tables']['projects']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [setupWebhookLoading, setSetupWebhookLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    
    async function fetchProject() {
      try {
        setLoading(true);
        const { data, error } = await getProject(id);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error('Project not found');
          navigate('/projects');
          return;
        }
        
        setProject(data);
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, navigate]);

  const handleDeleteProject = async () => {
    if (!id || !project) return;
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await deleteProject(id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleSetupWebhook = async () => {
    if (!id || !project) return;
    
    try {
      setSetupWebhookLoading(true);
      const { error } = await setupGitHubWebhook(project.repository, [
        'pull_request',
        'push',
        'create',
        'delete'
      ]);
      
      if (error) {
        throw error;
      }
      
      // Refresh project data to get the updated webhook info
      const { data, error: fetchError } = await getProject(id);
      if (fetchError) throw fetchError;
      
      setProject(data);
      toast.success('GitHub webhook configured successfully');
    } catch (error) {
      console.error('Error setting up webhook:', error);
      toast.error('Failed to set up GitHub webhook');
    } finally {
      setSetupWebhookLoading(false);
    }
  };

  const handleAddEvent = async (eventData: {
    event_type: string;
    code_file_path: string;
    description?: string;
  }) => {
    if (!id || !project) return;
    
    try {
      const { data, error } = await createEvent({
        ...eventData,
        project_id: id,
      });
      
      if (error) {
        throw error;
      }
      
      setEvents([...events, data]);
      setShowEventForm(false);
      toast.success('Event trigger created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event trigger');
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: {
    event_type: string;
    code_file_path: string;
    description?: string;
  }) => {
    try {
      const { error } = await updateEvent(eventId, eventData);
      
      if (error) {
        throw error;
      }
      
      // Update the events list
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, ...eventData } 
          : event
      ));
      
      setEditingEvent(null);
      setShowEventForm(false);
      toast.success('Event trigger updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event trigger');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event trigger?')) {
      return;
    }
    
    try {
      const { error } = await deleteEvent(eventId);
      
      if (error) {
        throw error;
      }
      
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event trigger deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event trigger');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-medium">Project not found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The project you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Link to="/projects" className="btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
        </div>
        <button
          onClick={handleDeleteProject}
          className="btn-secondary text-error flex items-center"
        >
          <Trash size={16} className="mr-1" />
          Delete Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Repository</p>
                <p className="font-medium">{project.repository}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                  <p>{project.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p>{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Webhook Status</p>
                {project.webhook_id ? (
                  <div className="flex items-center text-success">
                    <Check size={16} className="mr-1" />
                    Configured
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-warning mb-2">
                      <AlertTriangle size={16} className="mr-1" />
                      Not Configured
                    </div>
                    <button
                      onClick={handleSetupWebhook}
                      disabled={setupWebhookLoading}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      {setupWebhookLoading ? (
                        <span className="flex items-center">
                          <RefreshCcw size={14} className="mr-1 animate-spin" />
                          Setting up...
                        </span>
                      ) : (
                        <span>Setup GitHub Webhook</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Triggers</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="btn-primary text-sm py-1 px-3 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Trigger
              </button>
            </div>
            
            {showEventForm && (
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <EventForm
                  event={editingEvent}
                  onSubmit={editingEvent ? 
                    (data) => handleUpdateEvent(editingEvent.id, data) : 
                    handleAddEvent
                  }
                  onCancel={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                />
              </div>
            )}
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No triggers configured</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Add your first event trigger to start monitoring your GitHub repository.
                </p>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="mt-4 btn-primary"
                >
                  <Plus size={16} className="mr-1 inline" />
                  Add Trigger
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-all"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {event.event_type.includes('pull_request') ? (
                          <GitPullRequest size={18} className="mr-2 text-primary" />
                        ) : (
                          <GitBranch size={18} className="mr-2 text-primary" />
                        )}
                        <span className="font-medium">{event.event_type}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEventForm(true);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-error hover:text-error-dark"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      Code File: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{event.code_file_path}</span>
                    </div>
                    {event.description && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}