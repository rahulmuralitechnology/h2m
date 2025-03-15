import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = String(value);
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock CreateOrder component to avoid needing to test it separately.
jest.mock('./CreateOrder', () => {
  return function MockCreateOrder({ onOrderCreated }) {
    const handleClick = () => {
      onOrderCreated({
        senderName: 'Test Sender',
        senderPhone: '123-456-7890',
        recipientName: 'Test Recipient',
        recipientPhone: '987-654-3210',
        createdAt: new Date().toISOString(),
        status: 'Preparing',
        timeRemaining: 10
      });
    };

    return (
      <div>
        <button data-testid="create-order-button" onClick={handleClick}>Create Order</button>
      </div>
    );
  };
});


describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ phone: '123-456-7890' }));
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays "No orders placed or received yet." when no orders are in localStorage', () => {
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('fetches and displays orders from localStorage matching user phone as sender', () => {
    const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: new Date().toISOString(), status: 'Preparing', timeRemaining: 10 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
    render(<Dashboard />);
    expect(screen.getByText(/From: Sender1 \(123-456-7890\)/)).toBeInTheDocument();
  });

    it('fetches and displays orders from localStorage matching user phone as recipient', () => {
    const orders = [
      { senderName: 'Sender1', senderPhone: '999-999-9999', recipientName: 'Recipient1', recipientPhone: '123-456-7890', createdAt: new Date().toISOString(), status: 'Preparing', timeRemaining: 10 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
    render(<Dashboard />);
    expect(screen.getByText(/To: Recipient1 \(123-456-7890\)/)).toBeInTheDocument();
  });

  it('does not display orders that do not match the user\'s phone number', () => {
    const orders = [
      { senderName: 'Sender1', senderPhone: '999-999-9999', recipientName: 'Recipient1', recipientPhone: '888-888-8888', createdAt: new Date().toISOString(), status: 'Preparing', timeRemaining: 10 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
    render(<Dashboard />);
    expect(screen.queryByText(/Sender1/)).toBeNull();
  });


  it('adds a new order when the CreateOrder component emits an event', async () => {
    render(<Dashboard />);
    const createButton = screen.getByTestId('create-order-button');
    await act(async () => {
      fireEvent.click(createButton);
    });
    expect(screen.getByText(/From: Test Sender \(123-456-7890\)/)).toBeInTheDocument();
  });

  it('removes an order when the cancel button is clicked', async () => {
    const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: new Date().toISOString(), status: 'Preparing', timeRemaining: 10 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
    render(<Dashboard />);
    const cancelButton = screen.getByText('Cancel Order');

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByText(/Sender1/)).toBeNull();
  });

  it('filters orders by status', async () => {
        const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: new Date().toISOString(), status: 'Preparing', timeRemaining: 10 },
      { senderName: 'Sender2', senderPhone: '123-456-7890', recipientName: 'Recipient2', recipientPhone: '999-999-9999', createdAt: new Date().toISOString(), status: 'Delivered', timeRemaining: 0 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
    render(<Dashboard />);

    const selectElement = screen.getByRole('combobox');

    await act(async () => {
      fireEvent.change(selectElement, { target: { value: 'preparing' } });
    });

    expect(screen.getByText(/Status: Preparing/)).toBeInTheDocument();
    expect(screen.queryByText(/Status: Delivered/)).toBeNull();

    await act(async () => {
      fireEvent.change(selectElement, { target: { value: 'delivered' } });
    });

     expect(screen.getByText(/Status: Delivered/)).toBeInTheDocument();
     expect(screen.queryByText(/Status: Preparing/)).toBeNull();

      await act(async () => {
      fireEvent.change(selectElement, { target: { value: 'all' } });
    });

    expect(screen.getByText(/Status: Preparing/)).toBeInTheDocument();
    expect(screen.getByText(/Status: Delivered/)).toBeInTheDocument();
  });

    it('updates order status to "Delivered" after timeRemaining reaches 0', async () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));
    const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: tenMinutesAgo.toISOString(), status: 'Preparing', timeRemaining: 10 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));

    render(<Dashboard />);
    jest.advanceTimersByTime(600001); // Simulate time passing beyond the 10 minute mark (10*60*1000 + 1) milliseconds

    await screen.findByText(/Status: Delivered/);
    expect(screen.getByText(/Status: Delivered/)).toBeInTheDocument();

    });

  it('displays correct time remaining', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - (5 * 60 * 1000));
      const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: fiveMinutesAgo.toISOString(), status: 'Preparing', timeRemaining: 5 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
      render(<Dashboard />);

     expect(screen.getByText(/Time Remaining: 5 minutes/)).toBeInTheDocument();

  });

   it('displays 0 time remaining when time has elapsed', () => {
        const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - (15 * 60 * 1000));
      const orders = [
      { senderName: 'Sender1', senderPhone: '123-456-7890', recipientName: 'Recipient1', recipientPhone: '999-999-9999', createdAt: fifteenMinutesAgo.toISOString(), status: 'Preparing', timeRemaining: 5 },
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
      render(<Dashboard />);

     expect(screen.getByText(/Time Remaining: 0 minutes/)).toBeInTheDocument();
  });

  it('handles edge case where localStorage is empty', () => {
    localStorage.removeItem('orders');
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('handles edge case where localStorage user is null', () => {
    localStorage.removeItem('user');
      const renderComponent = () => render(<Dashboard />);
      expect(renderComponent).toThrow();
  });

});

