# ============================================================
# ADD THIS TO YOUR app.py
# ============================================================
# This assumes:
#   - database.py already created smartbiz.db with table:
#       sales(id, product, quantity, price)
#   - ai.py has a function that talks to Gemini. Below I've
#     guessed the name `ask_gemini(question)` — CHANGE THIS
#     to match whatever function you actually wrote in ai.py.
# ============================================================

from flask import Flask, render_template, jsonify, request
import sqlite3
from ai import ask_gemini   # <-- change to your real function name in ai.py

app = Flask(__name__)
DB_NAME = "smartbiz.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # lets us return rows as dicts
    return conn


# ---------- Page route ----------
@app.route("/")
def dashboard():
    return render_template("index.html")


# ---------- Sales API ----------
@app.route("/api/sales", methods=["GET"])
def get_sales():
    conn = get_db()
    rows = conn.execute("SELECT * FROM sales ORDER BY id ASC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/sales", methods=["POST"])
def add_sale():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "INSERT INTO sales (product, quantity, price) VALUES (?, ?, ?)",
        (data["product"], data["quantity"], data["price"]),
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/sales/<int:sale_id>", methods=["DELETE"])
def delete_sale(sale_id):
    conn = get_db()
    conn.execute("DELETE FROM sales WHERE id = ?", (sale_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "deleted"})


# ---------- Assistant API (Gemini) ----------
@app.route("/api/ask", methods=["POST"])
def ask_assistant():
    data = request.get_json()
    question = data.get("question", "")

    # Give Gemini today's sales as context so it can actually answer
    conn = get_db()
    rows = conn.execute("SELECT * FROM sales").fetchall()
    conn.close()
    sales_context = [dict(r) for r in rows]

    # CHANGE THIS LINE to match your ai.py function's real signature.
    # If your function only takes a question (no context), use:
    #   answer = ask_gemini(question)
    answer = ask_gemini(question, sales_context)

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)