#!/usr/bin/env python3
"""Preenche lacunas com proxy municipal explicitamente marcado como estimado."""
import csv
from pathlib import Path

path = Path("entregaveis/base_imobiliaria_curitiba_rmc.csv")
with path.open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f, delimiter=";"))

for row in rows:
    row.setdefault("metodo", "")
    row.setdefault("nivel_confianca", "")
    row.setdefault("observacoes", "")

for row in rows:
    if row["status_cobertura"] != "LACUNA":
        continue
    # Proxy público disponível para o município. A ausência de índice local
    # impede atribuir um valor observado ao bairro/distrito.
    if row["municipio"] == "Curitiba":
        row["preco_medio_anunciado_brl_m2"] = "11716"
        row["fonte_preco"] = "https://www.fipe.org.br/pt-br/indices/fipezap/"
        row["metodo"] = "Proxy da média municipal FipeZAP, sem índice local"
        row["status_cobertura"] = "ESTIMADO"
        row["nivel_confianca"] = "BAIXO"
        row["observacoes"] = "Estimativa municipal. Não é preço observado do bairro."
    elif row["municipio"] == "São José dos Pinhais":
        row["preco_medio_anunciado_brl_m2"] = "6457"
        row["fonte_preco"] = "https://www.fipe.org.br/pt-br/indices/fipezap/"
        row["metodo"] = "Proxy da média municipal FipeZAP, sem índice local"
        row["status_cobertura"] = "ESTIMADO"
        row["nivel_confianca"] = "BAIXO"
        row["observacoes"] = "Estimativa municipal. Não é preço observado do bairro."
    else:
        row["preco_medio_anunciado_brl_m2"] = "6457"
        row["fonte_preco"] = "https://www.fipe.org.br/pt-br/indices/fipezap/"
        row["metodo"] = "Proxy RMC baseado em São José dos Pinhais FipeZAP, sem índice local"
        row["status_cobertura"] = "ESTIMADO"
        row["nivel_confianca"] = "BAIXO"
        row["observacoes"] = "Estimativa regional. Não é preço observado do bairro ou distrito."

with path.open("w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys(), delimiter=";")
    writer.writeheader()
    writer.writerows(rows)

print("linhas atualizadas", sum(r["status_cobertura"] == "ESTIMADO" for r in rows))
