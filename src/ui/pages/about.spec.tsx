import { render, screen } from '@testing-library/react';
import React from 'react';

import About from './about';

test('renders about page', () => {
  render(<About />);
  const aboutElement = screen.getByText(/About page/i);
  expect(aboutElement).toBeInTheDocument();
});
