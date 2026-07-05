import { type ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

interface RenderWithRouterOptions {
  initialEntries?: string[];
}

function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ["/"] }: RenderWithRouterOptions = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
  );
}

export { renderWithRouter };
