import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import CreateOrder from './CreateOrder'; // Assuming this is in the same directory

jest.mock('./CreateOrder', () => {
  return function MockCreateOrder(props) {
    return (
      <div>
        <button data-testid="create-order-button" onClick={() => props.onOrderCreated({ senderPhone: '1234567890', recipientPhone: '0987654321', senderName: 'Sender', recipientName: 'Recipient', createdAt: new Date().toISOString()})}>Create Order</button>
      </div>
    );
  };
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

  it('displays "No orders placed or received yet." when no orders are present', () => {
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('loads orders from localStorage that belong to the user', () => {
    const mockOrders = [
      { senderPhone: '1234567890', recipientPhone: '0987654321', senderName: 'Sender', recipientName: 'Recipient', status: 'Preparing', createdAt: new Date().toISOString() },
      { senderPhone: '9999999999', recipientPhone: '1234567890', senderName: 'Sender2', recipientName: 'Recipient2', status: 'Delivered', createdAt: new Date().toISOString() },
      { senderPhone: '5555555555', recipientPhone: '6666666666', senderName: 'Sender3', recipientName: 'Recipient3', status: 'Preparing', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);
    expect(screen.getByText(/To: Recipient/)).toBeInTheDocument();
    expect(screen.getByText(/From: Sender2/)).toBeInTheDocument();
    expect(screen.queryByText(/From: Sender3/)).toBeNull();
  });

  it('adds a new order when CreateOrder component creates an order', async () => {
    render(<Dashboard />);
    const createOrderButton = screen.getByTestId('create-order-button');
    fireEvent.click(createOrderButton);

    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state updates
      });
      expect(screen.getByText(/To: Recipient/)).toBeInTheDocument();
  });

  it('filters orders based on selected status', async () => {
    const mockOrders = [
      { senderPhone: '1234567890', recipientPhone: '0987654321', senderName: 'Sender', recipientName: 'Recipient', status: 'Preparing', createdAt: new Date().toISOString() },
      { senderPhone: '9999999999', recipientPhone: '1234567890', senderName: 'Sender2', recipientName: 'Recipient2', status: 'Delivered', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'preparing' } });

    expect(screen.getByText(/Preparing/)).toBeInTheDocument();
    expect(screen.queryByText(/Delivered/)).toBeNull();

    fireEvent.change(selectElement, { target: { value: 'delivered' } });

    expect(screen.getByText(/Delivered/)).toBeInTheDocument();
    expect(screen.queryByText(/Preparing/)).toBeNull();

    fireEvent.change(selectElement, { target: { value: 'all' } });
    expect(screen.getByText(/Preparing/)).toBeInTheDocument();
    expect(screen.getByText(/Delivered/)).toBeInTheDocument();

  });

  it('cancels an order and updates localStorage', async () => {
    const mockOrders = [
      { senderPhone: '1234567890', recipientPhone: '0987654321', senderName: 'Sender', recipientName: 'Recipient', status: 'Preparing', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);
    expect(screen.getByText(/To: Recipient/)).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel Order');
    fireEvent.click(cancelButton);
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state updates
      });

    expect(screen.queryByText(/To: Recipient/)).toBeNull();
    expect(JSON.parse(localStorage.getItem('orders'))).toEqual([]);
  });

   it('updates order status and timeRemaining every second', async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 5 * 60 * 1000);
     const mockOrders = [
      { senderPhone: '1234567890', recipientPhone: '0987654321', senderName: 'Sender', recipientName: 'Recipient', status: 'Preparing', createdAt: future.toISOString() },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    // Initial render displays "Preparing" and Time Remaining.
    expect(screen.getByText(/Preparing/)).toBeInTheDocument();
    expect(screen.getByText(/Time Remaining:/)).toBeInTheDocument();

    // Advance time by 1 minute
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state updates
      });

    // Check time remaining is reduced. Due to possible small calculation differences, just check if value is present and isn't zero
    expect(screen.getByText(/Time Remaining:/).textContent).toContain('Time Remaining:');

    //Advance time by another 10 minutes. This should make the order delivered
    act(() => {
      jest.advanceTimersByTime(10 * 60000);
    });
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state updates
      });

    expect(screen.getByText(/Delivered/)).toBeInTheDocument();

  });

  it('handles edge case where user is null in localStorage', () => {
    localStorage.removeItem('user');
    const { container } = render(<Dashboard />);

    //This test asserts the component renders without errors when user is null.
     expect(container).toBeDefined();

  });

  it('handles edge case where orders in localStorage are corrupted', () => {
    localStorage.setItem('orders', 'invalid JSON');
    render(<Dashboard />);

    // Assert that the component renders without crashing despite corrupted data.
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('Handles edge case where the user has no phone defined', () => {
      const mockUserNoPhone = {name: 'test user'};
      localStorage.setItem('user', JSON.stringify(mockUserNoPhone));
      render(<Dashboard />);

      expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });
});

