import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from './BookingForm';

describe('BookingForm Component', () => {

  it('renders all input fields and submit button', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText('Your Location:')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery Location (Son\'s Workplace):')).toBeInTheDocument();
    expect(screen.getByLabelText('Son\'s Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Son\'s Phone Number:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Order' })).toBeInTheDocument();
  });

  it('updates the form data when input fields are changed', () => {
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

  it('displays an alert when the form is submitted with valid data', () => {
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

    expect(alertMock).toHaveBeenCalledWith('Order Booked!');
    alertMock.mockRestore();
  });

  it('prevents submission when required fields are empty', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    render(<BookingForm />);
    const submitButton = screen.getByRole('button', { name: 'Book Order' });
    fireEvent.click(submitButton);

    expect(alertMock).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('handles very long strings in input fields', () => {
    render(<BookingForm />);
    const yourLocationInput = screen.getByLabelText('Your Location:');
    const longString = 'This is a very long string '.repeat(50);

    fireEvent.change(yourLocationInput, { target: { value: longString } });
    expect(yourLocationInput.value).toBe(longString);
  });

    it('handles special characters in input fields', () => {
    render(<BookingForm />);
    const yourLocationInput = screen.getByLabelText('Your Location:');
    const specialChars = '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';

    fireEvent.change(yourLocationInput, { target: { value: specialChars } });
    expect(yourLocationInput.value).toBe(specialChars);
  });

  it('handles empty strings in input fields', () => {
    render(<BookingForm />);
    const yourLocationInput = screen.getByLabelText('Your Location:');

    fireEvent.change(yourLocationInput, { target: { value: '' } });
    expect(yourLocationInput.value).toBe('');
  });

  it('logs the form data to the console on submit', () => {
      const consoleSpy = jest.spyOn(console, 'log');
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

      expect(consoleSpy).toHaveBeenCalledWith({
          yourLocation: 'Home',
          deliveryLocation: 'Workplace',
          sonName: 'John Doe',
          sonPhone: '123-456-7890'
      });

      consoleSpy.mockRestore();
  });

});

