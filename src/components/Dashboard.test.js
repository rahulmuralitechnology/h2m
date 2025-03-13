import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import CreateOrder from './CreateOrder'; // Assuming CreateOrder is in the same directory

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the timer functions
jest.useFakeTimers();

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error messages in tests
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  const mockUser = { phone: '1234567890' };
  const mockOrders = [
    {
      senderPhone: '1234567890',
      recipientName: 'Recipient1',
      recipientPhone: '9876543210',
      status: 'Preparing',
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
      timeRemaining: 7,
      senderName: 'Sender1',
    },
    {
      senderPhone: '9876543210',
      recipientName: 'Recipient2',
      recipientPhone: '1234567890',
      status: 'Delivered',
      createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 minutes ago
      timeRemaining: -1,
      senderName: 'Sender2',
    },
    {
      senderPhone: '1112223333',
      recipientName: 'Recipient3',
      recipientPhone: '4445556666',
      status: 'Preparing',
      createdAt: new Date().toISOString(),
      timeRemaining: 10,
      senderName: 'Sender3',
    },
  ];

  it('renders without errors', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays user orders from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);
    expect(screen.getByText(/Recipient1/)).toBeInTheDocument();
    expect(screen.getByText(/Sender2/)).toBeInTheDocument();
    expect(screen.queryByText(/Sender3/)).toBeNull(); // Should not be visible as it's not related to the user
  });

  it('displays "No orders placed or received yet." when there are no orders', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument();
  });

  it('updates order status based on time remaining', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    // Simulate time passing
    act(() => {
      jest.advanceTimersByTime(60000); // Advance by 1 minute
    });

    expect(screen.getByText(/Recipient1/).textContent).toContain('Time Remaining: 6 minutes');

    act(() => {
      jest.advanceTimersByTime(7 * 60 * 1000); // Advance by 7 more minutes, total 8. Recipient1 is now Delivered
    });

    expect(screen.getByText(/Recipient1/).textContent).toContain('Status: Delivered');
    expect(screen.getByText(/Sender2/).textContent).toContain('Status: Delivered');  //This should stay delivered
  });

  it('filters orders by status', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'preparing' } });

    expect(screen.getByText(/Recipient1/)).toBeInTheDocument();
    expect(screen.queryByText(/Sender2/)).toBeNull(); // Delivered orders should not be visible
  });

  it('handles canceling an order', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    render(<Dashboard />);

    const cancelButton = screen.getAllByText('Cancel Order')[0];
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Recipient1/)).toBeNull();
    expect(localStorage.getItem('orders')).toEqual(
      JSON.stringify([
        {
          senderPhone: '9876543210',
          recipientName: 'Recipient2',
          recipientPhone: '1234567890',
          status: 'Delivered',
          createdAt: expect.any(String),
          timeRemaining: -1,
          senderName: 'Sender2',
        },
      ])
    );
  });

  it('handles order creation', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    render(<Dashboard />);

    //Mock create order component
    const mockNewOrder = {
      senderPhone: '1234567890',
      recipientName: 'New Recipient',
      recipientPhone: '0000000000',
      status: 'Preparing',
      createdAt: new Date().toISOString(),
      timeRemaining: 10,
      senderName: 'Sender1',
    };

    const { container } = render(<CreateOrder onOrderCreated={(newOrder) => {
          const createOrderComponent = container.closest('.dashboard');
          if (createOrderComponent) {
              const dashboardInstance = createOrderComponent.__reactFiber$.child.stateNode;
              if (dashboardInstance && dashboardInstance.handleOrderCreated) {
                  dashboardInstance.handleOrderCreated(newOrder);
              }
          }
      }}/>);

    const createOrderComponent = container.closest('.dashboard');

    if (createOrderComponent) {
        const dashboardInstance = createOrderComponent.__reactFiber$.child.stateNode;

        if(dashboardInstance && dashboardInstance.handleOrderCreated){
            dashboardInstance.handleOrderCreated(mockNewOrder);
        }
    }

    expect(screen.getByText(/New Recipient/)).toBeInTheDocument();
  });

  it('handles edge case where user or orders are null in localStorage', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('No orders placed or received yet.')).toBeInTheDocument(); //because there are no user orders
  });

  it('correctly sets timeRemaining to 0 when the order is older than 10 minutes', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    const oldOrder = [{
      senderPhone: '1234567890',
      recipientName: 'RecipientOld',
      recipientPhone: '9876543210',
      status: 'Preparing',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      senderName: 'Sender1',
    }];
    localStorage.setItem('orders', JSON.stringify(oldOrder));

    render(<Dashboard />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
     expect(screen.getByText(/RecipientOld/).textContent).toContain('Time Remaining: 0 minutes');
     expect(screen.getByText(/RecipientOld/).textContent).toContain('Status: Delivered');
  });
});

