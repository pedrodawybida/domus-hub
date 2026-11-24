#!/usr/bin/env python3
"""Build a compact local snapshot from the official IBGE 2022 Census aggregates."""

import csv
import io
import json
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/data/ibge-censo-2022.mock.json"
BASE = "https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios"
SOURCES = {
    "municipalities": f"{BASE}/Agregados_por_Municipio_csv/Agregados_por_municipios_basico_BR_20260520.zip",
    "neighborhoods": f"{BASE}/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip",
}


def parse_number(value, *, integer=False):
    if value is None:
        return None
    value = value.strip()
    if not value or value == ".":
        return None
    number = float(value.replace(".", "").replace(",", ".")) if "," in value else float(value)
    return int(number) if integer else number


def read_csv_from_zip(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Domus-IBGE-Mock-Builder/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    csv_names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
    if len(csv_names) != 1:
        raise RuntimeError(f"Expected one CSV in {url}, found {csv_names}")
    with archive.open(csv_names[0]) as raw:
        text = io.TextIOWrapper(raw, encoding="latin1", newline="")
        return list(csv.DictReader(text, delimiter=";"))


def aggregate_row(row, level):
    municipality_code = row["CD_MUN"]
    area_km2 = parse_number(row.get("AREA_KM2"))
    population = parse_number(row.get("v0001"), integer=True)
    return {
        "code": row["CD_MUN"] if level == "municipality" else row["CD_BAIRRO"],
        "level": level,
        "name": row["NM_MUN"] if level == "municipality" else row["NM_BAIRRO"],
        "municipalityCode": municipality_code,
        "municipality": row["NM_MUN"],
        "stateCode": row["CD_UF"],
        "state": row["NM_UF"],
        "region": row["NM_REGIAO"],
        "areaKm2": area_km2,
        "population": population,
        "populationDensityPerKm2": round(population / area_km2, 1) if population is not None and area_km2 else None,
        "totalHousingUnits": parse_number(row.get("v0002"), integer=True),
        "privateHousingUnits": parse_number(row.get("v0003"), integer=True),
        "collectiveHousingUnits": parse_number(row.get("v0004"), integer=True),
        "averageResidentsPerOccupiedPrivateUnit": parse_number(row.get("v0005")),
        "occupiedPrivateHousingUnits": parse_number(row.get("v0007"), integer=True),
        "occasionalUseHousingUnits": parse_number(row.get("v0008"), integer=True),
        "vacantPrivateHousingUnits": parse_number(row.get("v0009"), integer=True),
        "referenceYear": 2022,
    }


def main():
    municipalities = [aggregate_row(row, "municipality") for row in read_csv_from_zip(SOURCES["municipalities"])]
    neighborhoods = [
        aggregate_row(row, "neighborhood")
        for row in read_csv_from_zip(SOURCES["neighborhoods"])
        if row.get("CD_BAIRRO") not in (None, "", ".") and row.get("NM_BAIRRO") not in (None, "", ".")
    ]

    if len(municipalities) < 5_000 or len(neighborhoods) < 10_000:
        raise RuntimeError(f"Unexpected coverage: {len(municipalities)} municipalities, {len(neighborhoods)} neighborhoods")
    if len({row["code"] for row in municipalities}) != len(municipalities):
        raise RuntimeError("Duplicate municipality codes in IBGE source")
    neighborhoods_by_code = {}
    for row in neighborhoods:
        neighborhoods_by_code[row["code"]] = row
    neighborhoods = list(neighborhoods_by_code.values())

    payload = {
        "metadata": {
            "source": "Instituto Brasileiro de Geografia e Estatística (IBGE)",
            "dataset": "Censo Demográfico 2022 — Agregados por municípios e bairros, resultados do universo",
            "referenceYear": 2022,
            "sourceFilesLastUpdated": "2026-05-20",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "mockDatabase": True,
            "measurements": {
                "population": "V0001 — Total de pessoas",
                "totalHousingUnits": "V0002 — Total de domicílios",
                "privateHousingUnits": "V0003 — Total de domicílios particulares",
                "collectiveHousingUnits": "V0004 — Total de domicílios coletivos",
                "averageResidentsPerOccupiedPrivateUnit": "V0005 — Média de moradores em domicílios particulares ocupados",
                "occupiedPrivateHousingUnits": "V0007 — Total de domicílios particulares ocupados",
                "occasionalUseHousingUnits": "V0008 — Domicílios particulares de uso ocasional",
                "vacantPrivateHousingUnits": "V0009 — Domicílios particulares permanentes vagos",
                "populationDensityPerKm2": "Cálculo local: V0001 dividido por AREA_KM2; arredondado para uma casa decimal",
            },
            "sourceFiles": SOURCES,
            "coverage": {
                "municipalities": len(municipalities),
                "neighborhoods": len(neighborhoods),
                "municipalitiesWithPublishedNeighborhoodRows": len({row["municipalityCode"] for row in neighborhoods}),
            },
            "limitations": [
                "O Censo 2022 descreve população e domicílios; não fornece preço de venda, preço por m² nem valorização imobiliária.",
                "Dados por bairro existem somente nas localidades agregadas e publicadas pelo IBGE; quando não houver bairro publicado, usar o nível municipal.",
                "Indicadores censitários são do ano de referência 2022 e não devem ser apresentados como valores atuais de mercado.",
            ],
        },
        "municipalities": municipalities,
        "neighborhoods": neighborhoods,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}: {len(municipalities)} municipalities, {len(neighborhoods)} neighborhoods")


if __name__ == "__main__":
    main()
