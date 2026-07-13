import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { createTrailResponse, mockJsonResponse } from "../testUtils";

import { TrailDetailPage } from "./TrailDetailPage";

function renderTrailDetailPage(path = "/trails/trail-1") {
  return renderWithRoutes(
    <Routes>
      <Route path="/trails/:trailId" element={<TrailDetailPage />} />
      <Route path="/trails" element={<p>Trail list</p>} />
    </Routes>,
    path,
  );
}

function renderWithRoutes(ui: ReactElement, path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>,
  );
}

describe("TrailDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthStore();
  });

  it("loads and displays trail detail content", async () => {
    resetAuthStore({ session: createTestSession() });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(
        createTrailResponse({
          name: "Summit Route",
          difficulty: "Hard",
          distanceKm: 12.4,
          city: "Akaroa",
          region: "Canterbury",
          latitude: -43.81234,
          longitude: 172.91234,
        }),
      ),
    );

    renderTrailDetailPage("/trails/trail-99");

    expect(screen.getByText("Loading trail details")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Summit Route" })).toBeInTheDocument();
    expect(screen.getAllByText("Hard").length).toBeGreaterThan(0);
    expect(screen.getByText("12.4 km")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trail location" })).toBeInTheDocument();
    expect(screen.getAllByText("Akaroa, Canterbury").length).toBeGreaterThan(0);
    expect(screen.getByText("-43.81234, 172.91234")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Check in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Record completion" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to trails" })).toHaveAttribute(
      "href",
      "/trails",
    );
  });

  it("shows not found content for a missing trail", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "Not found" }, false, 404),
    );

    renderTrailDetailPage("/trails/missing");

    expect(await screen.findByText("Trail not found")).toBeInTheDocument();
    expect(
      screen.getByText("This trail may be unavailable or no longer active."),
    ).toBeInTheDocument();
  });

  it("shows an error message when trail detail loading fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "Unable to reach trails" }, false, 500),
    );

    renderTrailDetailPage("/trails/trail-1");

    expect(await screen.findByText("Trail unavailable")).toBeInTheDocument();
    expect(screen.getByText("Unable to reach trails")).toBeInTheDocument();
  });
});
