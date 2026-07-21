import { describe, it, expect } from 'vitest';
import {
  buildFormContentPayload,
  buildProcessWorkflowPayload,
  buildDependencyPayload
} from '../../utils/payloads';

describe('Payload Builders', () => {
  describe('buildFormContentPayload', () => {
    it('should generate a correct form content payload matching the interface', () => {
      const payload = buildFormContentPayload('TestForm');
      expect(payload).toHaveProperty('fields');
      expect(Array.isArray(payload.fields)).toBe(true);
      expect(payload.fields.length).toBe(3);

      const textNode = payload.fields.find((f) => f.type === 'TextBox');
      expect(textNode).toBeDefined();
      expect(textNode?.name).toBe('TestForm_TextBox');
    });

    it('should throw an error if formName is empty', () => {
      expect(() => buildFormContentPayload('')).toThrowError(/required/);
      expect(() => buildFormContentPayload('   ')).toThrowError(/required/);
    });
  });

  describe('buildProcessWorkflowPayload', () => {
    it('should correctly embed the formFileId in InitialStep and FormStep', () => {
      const mockFormId = 'form-uuid-12345';
      const payload = buildProcessWorkflowPayload(mockFormId);

      const initialStep = payload.nodes.find((n) => n.id === 'InitialStep');
      const formStep = payload.nodes.find((n) => n.id === 'FormStep');

      expect(initialStep).toBeDefined();
      expect(initialStep?.formId).toBe(mockFormId);

      expect(formStep).toBeDefined();
      expect(formStep?.formId).toBe(mockFormId);
    });

    it('should throw an error if formFileId is empty or missing', () => {
      expect(() => buildProcessWorkflowPayload('')).toThrowError(/required/);
    });
  });

  describe('buildDependencyPayload', () => {
    it('should correctly structure an array of dependencies', () => {
      const deps = ['file-id-1', 'file-id-2'];
      const payload = buildDependencyPayload(deps);

      expect(payload.dependencies).toEqual(deps);
    });

    it('should handle an empty array of dependencies', () => {
      const payload = buildDependencyPayload([]);
      expect(payload.dependencies).toEqual([]);
    });
  });
});
