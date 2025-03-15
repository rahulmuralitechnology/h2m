import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import CreateOrder from './CreateOrder';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock CreateOrder component
jest.mock('./CreateOrder', () => {
  return function MockCreateOrder({ onOrderCreated }) {
    return (
      <div>
        <button data-testid="create-order-button" onClick={() => onOrderCreated({
          senderName: 'Test Sender',
          senderPhone: '1234567890',
          recipientName: 'Test Recipient',
          recipientPhone: '0987654321',
          createdAt: new Date().toISOString(),
        })}>Create Order</button>
      </div>
    );
  };
});


describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.useRealTimers();
    global.setInterval.mockRestore();
    global.clearInterval.mockRestore();
  });

  const mockUser = { phone: '1234567890' };

  it('renders without crashing', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays "No orders placed or received yet." when there are no orders', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('fetches and displays orders from localStorage for the user', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    const mockOrders = [
      {
        senderName: 'Test Sender',
        senderPhone: '1234567890',
        recipientName: 'Test Recipient',
        recipientPhone: '0987654321',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
      {
        senderName: 'Another Sender',
        senderPhone: '0987654321',
        recipientName: 'Another Recipient',
        recipientPhone: '1234567890',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
      {
        senderName: 'Irrelevant Sender',
        senderPhone: '1111111111',
        recipientName: 'Irrelevant Recipient',
        recipientPhone: '2222222222',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    expect(screen.getAllByText(/Status: Preparing/i).length).toBe(2);

  });

  it('adds a new order when CreateOrder emits an event', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);
    const createOrderButton = screen.getByTestId('create-order-button');
    fireEvent.click(createOrderButton);
    expect(screen.getByText(/Status: Preparing/i)).toBeInTheDocument();
  });

  it('filters orders based on the selected status', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    const mockOrders = [
      {
        senderName: 'Test Sender',
        senderPhone: '1234567890',
        recipientName: 'Test Recipient',
        recipientPhone: '0987654321',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
      {
        senderName: 'Another Sender',
        senderPhone: '0987654321',
        recipientName: 'Another Recipient',
        recipientPhone: '1234567890',
        createdAt: new Date().toISOString(),
        status: 'Delivered',
        timeRemaining: 0,
      },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'delivered' } });
    expect(screen.getAllByText(/Status:/i).length).toBe(1);
    expect(screen.getByText(/Status: Delivered/i)).toBeInTheDocument();

    fireEvent.change(selectElement, { target: { value: 'preparing' } });
    expect(screen.getAllByText(/Status:/i).length).toBe(1);
    expect(screen.getByText(/Status: Preparing/i)).toBeInTheDocument();

    fireEvent.change(selectElement, { target: { value: 'all' } });
    expect(screen.getAllByText(/Status:/i).length).toBe(2);

  });

  it('cancels an order and updates localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    const mockOrders = [
      {
        senderName: 'Test Sender',
        senderPhone: '1234567890',
        recipientName: 'Test Recipient',
        recipientPhone: '0987654321',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);
    const cancelButton = screen.getByRole('button', { name: /cancel order/i });

    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Status: Preparing/i)).toBeNull();
    expect(localStorage.getItem('orders')).toBe('[]')
  });

  it('updates order status based on remaining time using setInterval', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    const now = new Date();
    const past = new Date(now.getTime() - (9 * 60 * 1000)); // 9 minutes ago

    const mockOrders = [
      {
        senderName: 'Test Sender',
        senderPhone: '1234567890',
        recipientName: 'Test Recipient',
        recipientPhone: '0987654321',
        createdAt: past.toISOString(),
        status: 'Preparing',
        timeRemaining: 9,
      },
    ];
    localStorage.setItem('orders', JSON.stringify(mockOrders));

    render(<Dashboard />);

    act(() => {
      jest.advanceTimersByTime(60000 * 11); // Advance 11 minutes. Initial render will calculate a time remaing, setInterval will then trigger the update.
    });

    expect(screen.getByText(/Status: Delivered/i)).toBeInTheDocument();
    expect(setInterval).toHaveBeenCalled();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('handles a user with no phone number', () => {
      localStorage.setItem('user', JSON.stringify({}));
      render(<Dashboard />);
      expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();

  });

  it('handles empty or invalid localStorage data gracefully', () => {
    localStorage.setItem('user', 'invalid json');
    localStorage.setItem('orders', 'invalid json');
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });
});

