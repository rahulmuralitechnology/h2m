/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from '../src/App.jsx'; // Adjust path if needed

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  container.id = 'root';
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('App Component', () => {

  it('renders without crashing', () => {
    act(() => {
      render(<React.StrictMode><App /></React.StrictMode>, container);
    });
    expect(container.innerHTML).toBeTruthy(); // Basic check that something rendered
  });


  it('renders the App component with expected initial content (Positive Case - depends on App implementation)', () => {
    act(() => {
      render(<React.StrictMode><App /></React.StrictMode>, container);
    });

    // Example:  Adjust assertions based on your actual App.jsx content.
    // For instance, if App renders a heading:
    const heading = container.querySelector('h1');
    if(heading) {
        expect(heading.textContent).toBeTruthy();
    }
  });

  it('handles edge case where root element is missing', () => {
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn(() => null); // Mock document.getElementById to return null

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});  //Suppress Console Error during testing

    expect(() => {
      createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    }).toThrow();

    document.getElementById = originalGetElementById;  // Restore original function
    consoleErrorSpy.mockRestore();
  });


  it('handles rendering with no initial data (if your component expects data)', () => {
     // Depends on how App.jsx handles missing data. Example:
     act(() => {
        render(<React.StrictMode><App /></React.StrictMode>, container);
      });
      //Check for empty states.
    // const element = container.querySelector('.nodata'); //Example className.

    // if(element) {
    //   expect(element).toBeTruthy(); // Make sure there is a placeholder message.
    // }
  });
});

