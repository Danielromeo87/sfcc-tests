#!/usr/bin/env python3
"""
SFCC Architect Challenge - script de traducción de preguntas ES -> EN.
Usa la API de DeepL (https://www.deepl.com/pro-api).
Genera un archivo questions-en.json listo para cargarse en el quiz.

Uso:
  1. Obtén una API key gratuita en https://www.deepl.com/pro-api (plan Free: 500k caracteres/mes)
  2. export DEEPL_API_KEY="tu-api-key"
  3. python translate_questions.py
  4. Copia el archivo questions-en.json al directorio del repo
  5. Haz commit y push
"""

import os
import sys
import re
import json
import time
import urllib.request
import urllib.parse
import urllib.error

# Acepta la API key de tres formas (en orden de prioridad):
#   1. Argumento de linea de comandos: python translate_questions.py TU_API_KEY
#   2. Variable de entorno: export DEEPL_API_KEY=xxx
#   3. Fichero .deepl-key en el directorio actual
API_KEY = None
if len(sys.argv) > 1 and sys.argv[1]:
    API_KEY = sys.argv[1]
elif os.environ.get("DEEPL_API_KEY"):
    API_KEY = os.environ.get("DEEPL_API_KEY")
elif os.path.exists(".deepl-key"):
    with open(".deepl-key", "r") as f:
        API_KEY = f.read().strip()

if not API_KEY:
    raise SystemExit(
        "ERROR: no se ha encontrado la API key de DeepL.\n"
        "Usa una de estas opciones:\n"
        "  1. python translate_questions.py TU_API_KEY\n"
        "  2. set DEEPL_API_KEY=tu_key && python translate_questions.py\n"
        "  3. echo tu_key > .deepl-key && python translate_questions.py"
    )

# Limpia la key para que no tenga espacios ni saltos de linea
API_KEY = API_KEY.strip()

ENDPOINT = "https://api-free.deepl.com/v2/translate"
# Si tienes plan Pro usa: https://api.deepl.com/v2/translate

# Lista completa de preguntas extraidas de app.js (es -> en)
# Formato: (pregunta, opciones, explicacion, answer_index, difficulty)
# El script extrae esto automaticamente parseando app.js, lo unico que haces es proporcionarlo.

INPUT_FILE = "app.js"
OUTPUT_FILE = "questions-en.json"
SOURCE_LANG = "ES"
TARGET_LANG = "EN"

def translate_batch(texts, max_retries=3):
    """Llama a la API de DeepL para traducir una lista de textos."""
    if not texts:
        return []

    # DeepL ahora exige autenticacion por header (no por body).
    # Ver: https://developers.deepl.com/docs/resources/breaking-changes-change-notices/november-2025-deprecation-of-legacy-auth-methods
    params = {
        "text": texts,
        "source_lang": SOURCE_LANG,
        "target_lang": TARGET_LANG,
        # Sin tag_handling: DeepL trata el texto como plano, no XML.
        # Esto evita errores con caracteres como <, >, & que rompen el XML.
        "preserve_formatting": "1",
        "split_sentences": "1",
    }
    data = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=data, method="POST")
    # Header de autenticacion nuevo formato
    req.add_header("Authorization", f"DeepL-Auth-Key {API_KEY}")
    # User-Agent identificable
    req.add_header("User-Agent", "sfcc-quiz-translator/1.0 (Python urllib)")

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return [t["text"] for t in result["translations"]]
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8")
            except Exception:
                pass
            if e.code == 429:
                wait = 5 * (attempt + 1)
                print(f"  rate limited, esperando {wait}s...")
                time.sleep(wait)
            elif e.code == 456:
                raise SystemExit("ERROR: cuota de DeepL agotada")
            elif e.code == 403:
                raise SystemExit(
                    "ERROR 403: API key rechazada por DeepL.\n"
                    "Posibles causas:\n"
                    "  - La key es incorrecta (verifica que el sufijo sea :fx)\n"
                    "  - La key se acaba de crear y DeepL tarda 1-5 minutos en activarla\n"
                    "  - La key esta desactivada en tu panel de DeepL\n"
                    f"Detalle: {body}"
                )
            else:
                raise SystemExit(f"ERROR HTTP {e.code}: {body}")
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2)
    return []


