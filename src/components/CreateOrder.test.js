import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOrder from './CreateOrder';

describe('CreateOrder Component', () => {
  const mockOnOrderCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock user data in localStorage
    localStorage.setItem('user', JSON.stringify({ phone: '123-456-7890', name: 'Test User' }));
  });

  it('renders the form with input fields and a submit button', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient's Phone:")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Order' })).toBeInTheDocument();
  });

  it('updates recipient name and phone state when input values change', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const nameInput = screen.getByLabelText("Recipient's Name:");
    const phoneInput = screen.getByLabelText("Recipient's Phone:");

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '987-654-3210' } });

    expect(nameInput.value).toBe('John Doe');
    expect(phoneInput.value).toBe('987-654-3210');
  });

  it('calls onOrderCreated with the correct order details when the form is submitted (positive case)', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const nameInput = screen.getByLabelText("Recipient's Name:");
    const phoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
    fireEvent.click(submitButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];
    expect(order).toEqual(expect.objectContaining({
      senderPhone: '123-456-7890',
      senderName: '123-456-7890',
      recipientName: 'Jane Doe',
      recipientPhone: '555-123-4567',
      status: 'Preparing',
    }));
    expect(order.createdAt).toBeDefined();
  });

  it('saves the order to localStorage when the form is submitted', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const nameInput = screen.getByLabelText("Recipient's Name:");
    const phoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
    fireEvent.click(submitButton);

    const savedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(savedOrders).toHaveLength(1);
    expect(savedOrders[0]).toEqual(expect.objectContaining({
        senderPhone: '123-456-7890',
        senderName: '123-456-7890',
        recipientName: 'Jane Doe',
        recipientPhone: '555-123-4567',
        status: 'Preparing',
    }));
  });

  it('adds to existing orders in localStorage (edge case)', () => {
    const initialOrders = [{ recipientName: 'Old Order', recipientPhone: '111-222-3333', senderPhone: '123-456-7890', senderName: '123-456-7890', status: 'Preparing', createdAt: new Date().toISOString()}];
    localStorage.setItem('orders', JSON.stringify(initialOrders));

    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const nameInput = screen.getByLabelText("Recipient's Name:");
    const phoneInput = screen.getByLabelText("Recipient's Phone:");
    const submitButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
    fireEvent.click(submitButton);

    const savedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(savedOrders).toHaveLength(2);
    expect(savedOrders[1]).toEqual(expect.objectContaining({
        senderPhone: '123-456-7890',
        senderName: '123-456-7890',
        recipientName: 'Jane Doe',
        recipientPhone: '555-123-4567',
        status: 'Preparing',
    }));
    expect(savedOrders[0]).toEqual(expect.objectContaining({recipientName: 'Old Order', recipientPhone: '111-222-3333'}));
  });

  it('does not call onOrderCreated if required fields are empty (negative case - missing name)', () => {
        render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
        const phoneInput = screen.getByLabelText("Recipient's Phone:");
        const submitButton = screen.getByRole('button', { name: 'Create Order' });

        fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
        fireEvent.click(submitButton);

        expect(mockOnOrderCreated).not.toHaveBeenCalled();
  });

    it('does not call onOrderCreated if required fields are empty (negative case - missing phone)', () => {
        render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
        const nameInput = screen.getByLabelText("Recipient's Name:");
        const submitButton = screen.getByRole('button', { name: 'Create Order' });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.click(submitButton);

        expect(mockOnOrderCreated).not.toHaveBeenCalled();
    });

  it('handles empty localStorage orders gracefully (edge case)', () => {
      localStorage.removeItem('orders');
      render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
      const nameInput = screen.getByLabelText("Recipient's Name:");
      const phoneInput = screen.getByLabelText("Recipient's Phone:");
      const submitButton = screen.getByRole('button', { name: 'Create Order' });

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
      fireEvent.click(submitButton);

      const savedOrders = JSON.parse(localStorage.getItem('orders'));
      expect(savedOrders).toHaveLength(1);
    });

    it('handles missing user data in localStorage', () => {
        localStorage.removeItem('user');
        const { rerender } = render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
        const nameInput = screen.getByLabelText("Recipient's Name:");
        const phoneInput = screen.getByLabelText("Recipient's Phone:");
        const submitButton = screen.getByRole('button', { name: 'Create Order' });

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(phoneInput, { target: { value: '555-123-4567' } });
        fireEvent.click(submitButton);
        expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);

        const order = mockOnOrderCreated.mock.calls[0][0];
        expect(order).toEqual(expect.objectContaining({
            recipientName: 'Jane Doe',
            recipientPhone: '555-123-4567',
            status: 'Preparing',
        }));
    });
});

