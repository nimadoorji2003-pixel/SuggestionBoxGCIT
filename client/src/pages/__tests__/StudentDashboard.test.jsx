import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "../StudentDashboard";
import { AuthProvider } from "../../context/AuthContext";

describe("Student Dashboard", () => {
  it("shows student dashboard heading", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <StudentDashboard />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(
      screen.getByRole("heading", { name: /student dashboard/i })
    ).toBeInTheDocument();
  });
});
