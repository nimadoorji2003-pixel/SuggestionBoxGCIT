// client/src/pages/__tests__/Register.test.jsx
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// 🔹 Mock the AuthContext so useAuth() doesn't return null
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(), // fake login function
  }),
}));

import Register from "../Register";

describe("Register page", () => {
  test("renders registration form", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Match your actual placeholders & button text
    expect(
      screen.getByPlaceholderText(/thinley yeshi/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/you@college.edu/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/••••••••/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });
});
