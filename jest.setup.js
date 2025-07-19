// Jest setup file
process.env.NODE_ENV = 'test';

// Polyfill for TextEncoder (needed for some dependencies)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Increase timeout for async operations
jest.setTimeout(10000); 