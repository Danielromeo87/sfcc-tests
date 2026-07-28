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
    # IMPORTANTE: urllib.parse.urlencode() no soporta listas repetidas como "text=a&text=b&text=c".
    # Lo que hace es serializar la lista como un solo string "[a,b,c]" que DeepL interpreta como un
    # unico texto. Por eso tenemos que construir el body manualmente.
    def build_body(params, text_list):
        """Construye el body de la peticion a DeepL.
        NOTA: urllib.parse.urlencode() con listas las serializa como string JSON, lo que
        DeepL interpreta como un solo texto. Por eso construimos el body manualmente
        para repetir el parametro text= por cada elemento.
        """
        parts = []
        # Primero todos los parametros simples (sin text)
        for key, value in params.items():
            parts.append((key, value))
        # Despues el parametro text repetido por cada elemento
        for t in text_list:
            parts.append(("text", t))
        # urlencode cada parte y unir con &
        encoded_parts = [urllib.parse.urlencode({k: v}) for k, v in parts]
        return "&".join(encoded_parts).encode("utf-8")

    params = {
        "source_lang": SOURCE_LANG,
        "target_lang": TARGET_LANG,
        # Sin tag_handling: DeepL trata el texto como plano, no XML.
        "preserve_formatting": "1",
        "split_sentences": "1",
    }
    data = build_body(params, texts)
    req = urllib.request.Request(ENDPOINT, data=data, method="POST")
    # Header de autenticacion nuevo formato
    req.add_header("Authorization", f"DeepL-Auth-Key {API_KEY}")
    # User-Agent identificable
    req.add_header("User-Agent", "sfcc-quiz-translator/1.0 (Python urllib)")

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
                result = json.loads(raw)
                # Diagnostico: verificar la estructura de la respuesta
                if "translations" not in result:
                    raise SystemExit(
                        f"ERROR: respuesta de DeepL sin clave 'translations'.\n"
                        f"Respuesta: {raw[:500]}"
                    )
                translations = result["translations"]
                # Validar que sea una lista
                if not isinstance(translations, list):
                    raise SystemExit(
                        f"ERROR: 'translations' no es una lista, es {type(translations).__name__}.\n"
                        f"Valor: {str(translations)[:500]}"
                    )
                # Validar que tenga la longitud esperada (o un mensaje claro)
                if len(translations) != len(texts):
                    # Si difiere por mas de 1, probablemente hay un error grave
                    if abs(len(translations) - len(texts)) > 1:
                        raise SystemExit(
                            f"ERROR: DeepL devolvio {len(translations)} traducciones pero se esperaban {len(texts)}.\n"
                            f"Primera respuesta: {translations[0] if translations else 'vacio'}"
                        )
                # Verificar que cada traduccion tenga la clave 'text'
                for i, t in enumerate(translations):
                    if not isinstance(t, dict) or 'text' not in t:
                        raise SystemExit(
                            f"ERROR: traduccion {i} no tiene clave 'text': {t}"
                        )
                return [t["text"] for t in translations]
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
    """Extrae las preguntas del array `blocks` en app.js.
    Parser robusto que maneja correctamente strings con comillas escapadas, comas internas y multiples lineas.
    """
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    # Estrategia: extraer cada llamada q(...) completa equilibrando parentesis.
    # Primero localizamos cada "q(" y luego buscamos el ")" correspondiente.
    questions = []
    qid = 0
    pos = 0
    while True:
        # Busca la siguiente ocurrencia de "q("
        idx = src.find("q(", pos)
        if idx == -1:
            break
        # Excluir la declaracion de la funcion: "function q("
        # Antes de idx debe estar "function " sin nada alfanumerico entre medias
        before_idx = src.rfind('function', max(0, idx - 30), idx)
        if before_idx != -1:
            between = src[before_idx + 8:idx]
            # Si entre 'function' y 'q(' solo hay espacios/saltos, es la declaracion
            if between.strip() == '':
                pos = idx + 2
                continue
        # Verifica que sea un call real (no parte de otra palabra)
        if idx > 0 and src[idx - 1].isalnum():
            pos = idx + 2
            continue

        # Busca el ")" correspondiente equilibrando parentesis
        depth = 1
        i = idx + 2
        in_string = False
        string_char = None
        while i < len(src) and depth > 0:
            c = src[i]
            if in_string:
                if c == '\\':
                    i += 2
                    continue
                if c == string_char:
                    in_string = False
            else:
                if c == '"' or c == "'":
                    in_string = True
                    string_char = c
                elif c == '(':
                    depth += 1
                elif c == ')':
                    depth -= 1
                    if depth == 0:
                        break
            i += 1

        if depth != 0:
            break

        # Extrae el contenido entre q( y el ) final
        args_str = src[idx + 2 : i]
        qid += 1

        # Parsea los argumentos respetando strings con comas y escapes.
        # Formato esperado: "text", ["op1", "op2"], answer, "explanation", difficulty
        args = parse_q_args(args_str)
        if len(args) < 4:
            pos = i + 1
            continue

        text = args[0]
        options = args[1] if isinstance(args[1], list) else []
        try:
            answer = int(args[2])
        except (ValueError, TypeError):
            pos = i + 1
            continue
        explanation = args[3] if len(args) > 3 else ""
        try:
            difficulty = int(args[4]) if len(args) > 4 else 2
        except (ValueError, TypeError):
            difficulty = 2

        questions.append({
            "id": f"q{qid}",
            "text": text,
            "options": options,
            "answer": answer,
            "explanation": explanation,
            "difficulty": difficulty
        })
        pos = i + 1

    return questions


