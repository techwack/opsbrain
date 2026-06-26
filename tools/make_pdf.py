"""Render docs/pdf.html to a print-quality PDF using the Chromium that ships with playwright."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

DOCS = Path(__file__).resolve().parent.parent / "docs"
SRC = (DOCS / "pdf.html").as_uri()
OUT = DOCS / "OpsBrain_Detailed_Document.pdf"


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page()
        await page.goto(SRC, wait_until="networkidle")
        await page.wait_for_timeout(1200)  # let fonts settle
        await page.pdf(
            path=str(OUT),
            format="Letter",
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        )
        await b.close()
        print("wrote", OUT)


asyncio.run(main())
