import { test, expect } from '../../fixtures/authFixture';
import { AutomationDashboardPage } from '../../pages/AutomationDashboardPage';
import { FormBuilderPage } from '../../pages/FormBuilderPage';
import * as path from 'path';

test.describe('Use Case 1: Form with Upload Flow', () => {
  test('Form Upload Flow test', { tag: '@usecase1' }, async ({ loggedInPage }) => {
    const dashboardPage = new AutomationDashboardPage(loggedInPage);
    const formBuilderPage = new FormBuilderPage(loggedInPage);

    // Dynamic name to avoid conflicts if tests run repeatedly
    const uniqueFormName = `Automated_Form_${Date.now()}`;
    const testFilePath = path.join(__dirname, '..', '..', 'test-data', 'sample-upload.txt');
    const testFileName = 'sample-upload.txt';

    await test.step('1. Log in', async () => {
      // Handled automatically by the loggedInPage fixture, but explicitly noted here for completeness
      expect(loggedInPage, 'Page should be authenticated and loaded').toBeTruthy();
    });

    await test.step('2. Navigate to Automation from left-hand menu', async () => {
      await dashboardPage.navigateToAutomation();
    });

    await test.step('3. Click Create dropdown, select Form', async () => {
      await dashboardPage.openCreateForm();
    });

    await test.step('4. Fill mandatory details and click Create', async () => {
      await formBuilderPage.createNewForm(uniqueFormName);
    });

    await test.step('5. Drag and drop a Textbox and a Select File element onto canvas', async () => {
      await formBuilderPage.dragElementToCanvas('Textbox');
      await formBuilderPage.dragElementToCanvas('SelectFile');
    });

    await test.step('6. Click each element and verify UI interactions in right panel', async () => {
      // Verify Textbox properties
      await formBuilderPage.selectCanvasElement('Textbox');
      await expect(
        formBuilderPage.propertiesPanel,
        'Properties panel should be visible after clicking Textbox'
      ).toBeVisible();

      // Verify Select File properties
      await formBuilderPage.selectCanvasElement('SelectFile');
      await expect(
        formBuilderPage.propertiesPanel,
        'Properties panel should be visible after clicking Select File'
      ).toBeVisible();
    });

    await test.step('7. Enter text in textbox, upload a document from test-data folder', async () => {
      // Select textbox again to type in it
      await formBuilderPage.selectCanvasElement('Textbox');

      // Explicit assertion (a): Textbox visibility & interactivity
      await expect(
        formBuilderPage.elementTextboxInput,
        'Textbox input should be interactable'
      ).toBeVisible();
      await formBuilderPage.enterTextboxValue('Test Data Entry');

      // Now interact with file upload
      await formBuilderPage.selectCanvasElement('SelectFile');
      await formBuilderPage.uploadFile(testFilePath);

      // Explicit assertion (b): File upload status and confirmation
      await formBuilderPage.assertFileUploadedSuccessfully(testFileName);
    });

    await test.step('8. Save form and verify success UI feedback', async () => {
      await formBuilderPage.saveForm();
      await formBuilderPage.assertFormSavedSuccessfully();
    });
  });
});
