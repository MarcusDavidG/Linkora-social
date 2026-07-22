// Jest setup for React Native testing
import "react-native-gesture-handler/jestSetup";

// Official jest mock shipped by react-native-reanimated (kept in sync with its own API surface)
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

// Global test timeout
jest.setTimeout(10000);

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("Warning: ReactDOM.render is deprecated")) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: "ExponentPushToken[dummy]" })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  AndroidImportance: {
    MAX: 4,
  },
}));

jest.mock(
  "expo-haptics",
  () => ({
    impactAsync: jest.fn(() => Promise.resolve()),
    ImpactFeedbackStyle: {
      Light: "light",
    },
  }),
  { virtual: true }
);
