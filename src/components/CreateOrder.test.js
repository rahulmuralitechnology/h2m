import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOrder from './CreateOrder';

describe('CreateOrder Component', () => {
  const mockOnOrderCreated = jest.fn();
  const mockUser = { phone: '1234567890', name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('renders the form correctly', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient's Phone:")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Order' })).toBeInTheDocument();
  });

  it('calls onOrderCreated with the correct order details when the form is submitted (positive case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const orderDetails = mockOnOrderCreated.mock.calls[0][0];
    expect(orderDetails.recipientName).toBe('John Doe');
    expect(orderDetails.recipientPhone).toBe('9876543210');
    expect(orderDetails.senderPhone).toBe(mockUser.phone);
    expect(orderDetails.senderName).toBe(mockUser.phone);
    expect(orderDetails.status).toBe('Preparing');
    expect(orderDetails.createdAt).toBeDefined();
  });

  it('saves the new order to localStorage (positive case)', () => {
      render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

      const recipientNameInput = screen.getByLabelText("Recipient's Name:");
      const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
      const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

      fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
      fireEvent.click(createOrderButton);

      const storedOrders = JSON.parse(localStorage.getItem('orders'));
      expect(storedOrders).toHaveLength(1);
      expect(storedOrders[0].recipientName).toBe('John Doe');
      expect(storedOrders[0].recipientPhone).toBe('9876543210');
      expect(storedOrders[0].senderPhone).toBe(mockUser.phone);
      expect(storedOrders[0].senderName).toBe(mockUser.phone);
      expect(storedOrders[0].status).toBe('Preparing');
      expect(storedOrders[0].createdAt).toBeDefined();
  });

  it('adds the new order to existing orders in localStorage', () => {
    const existingOrder = { recipientName: 'Old Recipient', recipientPhone: '1111111111' };
    localStorage.setItem('orders', JSON.stringify([existingOrder]));

    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toHaveLength(2);
    expect(storedOrders[0]).toEqual(existingOrder);
    expect(storedOrders[1].recipientName).toBe('John Doe');
  });


  it('does not call onOrderCreated if recipient name is empty (negative case - validation)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it('does not call onOrderCreated if recipient phone is empty (negative case - validation)', () => {
      render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
      const recipientNameInput = screen.getByLabelText("Recipient's Name:");
      const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

      fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
      fireEvent.click(createOrderButton);

      expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

  it('handles localStorage being initially empty (edge case)', () => {
    localStorage.removeItem('orders'); // Ensure localStorage is empty

    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem('orders'))).toHaveLength(1);
  });

  it('handles user data missing from localStorage (edge case)', () => {
    localStorage.removeItem('user');
    localStorage.setItem('user', JSON.stringify({phone: '1231231234', name: 'Test User'}));

    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const orderDetails = mockOnOrderCreated.mock.calls[0][0];
    expect(orderDetails.senderPhone).toBe("1231231234");
  });

  it('submits the form when pressing Enter key in the last input field', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);

    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.keyDown(recipientPhoneInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
  });
});

