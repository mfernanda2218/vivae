// vitest.setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Mock window.location
const locationMock = {
    href: '',
    pathname: '/',
    search: '',
    assign: vi.fn(),
};

Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true,
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock matchMedia
window.matchMedia = window.matchMedia || function () {
    return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    };
};

// Mock IntersectionObserver
class IntersectionObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    writable: true,
});