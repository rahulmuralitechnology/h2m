# Automated Tests with Jest

This document provides a guide on setting up and running automated tests using Jest. Jest is a delightful JavaScript Testing Framework with a focus on simplicity. It works with projects using: Babel, TypeScript, Node, React, Angular, Vue and more!

## 1. Prerequisites

Before you begin, ensure you have the following prerequisites installed:

*   **Node.js:** (version 14 or higher recommended). You can download it from [https://nodejs.org/](https://nodejs.org/).
*   **npm or Yarn:** (npm is included with Node.js). Yarn can be installed via npm: `npm install -g yarn`.
*   **A code editor:** (e.g., VS Code, Sublime Text, Atom)
*   **Basic JavaScript/TypeScript knowledge:** Familiarity with the JavaScript/TypeScript language is essential for writing tests.

## 2. Setup

Follow these steps to set up your testing environment:

1.  **Initialize a Node.js Project (if you haven't already):**

    If you're starting from scratch, create a new directory for your project and initialize a `package.json` file:

    bash
    mkdir my-project
    cd my-project
    npm init -y # or yarn init -y
    

2.  **Install Jest:**

    Install Jest and its type definitions as a development dependency:

    bash
    npm install --save-dev jest @types/jest
    # or using Yarn:
    yarn add --dev jest @types/jest
    

    *   `jest`: Installs the Jest testing framework.
    *   `@types/jest`: Provides TypeScript type definitions for Jest (optional, but recommended if using TypeScript).

3.  **Create a Test Directory (optional, but recommended):**

    Create a directory to store your test files (e.g., `__tests__`, `test`).  This helps organize your project.

    bash
    mkdir __tests__
    # or
    mkdir test
    

4.  **Create Your First Test File:**

    Create a test file (e.g., `sum.test.js` inside the `__tests__` directory).  A common naming convention is to use the `.test.js` or `.spec.js` suffix for test files.

    javascript
    // __tests__/sum.test.js
    const sum = require('../sum'); // Assuming your source file is sum.js in the parent directory

    test('adds 1 + 2 to equal 3', () => {
      expect(sum(1, 2)).toBe(3);
    });
    

    Or, in TypeScript:

    typescript
    // __tests__/sum.test.ts
    import sum from '../sum'; // Assuming your source file is sum.ts in the parent directory

    test('adds 1 + 2 to equal 3', () => {
      expect(sum(1, 2)).toBe(3);
    });
    

5.  **Create Your Source File (if you haven't already):**

    Create the `sum.js` or `sum.ts` file that the test imports:

    javascript
    // sum.js
    function sum(a, b) {
      return a + b;
    }

    module.exports = sum;
    

    Or, in TypeScript:

    typescript
    // sum.ts
    function sum(a: number, b: number): number {
      return a + b;
    }

    export default sum;
    

6.  **Configure `package.json`:**

    Add a `test` script to your `package.json` file to run Jest. This is crucial for easily executing your tests.

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
        "jest": "^29.0.0", // Replace with your installed version
        "@types/jest": "^29.0.0" // Replace with your installed version (if using TypeScript)
      }
    }
    

## 3. Running Tests

To run your tests, use the following command in your terminal:

bash
npm test  # or yarn test


This command will execute the Jest test runner, which will find and run all files with the `.test.js`, `.spec.js`, `.test.ts`, or `.spec.ts` extensions (depending on your configuration) in your project.

Jest provides a comprehensive output including:

*   **Test results:**  Indicates whether each test passed or failed.
*   **Error messages:**  Displays detailed error messages for failed tests.
*   **Code coverage:**  (Optional, requires configuration) Shows how much of your code is covered by tests.

## 4. Configuration

Jest can be configured using a `jest.config.js` or `jest.config.ts` file in the root of your project.  This file allows you to customize Jest's behavior.

1.  **Create `jest.config.js` or `jest.config.ts`:**

    Create a file named `jest.config.js` (JavaScript) or `jest.config.ts` (TypeScript) in the root directory of your project.

2.  **Configure Jest:**

    Here are some common configuration options:

    *   **`testMatch`:**  Specifies the patterns Jest uses to find test files.
    *   **`moduleNameMapper`:**  Maps module names to different paths, useful for resolving imports or mocking modules.
    *   **`transform`:**  Specifies how to transform files before running tests (e.g., using Babel for ES6+ or TypeScript).
    *   **`coverageDirectory`:** Specifies where to store the code coverage reports.
    *   **`testEnvironment`:**  Specifies the test environment (e.g., 'node', 'jsdom').
    *   **`setupFilesAfterEnv`:** Allows you to run setup code after the test framework has been installed. This is useful for adding custom matchers, mocking global objects, etc.

    **Example `jest.config.js`:**

    javascript
    // jest.config.js
    /** @type {import('jest').Config} */
    const config = {
      verbose: true,
      testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1" // Example:  Map "@/components/MyComponent" to "<rootDir>/src/components/MyComponent"
      },
      transform: {
        "^.+\\.jsx?$": "babel-jest", // For Babel
        "^.+\\.tsx?$": "ts-jest"    // For TypeScript
      },
      coverageDirectory: "coverage",
      testEnvironment: "node", // Or "jsdom" for browser-based tests
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"] // Optional setup file
    };

    module.exports = config;
    

    **Example `jest.config.ts`:**

    typescript
    // jest.config.ts
    import type { Config } from 'jest';

    const config: Config = {
      verbose: true,
      testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)"
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
      },
      transform: {
        "^.+\\.jsx?$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest"
      },
      coverageDirectory: "coverage",
      testEnvironment: "node", // Or "jsdom" for browser-based tests
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"] // Optional setup file
    };

    export default config;
    

    **Install necessary transformers (if using Babel or TypeScript):**

    If you are using Babel or TypeScript, you will need to install the appropriate transformers:

    bash
    npm install --save-dev babel-jest @babel/core @babel/preset-env ts-jest typescript
    # or using Yarn:
    yarn add --dev babel-jest @babel/core @babel/preset-env ts-jest typescript
    

    *   `babel-jest`: For transforming JavaScript code with Babel.
    *   `@babel/core`: Core Babel functionality.
    *   `@babel/preset-env`: A Babel preset that configures Babel to only transform the features needed for the target environments.
    *   `ts-jest`: For transforming TypeScript code.
    *   `typescript`: The TypeScript compiler.

    You'll also need a Babel configuration file (e.g., `.babelrc` or `babel.config.js`):

    javascript
    // babel.config.js
    module.exports = {
      presets: ['@babel/preset-env'],
    };
    

## 5. Additional Notes

*   **Watch Mode:** Run Jest in watch mode to automatically re-run tests when files change: `npm test -- --watchAll` or `yarn test --watchAll`.  The double dash `--` separates the npm script arguments from the Jest arguments.
*   **Code Coverage:** Enable code coverage to track how much of your code is being tested: `npm test -- --coverage` or `yarn test --coverage`.  You can configure the coverage thresholds in `jest.config.js`.
*   **Debugging Tests:**  You can debug Jest tests using your IDE's debugger. Configure your IDE to run Jest in debug mode. Consult your IDE's documentation for specific instructions.  Typically, this involves setting breakpoints in your test files and launching Jest with a debug flag (often `--debug` or `--inspect`).
*   **Asynchronous Tests:**  Use `async/await` or `Promise` to handle asynchronous tests. Ensure your test function is marked `async` and `await` any asynchronous operations before making assertions.
*   **Mocking Modules:** Use `jest.mock()` to mock modules for testing purposes. This allows you to isolate your tests and control the behavior of external dependencies.
*   **Read the Jest Documentation:** The official Jest documentation is a valuable resource: [https://jestjs.io/](https://jestjs.io/)

By following these steps, you can effectively set up and run automated tests using Jest, ensuring the quality and reliability of your code.