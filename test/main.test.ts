import { test, expect } from '@rstest/core';
import { sayHi } from './main';

test('should sayHi correctly', () => {
  expect(sayHi()).toBe('hi');
});