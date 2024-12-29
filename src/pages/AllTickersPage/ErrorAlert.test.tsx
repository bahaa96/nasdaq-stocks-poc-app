import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ErrorAlert } from './ErrorAlert';
import '@testing-library/jest-dom';

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    const message = 'This is an error message';
    render(<ErrorAlert message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders the alert icon', () => {
    const message = 'This is an error message';
    render(<ErrorAlert message={message} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
