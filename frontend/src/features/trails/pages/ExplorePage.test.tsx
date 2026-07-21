import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";
import {
  createTrailResponse,
  createTrailsResponse,
  createTrailWithDifficulty,
  mockJsonResponse,
} from "../testUtils";

import { ExplorePage } from "./ExplorePage";

describe("ExplorePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays trail map results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(
        createTrailsResponse([
          createTrailResponse(),
          createTrailResponse({
            id: "trail-2",
            docId: "doc-trail-2",
            name: "Harbour Track",
            city: "Nelson",
            difficulty: "Intermediate",
          }),
        ]),
      ),
    );

    renderWithRouter(<ExplorePage />);

    expect(screen.getByText("Loading trail map")).toBeInTheDocument();
    expect((await screen.findAllByText("Forest Loop")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Harbour Track").length).toBeGreaterThan(0);
    expect(
      screen.getByText((_, element) => element?.textContent === "2 trails available"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 markers")).toBeInTheDocument();
  });

  it("submits trimmed search text to the trail API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        await mockJsonResponse(createTrailsResponse([createTrailResponse()])),
      );

    renderWithRouter(<ExplorePage />);

    expect((await screen.findAllByText("Forest Loop")).length).toBeGreaterThan(0);
    await user.type(
      screen.getByLabelText("Search trails"),
      "  forest loop  ",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/trails?search=forest+loop&pageNumber=1&pageSize=12",
        expect.any(Object),
      );
    });
    expect(screen.getByText("Search", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("forest loop")).toBeInTheDocument();
  });

  it("filters by difficulty and allows filters to be cleared", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        await mockJsonResponse(
          createTrailsResponse([createTrailWithDifficulty("Advanced")]),
        ),
      );

    renderWithRouter(<ExplorePage />);

    expect((await screen.findAllByText("Advanced Trail")).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Advanced" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/trails?difficulty=Advanced&pageNumber=1&pageSize=12",
        expect.any(Object),
      );
    });
    expect(screen.getByText("Difficulty")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/trails?pageNumber=1&pageSize=12",
        expect.any(Object),
      );
    });
  });

  it("shows an empty state for no matching trails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(createTrailsResponse([])),
    );

    renderWithRouter(<ExplorePage />);

    expect(await screen.findByText("No trails found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Trails will appear here after synchronisation brings active DOC trail data into the app.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an API error when the trail map cannot load", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "DOC trail service unavailable" }, false, 503),
    );

    renderWithRouter(<ExplorePage />);

    expect(await screen.findByText("Map unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("DOC trail service unavailable"),
    ).toBeInTheDocument();
  });
});
