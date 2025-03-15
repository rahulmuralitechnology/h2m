# Automated Testing with Jest

This document provides instructions on setting up and running automated tests using Jest. Jest is a delightful JavaScript Testing Framework with a focus on simplicity. It works with projects using: Babel, TypeScript, Node, React, Angular, Vue and more!

## 1. Prerequisites

Before you begin, ensure you have the following prerequisites installed:

*   **Node.js**: Jest requires Node.js to run. Download and install the latest LTS version from [https://nodejs.org/](https://nodejs.org/).
*   **npm or yarn**: Node Package Manager (npm) or Yarn Package Manager is required to install Jest and its dependencies. npm comes bundled with Node.js. If you prefer Yarn, you can install it globally: `npm install -g yarn`
*   **Text Editor/IDE**:  A text editor or IDE like VS Code, Sublime Text, or Atom to write and edit code.

## 2. Setup

Follow these steps to set up your testing environment:

1.  **Initialize your project (if it's a new project):**

    Open your terminal and navigate to your project directory. If you don't have a `package.json` file, initialize one:

    bash
    npm init -y  # or yarn init -y
    

    This creates a `package.json` file in your project directory with default values. You can modify it later.

2.  **Install Jest:**

    Install Jest as a development dependency using npm or yarn:

    bash
    npm install --save-dev jest  # or yarn add --dev jest
    

    This installs Jest and adds it to the `devDependencies` section of your `package.json` file.

3.  **Create a Test File:**

    Create a file with the `.test.js` or `.spec.js` extension (e.g., `sum.test.js`) in your project directory or a dedicated `__tests__` folder.  Here's a simple example:

    javascript
    // sum.test.js
    const sum = require('./sum'); // Assuming you have a sum.js file

    test('adds 1 + 2 to equal 3', () => {
      expect(sum(1, 2)).toBe(3);
    });
    

    And the corresponding `sum.js` file:

    javascript
    // sum.js
    function sum(a, b) {
      return a + b;
    }

    module.exports = sum;
    

4.  **Configure npm scripts (optional but recommended):**

    Open your `package.json` file and add a `test` script to the `scripts` section:

    json
    {
      "name": "my-project",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "jest"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "devDependencies": {
        "jest": "^29.0.0"  //  Use your installed version
      }
    }
    

    This allows you to run tests using the `npm test` or `yarn test` command.

## 3. Running Tests

You can run your tests using one of the following methods:

*   **Using the npm/yarn script:**

    If you configured the `test` script in your `package.json` file, run the following command in your terminal:

    bash
    npm test  # or yarn test
    

*   **Directly using the Jest command:**

    Run Jest directly from the command line:

    bash
    npx jest  # or yarn jest
    

    This command executes all files with the `.test.js`, `.spec.js`, `.test.ts`, `.spec.ts`, `.test.jsx`, `.spec.jsx`, `.test.tsx`, or `.spec.tsx` extensions in your project (or based on your configuration).

*   **Running Specific Tests:**

    You can run specific tests by providing a file path or a pattern:

    bash
    npx jest sum.test.js          # Run a specific file
    npx jest 'my test suite'   # Run tests that match a pattern in the describe or test name
    npx jest --testNamePattern "adds 1 + 2" # Run tests based on the test name (case-insensitive)
    

*   **Watch Mode:**

    To automatically re-run tests whenever your code changes, use the `--watch` flag:

    bash
    npx jest --watch  # or yarn jest --watch
    

    Alternatively, use `--watchAll` to watch all files regardless of the changed files.

    bash
        npx jest --watchAll # or yarn jest --watchAll
    

## 4. Configuration

You can configure Jest using a `jest.config.js` or `jest.config.ts` file in the root of your project.  Here's an example:

javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node', // or 'jsdom' for browser-based tests
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Transpile JavaScript and TypeScript files
    '^.+\\.svg$': '<rootDir>/fileTransformer.js', // Example transformer for handling SVG files
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js' //Exclude entry point.
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],  //Configuration to setup environment. Eg. Mock fetch or localStorage etc.
  testPathIgnorePatterns: ['<rootDir>/node_modules/'], // Exclude files that should not be tested.
};


**Key Configuration Options:**

*   **`testEnvironment`**: Defines the testing environment (e.g., `node` for Node.js, `jsdom` for browser-based tests).
*   **`moduleFileExtensions`**:  Specifies the file extensions that Jest should look for when resolving modules.
*   **`transform`**: Defines how to transform files before running tests.  `babel-jest` is commonly used to transpile JavaScript and TypeScript files.
*   **`moduleNameMapper`**:  Maps module names to different files, often used to mock CSS or other non-JavaScript modules.
*   **`testMatch`**: An array of glob patterns indicating the location of your test files.
*   **`collectCoverage`**: Enable code coverage reporting.
*   **`collectCoverageFrom`**:  An array of glob patterns indicating which files to include in the code coverage report.  It's essential to exclude test files and potentially other files that are not core to your application logic.
*   **`coverageReporters`**: Defines the reporters to use for code coverage (e.g., `text`, `lcov`).
*   **`setupFilesAfterEnv`**: An array of paths to modules that run some code to configure or set up the testing environment before each test. Use this to configure test frameworks in use.
*   **`testPathIgnorePatterns`**:  An array of glob patterns that match paths to be ignored when looking for test files. By default, Jest ignores files in the `node_modules` directory.

Refer to the Jest documentation for a comprehensive list of configuration options: [https://jestjs.io/docs/configuration](https://jestjs.io/docs/configuration)

## 5. Additional Notes

*   **Use Descriptive Test Names:** Write clear and descriptive test names that explain what each test is verifying.
*   **Arrange, Act, Assert (AAA):** Follow the Arrange, Act, Assert pattern in your tests to improve readability and maintainability.
*   **Mocking:** Use Jest's built-in mocking capabilities to isolate units of code and test them in isolation.
*   **Asynchronous Testing:** Jest supports asynchronous testing using `async/await` and promises.
*   **Code Coverage:**  Use code coverage reports to identify areas of your code that are not adequately tested. Aim for high code coverage, but don't sacrifice quality for quantity.  Focus on testing critical functionality and edge cases.
*   **Keep Tests Fast:**  Slow tests can significantly slow down your development workflow. Optimize your tests to run as quickly as possible.
*   **CI/CD Integration:**  Integrate Jest into your CI/CD pipeline to automatically run tests on every commit or pull request.
*   **Error Messages:** Take the time to understand the error messages that Jest provides, often these messages help you pinpoint the problem.
*   **`beforeEach` and `afterEach`:** Use these hooks to set up and tear down test environments before and after each test.
*   **`beforeAll` and `afterAll`:** Use these hooks to perform setup and teardown actions that only need to be executed once for a test suite.
*   **Update Jest Regularly**: Keeping Jest updated ensures that you have the latest features and bug fixes.

By following these guidelines, you can effectively use Jest to automate your testing process and ensure the quality of your JavaScript code.