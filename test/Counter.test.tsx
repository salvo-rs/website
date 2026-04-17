import { expect, test } from '@rstest/core';
import { page } from '@rstest/browser';
 import { render } from '@rstest/browser-react';
 import Counter from './Counter.tsx';
 
 test('increments count on button click', async () => {
  await render(<Counter initial={5} />);

  await expect.element(page.getByText('Count: 5')).toBeVisible();

  await page.getByRole('button', { name: 'Increment' }).click();
  await expect.element(page.getByText('Count: 6')).toBeVisible();
 });
 