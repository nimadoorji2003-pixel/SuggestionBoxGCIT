import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";
import { AuthProvider } from "../../context/AuthContext";

const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthProvider>
  );
};

describe("Login page", () => {
  it("renders login heading and submit button", () => {
    renderWithProviders(<Login />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });
});
