import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './about';

test('renders about page', () => {
  render(<About />);
  const aboutElement = screen.getByText(/About page/i);
  expect(aboutElement).toBeInTheDocument();
});
