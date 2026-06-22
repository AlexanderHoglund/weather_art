"use client";

import { useState } from "react";

// Credits button + box. Ports credit.js's show/hide toggle to React state.

interface Credit {
  place: string;
  name: string;
  href: string;
}

const CREDITS: Credit[] = [
  { place: "Stockholm artwork", name: "Tofupixel", href: "https://www.instagram.com/TofuPixels/" },
  { place: "Washington artwork", name: "Silkanide", href: "https://www.instagram.com/silkanide/" },
  { place: "Los Angeles artwork", name: "zerow_z", href: "https://www.instagram.com/zerow_z/" },
  { place: "Kyiv artwork", name: "pyprart", href: "https://www.instagram.com/pyprart/" },
  { place: "Add art or music?", name: "contact here", href: "https://www.instagram.com/alxndrhglnd/" },
];

export function CreditsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div id="creditsButtonOverlay">
        <button id="creditButton" onClick={() => setOpen((o) => !o)}>
          Credits
        </button>
      </div>

      {open && (
        <div id="creditsBoxOverlay">
          <div id="creditsBox">
            <button id="closeCredits" onClick={() => setOpen(false)}>
              close [x]
            </button>
            <br />
            {CREDITS.map((c) => (
              <p key={c.place}>
                {c.place}:{" "}
                <a target="_blank" rel="noreferrer" href={c.href}>
                  {c.name}
                </a>
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
