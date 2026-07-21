import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";
import { createTrailResponse, createTrailWithDifficulty } from "../testUtils";
import type { TrailDifficulty } from "../types/trail";

import { TrailCard } from "./TrailCard";

describe("TrailCard", () => {
  it("renders trail summary information", () => {
    renderWithRouter(<TrailCard trail={createTrailResponse()} />);

    expect(screen.getByText("Forest Loop")).toBeInTheDocument();
    expect(screen.getByText("Wellington, Canterbury")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("8.5 km")).toBeInTheDocument();
    expect(
      screen.getByText("A sheltered forest walk with river views."),
    ).toBeInTheDocument();
    expect(screen.getByText("DOC trail")).toBeInTheDocument();
  });

  it("links to the trail detail page when details are enabled", () => {
    renderWithRouter(
      <TrailCard linkToDetails trail={createTrailResponse({ id: "trail-42" })} />,
    );

    expect(screen.getByRole("link", { name: /Forest Loop/i })).toHaveAttribute(
      "href",
      "/trails/trail-42",
    );
  });

  it("does not render as a link in static summary contexts", () => {
    renderWithRouter(<TrailCard trail={createTrailResponse()} />);

    expect(screen.queryByRole("link", { name: /Forest Loop/i })).not.toBeInTheDocument();
  });

  it("shows fallback copy when no description is available", () => {
    renderWithRouter(
      <TrailCard trail={createTrailResponse({ description: "" })} />,
    );

    expect(
      screen.getByText("No trail description available yet."),
    ).toBeInTheDocument();
  });

  it.each<TrailDifficulty>(["Easy", "Intermediate", "Advanced", "Expert"])(
    "renders the %s difficulty label",
    (difficulty) => {
      renderWithRouter(<TrailCard trail={createTrailWithDifficulty(difficulty)} />);

      expect(screen.getByText(`${difficulty} Trail`)).toBeInTheDocument();
      expect(screen.getByText(difficulty)).toBeInTheDocument();
    },
  );
});
