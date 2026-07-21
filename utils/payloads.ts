export interface AuthRequest {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

export interface CreateFileRequest {
  name: string;
  parentId: string; // The folder ID
  contentType: string; // e.g. 'application/vnd.aa.form'
}

export interface FormContentPayload {
  // TODO: Add actual required form metadata based on network inspection
  fields: Record<string, unknown>[];
}

export interface ProcessWorkflowPayload {
  // TODO: Add actual required process metadata based on network inspection
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}

export interface DependencyPayload {
  dependencies: string[];
}

export function buildFormContentPayload(formName: string): FormContentPayload {
  if (!formName || formName.trim() === '') {
    throw new Error('formName is required and cannot be empty');
  }
  return {
    fields: [
      { type: 'TextBox', name: `${formName}_TextBox`, label: 'Text Box' },
      { type: 'TextArea', name: `${formName}_TextArea`, label: 'Text Area' },
      { type: 'Number', name: `${formName}_Number`, label: 'Number Input' }
    ]
  };
}

export function buildProcessWorkflowPayload(formFileId: string): ProcessWorkflowPayload {
  if (!formFileId || formFileId.trim() === '') {
    throw new Error('formFileId is required and cannot be empty');
  }
  return {
    nodes: [
      { id: 'InitialStep', type: 'Start', formId: formFileId },
      { id: 'FormStep', type: 'Task', formId: formFileId },
      { id: 'EndStep', type: 'End' }
    ],
    edges: [
      { from: 'InitialStep', to: 'FormStep' },
      { from: 'FormStep', to: 'EndStep' }
    ]
  };
}

export function buildDependencyPayload(fileIds: string[]): DependencyPayload {
  return {
    dependencies: fileIds
  };
}
