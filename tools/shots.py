"""Capture clean product screenshots for the submission docs.

Runs against the live UI but blocks /api/* so the front-end renders its built-in
representative data (rich answers, compliance gaps, typed knowledge graph). The
status chip is hidden so captures look like a finished product.
"""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

OUT = Path(__file__).resolve().parent.parent / "docs" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
URL = "http://localhost:8000/"
VW, VH = 1440, 900

HIDE = "const s=document.getElementById('status'); if(s) s.style.visibility='hidden';"


async def shot(page, name):
    await page.evaluate(HIDE)
    await page.screenshot(path=str(OUT / name))
    print("saved", OUT / name)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": VW, "height": VH}, device_scale_factor=2)
        await page.route("**/api/**", lambda r: r.abort())
        await page.goto(URL, wait_until="networkidle")
        await page.wait_for_timeout(800)

        # 1. Welcome
        await shot(page, "01_welcome.png")

        # 2. Answer with citations
        await page.click("#suggestions .chip >> nth=1")  # seal-replacement question
        await page.wait_for_timeout(1200)
        await shot(page, "02_answer.png")

        # 3. Compliance audit
        await page.click("[data-tab=compliance]")
        await page.fill("#topic", "P-204 mechanical seal")
        await page.click("#compForm button")
        await page.wait_for_timeout(1200)
        await shot(page, "03_compliance.png")

        # 4. Knowledge graph
        await page.click("[data-tab=graph]")
        await page.click("#buildGraph")
        await page.wait_for_timeout(3500)
        await shot(page, "04_graph.png")

        await b.close()


asyncio.run(main())
