import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Cargar los escaladores y modelos entrenados
with open("./model/scalers.pkl", "rb") as f:
    scalers = pickle.load(f)

with open("./model/kmeans_models.pkl", "rb") as f:
    kmeans_models = pickle.load(f)

# Definir etiquetas para los clusters
labels = {0: "leve", 1: "moderado", 2: "intensivo"}

# Definir umbrales de validación
umbrales = {
    1: "leve",
    2: "moderado",
    3: "intensivo"
}

# Columnas esperadas de entrada
COLUMNAS_ENTRADA = ["celeste", "magenta", "azul", "amarillo", "verde", "rojo"]

@app.route('/predecir', methods=['POST'])
def predecir():
    try:
        # Obtener los datos JSON enviados por el cliente
        datos = request.json
        print("Datos recibidos:", datos)

        # Verificar si los datos tienen las claves necesarias
        if not all(color in datos for color in COLUMNAS_ENTRADA):
            return jsonify({"error": "Faltan claves necesarias en los datos enviados"}), 400

        # Crear un DataFrame con los datos asegurando el orden de las columnas
        df_input = pd.DataFrame([datos])[COLUMNAS_ENTRADA]

        # Diccionarios de resultados
        refuerzo_modelo = {}
        refuerzo_final = {}

        # Procesar los datos para cada color
        for color in COLUMNAS_ENTRADA:
            errores = df_input[color][0]  # Número de errores reportados para el color actual

            if errores == 0:
                refuerzo_modelo[color] = "sin refuerzo"
                refuerzo_final[color] = "sin refuerzo"
            else:
                # Escalar los errores usando el StandardScaler entrenado
                escalado = scalers[color].transform([[errores]])

                # Predecir usando KMeans
                cluster = kmeans_models[color].predict(escalado)[0]

                # Mapear el cluster a la etiqueta correspondiente
                refuerzo_modelo[color] = labels.get(cluster, "desconocido")

                # Determinar el refuerzo correcto usando los umbrales
                refuerzo_correcto = umbrales.get(errores, "intensivo")

                # Verificar si la predicción es correcta
                if refuerzo_modelo[color] == refuerzo_correcto:
                    refuerzo_final[color] = refuerzo_modelo[color]
                else:
                    refuerzo_final[color] = refuerzo_correcto

        # Devolver los resultados
        return jsonify({
            "refuerzo_modelo": refuerzo_modelo,
            "refuerzo_validado": refuerzo_final
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
