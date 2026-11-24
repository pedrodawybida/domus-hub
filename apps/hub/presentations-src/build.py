"""Gera output/Domus_Investimentos.html a partir de src/template.html (logo e pilares vêm do SVG da marca)."""
import re, base64, pathlib

project_root = pathlib.Path(__file__).resolve().parent.parent
root = pathlib.Path(__file__).resolve().parent
output = project_root / "dist-vercel/slides"
output.mkdir(parents=True, exist_ok=True)
svg = (root / "ref/DOMUS_svg/LogoDomusColor_HEX-283970.svg").read_text(encoding="utf-8")
ds = re.findall(r'<path[^>]*?\sd="([^"]+)"', svg)
assert len(ds) == 7, len(ds)
logo = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()

html = (root / "src/template.html").read_text(encoding="utf-8").replace("@@LOGO@@", logo)
for i, d in enumerate(ds, 1):
    html = html.replace(f"@@D{i}@@", d)
for token, filename in {
    "@@BARLOW_REGULAR@@": "BarlowCondensed-Regular.ttf",
    "@@BARLOW_MEDIUM@@": "BarlowCondensed-Medium.ttf",
    "@@BARLOW_SEMIBOLD@@": "BarlowCondensed-SemiBold.ttf",
    "@@BARLOW_BOLD@@": "BarlowCondensed-Bold.ttf",
}.items():
    font = (root / "src/fonts" / filename).read_bytes()
    html = html.replace(token, base64.b64encode(font).decode("ascii"))
(output / "Domus_Investimentos.html").write_text(html, encoding="utf-8")
print("ok", len(html))
