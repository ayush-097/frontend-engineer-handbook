# Lab: Mock Strategies

Master mocking APIs, modules, and timers.

## Tasks

### 1. Mock API with MSW
```tsx
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("loads users from API", async () => {
  render(<UserList />);
  expect(await screen.findByText("Alice")).toBeInTheDocument();
});
```

### 2. Mock Module Dependencies
Mock localStorage, fetch, navigation:
```tsx
const mockPush = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockPush,
}));
```

### 3. Mock Timers
Test debounce, throttle, setTimeout:
```tsx
vi.useFakeTimers();
// ... trigger action
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

**Time:** 3-4 hours  
**Deliverable:** Component tests with all three mock strategies