def parse_questions_from_app_js(path):
    """Extrae las preguntas del array `blocks` en app.js."""
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    # Encuentra las lineas que usan q(...) - son strings con 5 argumentos
    # Ejemplo: q("texto", ["op1", "op2"], 0, "explicacion", 1),
    # La regex captura: el texto, las opciones (array literal), el answer, la explicacion, la difficulty (opcional).
    pattern = re.compile(
        r'q\(\s*'                              # q(
        r'"((?:[^"\\]|\\.)*)"'                  # "text"
        r'\s*,\s*'                              # ,
        r'\[((?:[^\[\]]|"[^"]*")*)\]'           # ["op1", "op2"]
        r'\s*,\s*'                              # ,
        r'(\d+)'                                 # answer (indice)
        r'\s*,\s*'                              # ,
        r'"((?:[^"\\]|\\.)*)"'                  # "explicacion"
        r'(?:\s*,\s*(\d+))?'                    # , difficulty (opcional)
        r'\s*\)',                                # )
        re.DOTALL
    )

    questions = []
    for i, m in enumerate(pattern.finditer(src), start=1):
        text = m.group(1).encode().decode('unicode_escape')
        options_str = m.group(2)
        # Parsea las opciones: "op1", "op2", ...
        opt_pattern = re.compile(r'"((?:[^"\\]|\\.)*)"')
        options = [o.encode().decode('unicode_escape') for o in opt_pattern.findall(options_str)]
        answer = int(m.group(3))
        explanation = m.group(4).encode().decode('unicode_escape')
        difficulty = int(m.group(5)) if m.group(5) else 2
        questions.append({
            "id": f"q{i}",
            "text": text,
            "options": options,
            "answer": answer,
            "explanation": explanation,
            "difficulty": difficulty
        })

    return questions


def main():
    print(f"Leyendo preguntas de {INPUT_FILE}...")
    questions = parse_questions_from_app_js(INPUT_FILE)
    print(f"Encontradas {len(questions)} preguntas.")

    # Construye la lista de textos a traducir: text + cada option + explanation por pregunta
    text_items = []
    text_index = []
    for q in questions:
        text_items.append(q["text"])
        text_index.append((q["id"], "text"))
        for j, opt in enumerate(q["options"]):
            text_items.append(opt)
            text_index.append((q["id"], f"option_{j}"))
        text_items.append(q["explanation"])
        text_index.append((q["id"], "explanation"))

    print(f"Total de textos a traducir: {len(text_items)} (text + options + explanations)")
    total_chars = sum(len(t) for t in text_items)
    print(f"Caracteres totales: {total_chars}")
    if total_chars > 480000:
        print("ADVERTENCIA: cerca del limite Free de DeepL (500k/mes)")

    # Traduce en bloques de 50 textos por peticion (limite API)
    BATCH_SIZE = 50
    translations = [None] * len(text_items)

    for batch_start in range(0, len(text_items), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(text_items))
        batch = text_items[batch_start:batch_end]
        print(f"Traduciendo lote {batch_start}-{batch_end} de {len(text_items)}...")
        translated = translate_batch(batch)
        for i, t in enumerate(translated):
            translations[batch_start + i] = t

    # Construye el resultado final
    result = {}
    for q in questions:
        qid = q["id"]
        q_translated = {
            "text": None,
            "options": [],
            "explanation": None
        }
        for i, (idx_id, field) in enumerate(text_index):
            if idx_id != qid:
                continue
            if field == "text":
                q_translated["text"] = translations[i]
            elif field.startswith("option_"):
                opt_idx = int(field.split("_")[1])
                # Asegurate de que la lista tiene el tamanyo correcto
                while len(q_translated["options"]) <= opt_idx:
                    q_translated["options"].append(None)
                q_translated["options"][opt_idx] = translations[i]
            elif field == "explanation":
                q_translated["explanation"] = translations[i]
        result[qid] = q_translated

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"OK - {len(result)} preguntas traducidas guardadas en {OUTPUT_FILE}")
    print(f"Estadisticas: {total_chars} caracteres traducidos (~{total_chars / 500000 * 100:.1f}% del limite Free)")


if __name__ == "__main__":
    main()
