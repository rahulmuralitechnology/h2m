import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import CreateOrder from './CreateOrder';

jest.mock('./CreateOrder', () => {
  return jest.fn(() => <div data-testid="create-order-mock">CreateOrder Mock</div>);
});

describe('Dashboard Component', () => {
  const mockUser = { phone: '1234567890' };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(mockUser));
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders CreateOrder component', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('create-order-mock')).toBeInTheDocument();
  });

  it('displays "No orders placed or received yet." when no orders exist', () => {
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('fetches and displays user orders from localStorage on mount', () => {
    const mockOrders = [
      { senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt: new Date().toISOString() },
      { senderPhone: '9876543210', recipientName: 'Recipient2', recipientPhone: '1234567890', status: 'Preparing', createdAt: new Date().toISOString() },
      { senderPhone: '1112223333', recipientName: 'Recipient3', recipientPhone: '4445556666', status: 'Preparing', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    expect(screen.getAllByText(/Preparing/).length).toBe(2); // Only user's orders are displayed
  });

  it('filters orders based on selected status', () => {
    const mockOrders = [
      { senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt: new Date().toISOString() },
      { senderPhone: '9876543210', recipientName: 'Recipient2', recipientPhone: '1234567890', status: 'Delivered', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'preparing' } });
    expect(screen.getAllByText(/Preparing/).length).toBe(1);
    expect(screen.queryByText(/Delivered/)).toBeNull();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'delivered' } });
    expect(screen.getAllByText(/Delivered/).length).toBe(1);
    expect(screen.queryByText(/Preparing/)).toBeNull();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'all' } });
    expect(screen.getAllByText(/Preparing/).length).toBe(1);
    expect(screen.getAllByText(/Delivered/).length).toBe(1);

  });

  it('updates order status based on remaining time using setInterval', () => {
    const initialCreatedAt = new Date(new Date().getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    const mockOrders = [{ senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt: initialCreatedAt }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    expect(screen.getByText(/Status: Preparing/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(6 * 60 * 1000); // Advance time by 6 minutes
    });

    // Rerender to reflect changes in state.  The alternative is to use findByText and await for the change to occur.
    render(<Dashboard />);

    expect(screen.getByText(/Status: Delivered/)).toBeInTheDocument(); // Assert that the status has changed

  });

  it('handles order creation by adding new order to the state', () => {
    render(<Dashboard />);
    const mockNewOrder = { senderPhone: '1234567890', recipientName: 'New Recipient', recipientPhone: '5551234567', status: 'Preparing', createdAt: new Date().toISOString() };
    const createOrderComponent = CreateOrder.mock.calls[0][0];
    act(() => {
      createOrderComponent.onOrderCreated(mockNewOrder);
    });
    expect(screen.getByText(/New Recipient/)).toBeInTheDocument();

  });

  it('handles cancel order by removing order from the state and localStorage', () => {
    const mockOrders = [{ senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt: new Date().toISOString() }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel Order' });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/Recipient1/)).toBeNull();
    expect(JSON.parse(localStorage.getItem('orders'))).toEqual([]);
  });

  it('displays "To: RecipientName (RecipientPhone)" if the user is the sender', () => {
    const mockOrders = [{ senderPhone: '1234567890', senderName: 'Sender', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt: new Date().toISOString() }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    expect(screen.getByText(/To: Recipient1/)).toBeInTheDocument();
  });

  it('displays "From: SenderName (SenderPhone)" if the user is the recipient', () => {
    const mockOrders = [{ senderPhone: '9876543210', senderName: 'Sender', recipientName: 'Recipient1', recipientPhone: '1234567890', status: 'Preparing', createdAt: new Date().toISOString() }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    expect(screen.getByText(/From: Sender/)).toBeInTheDocument();
  });

  it('correctly calculates and displays time remaining', () => {
      const createdAt = new Date(new Date().getTime() - 3 * 60 * 1000).toISOString();
      const mockOrders = [{ senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt }];
      localStorage.setItem('orders', JSON.stringify(mockOrders));

      render(<Dashboard />);

      expect(screen.getByText(/Time Remaining: 6 minutes/)).toBeInTheDocument();

  });

  it('handles edge case of time remaining being exactly 0', () => {
    const createdAt = new Date(new Date().getTime() - 10 * 60 * 1000).toISOString(); // exactly 10 minutes ago
    const mockOrders = [{ senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    expect(screen.getByText(/Time Remaining: 0 minutes/)).toBeInTheDocument();
  });

  it('handles time remaining going negative (already delivered)', () => {
    const createdAt = new Date(new Date().getTime() - 15 * 60 * 1000).toISOString(); // 15 minutes ago
    const mockOrders = [{ senderPhone: '1234567890', recipientName: 'Recipient1', recipientPhone: '9876543210', status: 'Preparing', createdAt }];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    expect(screen.getByText(/Time Remaining: 0 minutes/)).toBeInTheDocument();

  });
});

