/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App'; // Adjust the path as necessary
import '@testing-library/jest-dom';

describe('App Component Tests', () => {

  it('renders without crashing', () => {
    render(<App />);
    const appElement = screen.getByTestId('app-container');
    expect(appElement).toBeInTheDocument();
  });

  it('renders the initial message', () => {
    render(<App />);
    const initialMessage = screen.getByText(/Initial Message/i); //Adjust the regex
    expect(initialMessage).toBeInTheDocument();
  });


  it('updates the message on button click (Positive case)', async () => {
    render(<App />);
    const buttonElement = screen.getByRole('button', { name: /Change Message/i });  // Adjust the button name if different
    fireEvent.click(buttonElement);

    // Use waitFor to handle asynchronous updates
    await waitFor(() => {
      const updatedMessage = screen.queryByText(/Updated Message/i); //Adjust the regex
      expect(updatedMessage).toBeInTheDocument();
    });
  });

  it('input field accepts and displays user input', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'Test Input' } });

    expect(inputElement).toHaveValue('Test Input');

    const displayElement = screen.getByText(/Test Input/i); //Adjust the regex

     expect(displayElement).toBeInTheDocument();
  });

  it('handles empty input correctly', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: '' } });

    expect(inputElement).toHaveValue('');

    // Check that the display area is empty or shows a default message if implemented.
     // Replace with your own logic if you have specific behavior for empty input

  });

  it('handles very long input correctly (Edge case)', async () => {
    render(<App />);
    const inputElement = screen.getByRole('textbox');
    const longString = 'This is a very long string'.repeat(100);
    fireEvent.change(inputElement, { target: { value: longString } });

    expect(inputElement).toHaveValue(longString);
    const displayElement = screen.getByText(new RegExp(longString.substring(0,20)));//Adjust for your own regex and display logic to avoid overflowing jest
     expect(displayElement).toBeInTheDocument();
  });

  it('displays an error message if API call fails (Simulate Error)', async () => {
    // Mock the fetch API to simulate a failed API call
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    );
    render(<App />);
    const buttonElement = screen.getByRole('button', { name: /Change Message/i });  // Adjust the button name if different
    fireEvent.click(buttonElement);


    await waitFor(() => {
       const errorElement = screen.queryByText(/Error/i); // Adjust to expected error message.  This assumes that the component displays an error if the api fails.

        //Check that some error element is present, adjust regex/querySelector according to the actual behavior
       expect(errorElement).toBeInTheDocument();
    });
  });

    it('simulates a slow network response and displays a loading state', async () => {
    global.fetch = jest.fn(() =>
      new Promise(resolve => setTimeout(() => resolve({json: () => Promise.resolve({})}) , 500)) //Simulates slow response
    );

    render(<App />);

    const buttonElement = screen.getByRole('button', { name: /Change Message/i });  // Adjust the button name if different
    fireEvent.click(buttonElement);


    await waitFor(() => {

        const loadingElement = screen.queryByText(/Loading/i)
        expect(loadingElement).toBeInTheDocument()
    });
});
});

