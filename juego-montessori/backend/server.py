from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

# Inicializa la aplicación Flask y habilita CORS
app = Flask(__name__)
CORS(app)

# Carga el modelo de Random Forest desde el archivo .pkl
modelo_path = './model/modelo_random_forest.pkl'
model = joblib.load(modelo_path)

# Define las columnas esperadas en el modelo
COLUMNAS_MODELO = [
    'celeste1', 'celeste2', 'celeste3',
    'magenta1', 'magenta2', 'magenta3',
    'azul1', 'azul2', 'azul3',
    'amarillo1', 'amarillo2', 'amarillo3',
    'verde1', 'verde2', 'verde3',
    'rojo1', 'rojo2', 'rojo3'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Obtener los datos JSON enviados por el cliente
        datos = request.get_json()
        if not datos or "resultadosPorPregunta" not in datos:
            return jsonify({"error": "Datos inválidos"}), 400

        # Extraer los resultados y convertirlos en un DataFrame
        resultados = datos["resultadosPorPregunta"]

        # Crear un DataFrame asegurando el orden de las columnas
        df_entrada = pd.DataFrame([{col: resultados.get(col, 0) for col in COLUMNAS_MODELO}])

        # Realizar la predicción usando el modelo
        prediccion = model.predict(df_entrada)[0]  # Obtiene el resultado de la predicción

        # Verificar los colores a reforzar en base a la predicción
        etiquetas = ['celeste', 'magenta', 'azul', 'amarillo', 'verde', 'rojo']
        colores_refuerzo = [etiquetas[i] for i, valor in enumerate(prediccion) if valor == 1]

        # Retornar la predicción y los colores de refuerzo
        return jsonify({
            "refuerzo_necesario": colores_refuerzo
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
