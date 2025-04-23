import React, { useState, useEffect } from 'react';
import { Database } from '../types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

type EventFormProps = {
  event: Event | null;
  onSubmit: (data: {
    event_type: string;
    code_file_path: string;
    description?: string;
  }) => void;
  onCancel: () => void;
};

const EVENT_TYPES = [
  { value: 'pull_request.opened', label: 'Pull Request Created' },
  { value: 'pull_request.closed', label: 'Pull Request Closed' },
  { value: 'pull_request.merged', label: 'Pull Request Merged' },
  { value: 'push', label: 'Push (Code Changes)' },
  { value: 'create.branch', label: 'Branch Created' },
  { value: 'delete.branch', label: 'Branch Deleted' }
];

export default function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [eventType, setEventType] = useState(event?.event_type || EVENT_TYPES[0].value);
  const [codeFilePath, setCodeFilePath] = useState(event?.code_file_path || '');
  const [description, setDescription] = useState(event?.description || '');

  useEffect(() => {
    if (event) {
      setEventType(event.event_type);
      setCodeFilePath(event.code_file_path);
      setDescription(event.description || '');
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      event_type: eventType,
      code_file_path: codeFilePath,
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Event Type*
        </label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
          className="form-input"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="codeFilePath" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Code File Path*
        </label>
        <input
          type="text"
          id="codeFilePath"
          value={codeFilePath}
          onChange={(e) => setCodeFilePath(e.target.value)}
          required
          className="form-input font-mono"
          placeholder="C:\Users\username\path\to\file.py"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Full path to the file that should be executed when this event occurs
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
          rows={2}
          className="form-input"
          placeholder="Brief description of what this trigger does"
        />
      </div>
      
      <div className="pt-2 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {event ? 'Update' : 'Create'} Trigger
        </button>
      </div>
    </form>
  );
}