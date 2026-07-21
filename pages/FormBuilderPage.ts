import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Form Builder canvas and properties panel.
 */
export class FormBuilderPage extends BasePage {
  // Create Form Dialog
  readonly formNameInput: Locator;
  readonly folderInput: Locator;
  readonly createFormConfirmBtn: Locator;

  // Builder Canvas & Elements
  readonly canvasArea: Locator;
  readonly propertiesPanel: Locator;
  readonly saveFormBtn: Locator;

  // Element Properties
  readonly elementTextboxInput: Locator;
  readonly fileUploadNativeInput: Locator;
  readonly fileUploadDropzone: Locator;

  constructor(page: Page) {
    super(page);

    // TODO: verify selectors for the New Form dialog
    this.formNameInput = page.getByLabel(/form name/i);
    this.folderInput = page.getByLabel(/folder/i);
    this.createFormConfirmBtn = page
      .getByRole('button', { name: /create/i })
      .filter({ hasText: 'Create' });

    // TODO: verify selectors for the builder canvas and panel
    this.canvasArea = page.locator('.builder-canvas-area');
    this.propertiesPanel = page.locator('.properties-right-panel');
    this.saveFormBtn = page.getByRole('button', { name: /save/i });

    // TODO: verify selectors for properties fields
    this.elementTextboxInput = page.getByPlaceholder(/enter text/i);

    // For file upload, usually there's a hidden native input or a drag-drop zone
    this.fileUploadNativeInput = page.locator('input[type="file"]');
    this.fileUploadDropzone = page.locator('.file-dropzone-area');
  }

  /**
   * Fills in mandatory details and creates a new form.
   * @param formName Name of the form to create.
   * @param folder Folder to save the form into (optional).
   */
  async createNewForm(formName: string, folder?: string): Promise<void> {
    await this.fillField(this.formNameInput, formName);
    if (folder) {
      await this.fillField(this.folderInput, folder);
    }
    await this.clickAndWait(this.createFormConfirmBtn);
  }

  /**
   * Drags a specified element type from the toolbox onto the canvas.
   * Uses manual mouse events as it's often more reliable for complex canvas builders.
   * @param elementType The type of element to drag.
   */
  async dragElementToCanvas(elementType: 'Textbox' | 'SelectFile'): Promise<void> {
    // TODO: verify selector for toolbox items
    const sourceElement = this.page.getByRole('button', { name: elementType }).first();

    // Ensure both source and target are visible
    await expect(sourceElement).toBeVisible();
    await expect(this.canvasArea).toBeVisible();

    const targetBox = await this.canvasArea.boundingBox();
    const sourceBox = await sourceElement.boundingBox();

    if (!targetBox || !sourceBox) throw new Error('Could not find bounding box for drag-and-drop');

    // Manual drag and drop flow (often more stable for HTML5/JS canvas builders than locator.dragTo)
    await this.page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2
    );
    await this.page.mouse.down();

    // Move to center of canvas, then slightly offset to place items sequentially
    await this.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 5 }
    );
    await this.page.mouse.up();
  }

  /**
   * Selects an element already dropped on the canvas to open its properties.
   * @param elementType The type of element to select.
   */
  async selectCanvasElement(elementType: 'Textbox' | 'SelectFile'): Promise<void> {
    // TODO: verify selector for elements residing on the canvas
    const canvasItem = this.canvasArea.locator(`.canvas-item-${elementType.toLowerCase()}`).first();
    await canvasItem.click();
  }

  /**
   * Asserts that the right properties panel is visible after selecting an element.
   */
  async assertPropertiesPanelVisible(): Promise<void> {
    await expect(this.propertiesPanel).toBeVisible({ timeout: 5000 });
  }

  /**
   * Enters text into a Textbox element via the properties panel (or directly in canvas if applicable).
   * @param value Text to enter.
   */
  async enterTextboxValue(value: string): Promise<void> {
    await this.fillField(this.elementTextboxInput, value);
  }

  /**
   * Uploads a file to the Select File element.
   * Provides both native setInputFiles and standard interaction as alternatives.
   * @param filePath Absolute or relative path to the file.
   */
  async uploadFile(filePath: string): Promise<void> {
    // Approach 1: If there is a native <input type="file"> available (even if hidden)
    // This is the most reliable way in Playwright.
    await this.fileUploadNativeInput.setInputFiles(filePath);

    /* 
    Approach 2: If it's a completely custom widget without a native file input, 
    you would need to simulate a FileChooser or DataTransfer drop:
    
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileUploadDropzone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    */
  }

  /**
   * Clicks the save button for the form.
   */
  async saveForm(): Promise<void> {
    await this.clickAndWait(this.saveFormBtn);
  }

  /**
   * Clicks the save button and captures the backend API response.
   * @returns The network Response object.
   */
  async saveFormAndCatchResponse() {
    // TODO: verify exact API endpoint for saving the form
    const saveResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/forms/save') && response.request().method() === 'POST',
      { timeout: 10000 }
    );
    await this.clickAndWait(this.saveFormBtn);
    return await saveResponsePromise;
  }

  /**
   * Verifies that the form saved successfully via a toast or UI indicator.
   */
  async assertFormSavedSuccessfully(): Promise<void> {
    await this.verifyToast('Form saved successfully');
  }

  /**
   * Verifies that the UI reflects the uploaded file name.
   * @param fileName The expected name of the uploaded file.
   */
  async assertFileUploadedSuccessfully(fileName: string): Promise<void> {
    // TODO: verify selector indicating successful upload (e.g., a file chip or label)
    const uploadedFileChip = this.page.getByText(fileName, { exact: true });
    await expect(uploadedFileChip).toBeVisible();
  }
}
