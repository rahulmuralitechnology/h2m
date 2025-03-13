import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from './BookingForm';

describe('BookingForm Component', () => {
  test('renders all form elements', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText('Your Location:')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery Location (Son\'s Workplace):')).toBeInTheDocument();
    expect(screen.getByLabelText('Son\'s Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Son\'s Phone Number:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Order' })).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    render(<BookingForm />);
    const yourLocationInput = screen.getByLabelText('Your Location:');
    const deliveryLocationInput = screen.getByLabelText('Delivery Location (Son\'s Workplace):');
    const sonNameInput = screen.getByLabelText('Son\'s Name:');
    const sonPhoneInput = screen.getByLabelText('Son\'s Phone Number:');

    fireEvent.change(yourLocationInput, { target: { value: 'Home' } });
    fireEvent.change(deliveryLocationInput, { target: { value: 'Workplace' } });
    fireEvent.change(sonNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(sonPhoneInput, { target: { value: '123-456-7890' } });

    expect(yourLocationInput.value).toBe('Home');
    expect(deliveryLocationInput.value).toBe('Workplace');
    expect(sonNameInput.value).toBe('John Doe');
    expect(sonPhoneInput.value).toBe('123-456-7890');
  });

  test('submits the form with valid data (positive case)', () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<BookingForm />);

    const yourLocationInput = screen.getByLabelText('Your Location:');
    const deliveryLocationInput = screen.getByLabelText('Delivery Location (Son\'s Workplace):');
    const sonNameInput = screen.getByLabelText('Son\'s Name:');
    const sonPhoneInput = screen.getByLabelText('Son\'s Phone Number:');
    const submitButton = screen.getByRole('button', { name: 'Book Order' });

    fireEvent.change(yourLocationInput, { target: { value: 'Home' } });
    fireEvent.change(deliveryLocationInput, { target: { value: 'Workplace' } });
    fireEvent.change(sonNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(sonPhoneInput, { target: { value: '123-456-7890' } });
    fireEvent.click(submitButton);

    expect(consoleLogMock).toHaveBeenCalledWith({
      yourLocation: 'Home',
      deliveryLocation: 'Workplace',
      sonName: 'John Doe',
      sonPhone: '123-456-7890',
    });
    expect(alertMock).toHaveBeenCalledWith('Order Booked!');

    consoleLogMock.mockRestore();
    alertMock.mockRestore();
  });

  test('prevents submission with missing data (negative case)', () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(); // Spy on alert

    render(<BookingForm />);
    const submitButton = screen.getByRole('button', { name: 'Book Order' });

    fireEvent.click(submitButton);

    expect(consoleLogMock).not.toHaveBeenCalled();
    expect(alertMock).not.toHaveBeenCalled(); // Alert should not be called if submission is prevented

    consoleLogMock.mockRestore();
    alertMock.mockRestore();
  });

  test('handles empty string input correctly (edge case)', () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<BookingForm />);

    const yourLocationInput = screen.getByLabelText('Your Location:');
    const deliveryLocationInput = screen.getByLabelText('Delivery Location (Son\'s Workplace):');
    const sonNameInput = screen.getByLabelText('Son\'s Name:');
    const sonPhoneInput = screen.getByLabelText('Son\'s Phone Number:');
    const submitButton = screen.getByRole('button', { name: 'Book Order' });

    fireEvent.change(yourLocationInput, { target: { value: '' } });
    fireEvent.change(deliveryLocationInput, { target: { value: '' } });
    fireEvent.change(sonNameInput, { target: { value: '' } });
    fireEvent.change(sonPhoneInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    expect(consoleLogMock).not.toHaveBeenCalled(); // Submission prevented because of required fields
    expect(alertMock).not.toHaveBeenCalled();

    consoleLogMock.mockRestore();
    alertMock.mockRestore();
  });

  test('handles long string inputs (edge case)', () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();

    render(<BookingForm />);

    const yourLocationInput = screen.getByLabelText('Your Location:');
    const deliveryLocationInput = screen.getByLabelText('Delivery Location (Son\'s Workplace):');
    const sonNameInput = screen.getByLabelText('Son\'s Name:');
    const sonPhoneInput = screen.getByLabelText('Son\'s Phone Number:');
    const submitButton = screen.getByRole('button', { name: 'Book Order' });

    const longString = 'This is a very long string that exceeds the expected length for the input fields.'.repeat(10);

    fireEvent.change(yourLocationInput, { target: { value: longString } });
    fireEvent.change(deliveryLocationInput, { target: { value: longString } });
    fireEvent.change(sonNameInput, { target: { value: longString } });
    fireEvent.change(sonPhoneInput, { target: { value: '123-456-7890' } }); // valid phone

    fireEvent.click(submitButton);

    expect(consoleLogMock).toHaveBeenCalledWith({
      yourLocation: longString,
      deliveryLocation: longString,
      sonName: longString,
      sonPhone: '123-456-7890',
    });
    expect(alertMock).toHaveBeenCalledWith('Order Booked!');

    consoleLogMock.mockRestore();
    alertMock.mockRestore();
  }, 10000);
});