def parse_q_args(s):
    """Parsea los argumentos de una llamada q(text, options, answer, explanation, difficulty).
    Devuelve una lista con los valores ya desescapados.
    """
    args = []
    s = s.strip()
    i = 0
    while i < len(s):
        # Salta espacios y comas
        while i < len(s) and s[i] in ' \t\n,':
            i += 1
        if i >= len(s):
            break

        # Lee un valor segun el tipo
        c = s[i]
        if c == '"' or c == "'":
            # String literal
            quote = c
            j = i + 1
            result = []
            while j < len(s):
                if s[j] == '\\':
                    # Escape sequence
                    if j + 1 < len(s):
                        esc = s[j + 1]
                        if esc == 'n':
                            result.append('\n')
                        elif esc == 't':
                            result.append('\t')
                        elif esc == 'r':
                            result.append('\r')
                        elif esc == '\\':
                            result.append('\\')
                        elif esc == "'":
                            result.append("'")
                        elif esc == '"':
                            result.append('"')
                        elif esc == ',':
                            result.append(',')
                        else:
                            result.append(esc)
                        j += 2
                    else:
                        result.append(s[j])
                        j += 1
                elif s[j] == quote:
                    j += 1
                    break
                else:
                    result.append(s[j])
                    j += 1
            args.append(''.join(result))
            i = j
        elif c == '[':
            # Array literal
            depth = 1
            j = i + 1
            while j < len(s) and depth > 0:
                if s[j] == '[':
                    depth += 1
                elif s[j] == ']':
                    depth -= 1
                j += 1
            array_str = s[i + 1 : j - 1]
            # Parsea el array: "op1", "op2", ...
            array_args = parse_q_args(array_str)
            args.append(array_args)
            i = j
        elif c.isdigit() or (c == '-' and i + 1 < len(s) and s[i + 1].isdigit()):
            # Numero
            j = i
            if c == '-':
                j += 1
            while j < len(s) and (s[j].isdigit() or s[j] == '.'):
                j += 1
            args.append(s[i:j])
            i = j
        else:
            # Caracter inesperado, saltar
            i += 1

    return args


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
    # Estrategia: agrupar las traducciones por pregunta usando text_index.
    # Como text_index tiene (id, field) en el mismo orden que text_items,
    # podemos usar un contador para saber que translations[i] corresponde a text_index[i].
    result = {}
    translation_idx = 0  # contador sincronizado con text_items

    for q in questions:
        qid = q["id"]
        # Saltar entradas que no correspondan a esta pregunta
        while translation_idx < len(text_index) and text_index[translation_idx][0] != qid:
            translation_idx += 1

        # Extraer traducciones para esta pregunta en orden: text, options..., explanation
        # 1. text
        q_translated = {
            "text": translations[translation_idx] if translation_idx < len(translations) else None,
            "options": [],
            "explanation": None
        }
        translation_idx += 1

        # 2. options
        for j in range(len(q["options"])):
            if translation_idx < len(translations):
                q_translated["options"].append(translations[translation_idx])
                translation_idx += 1
            else:
                q_translated["options"].append(None)

        # 3. explanation
        if translation_idx < len(translations):
            q_translated["explanation"] = translations[translation_idx]
            translation_idx += 1

        result[qid] = q_translated

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"OK - {len(result)} preguntas traducidas guardadas en {OUTPUT_FILE}")
    print(f"Estadisticas: {total_chars} caracteres traducidos (~{total_chars / 500000 * 100:.1f}% del limite Free)")


if __name__ == "__main__":
    main()
