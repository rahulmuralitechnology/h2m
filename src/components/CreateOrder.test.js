import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateOrder from './CreateOrder';

describe('CreateOrder Component', () => {
  const mockOnOrderCreated = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    mockOnOrderCreated.mockClear();
    localStorage.setItem('user', JSON.stringify({ phone: '1234567890' }));
  });

  it('renders the component correctly', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    expect(screen.getByLabelText("Recipient's Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Recipient's Phone:")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Order' })).toBeInTheDocument();
  });

  it('creates an order with valid input', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];
    expect(order.recipientName).toBe('John Doe');
    expect(order.recipientPhone).toBe('9876543210');
    expect(order.senderPhone).toBe('1234567890');
    expect(order.senderName).toBe('1234567890');
    expect(order.status).toBe('Preparing');
    expect(order.createdAt).toBeDefined();

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toHaveLength(1);
    expect(storedOrders[0]).toEqual(order);

  });

  it('creates an order when localStorage is empty', () => {
    localStorage.removeItem('orders');
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '1122334455' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toHaveLength(1);
    expect(storedOrders[0]).toEqual(order);
  });

  it('adds to existing orders in local storage', () => {
    const initialOrders = [{ recipientName: 'Old Order', recipientPhone: '0000000000' }];
    localStorage.setItem('orders', JSON.stringify(initialOrders));
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'New Order' } });
    fireEvent.change(recipientPhoneInput, { target: { value: '9999999999' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toHaveLength(2);
    expect(storedOrders[1]).toEqual(order);
    expect(storedOrders[0].recipientName).toBe('Old Order');
  });

  it('does not create an order if recipient name is empty', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientPhoneInput, { target: { value: '9876543210' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
    expect(localStorage.getItem('orders')).toBeNull();
  });

    it('does not create an order if recipient phone is empty', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    fireEvent.change(recipientNameInput, { target: { value: 'John Doe' } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).not.toHaveBeenCalled();
    expect(localStorage.getItem('orders')).toBeNull();
  });

  it('handles edge case: very long recipient name and phone', () => {
    render(<CreateOrder onOrderCreated={mockOnOrderCreated} />);
    const recipientNameInput = screen.getByLabelText("Recipient's Name:");
    const recipientPhoneInput = screen.getByLabelText("Recipient's Phone:");
    const createOrderButton = screen.getByRole('button', { name: 'Create Order' });

    const longName = 'a'.repeat(200);
    const longPhone = '1'.repeat(200);

    fireEvent.change(recipientNameInput, { target: { value: longName } });
    fireEvent.change(recipientPhoneInput, { target: { value: longPhone } });
    fireEvent.click(createOrderButton);

    expect(mockOnOrderCreated).toHaveBeenCalledTimes(1);
    const order = mockOnOrderCreated.mock.calls[0][0];
    expect(order.recipientName).toBe(longName);
    expect(order.recipientPhone).toBe(longPhone);

    const storedOrders = JSON.parse(localStorage.getItem('orders'));
    expect(storedOrders).toHaveLength(1);
    expect(storedOrders[0]).toEqual(order);
  });
});

