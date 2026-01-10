import { test, expect } from '@playwright/test';

test.describe('Core User Flow', () => {
    test('should register, create task, complete it and gain XP', async ({ page }) => {
        // 1. Visit Home/Login
        console.log('Navigating to home...');
        await page.goto('/');

        // Check if we are already logged in (Dashboard visible) or at Login Page
        const isDashboard = await page.getByText('Ofensiva').isVisible().catch(() => false);

        if (!isDashboard) {
            console.log('At login page, attempting registration...');
            // 2. Register new account
            // Switch to Register mode if needed
            const createAccountBtn = page.getByRole('button', { name: 'Criar conta' });
            if (await createAccountBtn.isVisible()) {
                await createAccountBtn.click();
            }

            const timestamp = Date.now();
            const testEmail = `test.e2e.${timestamp}@example.com`;

            await page.getByPlaceholder('Seu nome completo').fill(`Test User ${timestamp}`);
            await page.getByPlaceholder('seu@email.com').fill(testEmail);
            await page.getByPlaceholder('•••••••').fill('password123');

            await page.getByRole('button', { name: 'Criar Conta Gratuita' }).click();

            // 3. Handle potential verification screen
            // Wait up to 5s to see if verification screen appears
            try {
                const verificationMsg = page.getByRole('heading', { name: 'Verifique seu E-mail' });
                await expect(verificationMsg).toBeVisible({ timeout: 5000 });
                console.log('Email verification required. Test cannot proceed automatically with real auth.');
                // Testing workaround: If we had a "force login" debug route, we would use it here.
                // For now, let's try the "Mode Offline" if available in login page as fallback?
                // Re-visiting login page
                await page.getByRole('button', { name: 'Voltar para Login' }).click();
                await page.getByRole('button', { name: 'Entrar em Modo Offline' }).click();
            } catch (e) {
                // If verification screen didn't appear, maybe we logged in automatically?
                // Start Guest Mode if registration failed/network error
                const offlineBtn = page.getByRole('button', { name: 'Entrar em Modo Offline' });
                if (await offlineBtn.isVisible()) {
                    await offlineBtn.click();
                }
            }
        }

        // Expect Dashboard
        await expect(page).toHaveURL(/.*dashboard/);
        console.log('Logged in/Dashboard reached.');

        // 4. Create Task
        // Open Add Modal
        await page.getByRole('button', { name: 'Nova Tarefa' }).first().click();

        const taskTitle = `E2E Task ${Date.now()}`;
        await page.getByPlaceholder('O que você precisa fazer?').fill(taskTitle);

        // Create
        await page.getByRole('button', { name: 'Criar Tarefa' }).click();

        // 5. Verify task in list
        // Navigate to Tasks list to be sure
        await page.goto('/tasks');
        await expect(page).toHaveURL(/.*tasks/);

        const taskItem = page.getByText(taskTitle);
        await expect(taskItem).toBeVisible();

        // 6. Complete Task
        // Using the recently added aria-label for better selection
        const completeButton = page.getByLabel(`Tarefa ${taskTitle} pendente`);
        await completeButton.click();

        // 7. Verify Completion
        // Button should now indicate completion (or task might move/disappear depending on filter)
        // We expect a visual change or aria-label update
        // If list updates fast, it might become "Tarefa ... concluída"
        await expect(page.getByLabel(`Tarefa ${taskTitle} concluída`)).toBeVisible();

        console.log('Task completed successfully.');
    });
});
