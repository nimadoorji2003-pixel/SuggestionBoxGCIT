// client/src/components/__tests__/FeedbackForm.test.jsx
import { render, screen } from "@testing-library/react";
import FeedbackForm from "../FeedbackForm";

describe("FeedbackForm", () => {
  test("renders textarea and submit button", () => {
    render(<FeedbackForm onSubmitted={() => {}} />);

    // ✔ matches your real placeholder
    expect(
      screen.getByPlaceholderText(/share your suggestion/i)
    ).toBeInTheDocument();

    // ✔ matches real button text: "Send feedback"
    expect(
      screen.getByRole("button", { name: /send feedback/i })
    ).toBeInTheDocument();
  });
});
