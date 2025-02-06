import pickle
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Cargar los escaladores y modelos entrenados
with open("scalers.pkl", "rb") as f:
    scalers = pickle.load(f)

with open("kmeans_models.pkl", "rb") as f:
    kmeans_models = pickle.load(f)

# Definir etiquetas para los clusters
labels = {0: "leve", 1: "moderado", 2: "intensivo"}

# Definir umbrales de validación
umbrales = {
    1: "leve",
    2: "moderado",
    3: "intensivo"
}

@app.route('/predecir', methods=['POST'])
def predecir():
    datos = request.json  # Recibir JSON de Postman

    # Convertir JSON a DataFrame asegurando el orden de columnas
    column_order = ["celeste", "magenta", "azul", "amarillo", "verde", "rojo"]
    df_input = pd.DataFrame([datos])[column_order]

    # Diccionario de resultados
    refuerzo_modelo = {}
    refuerzo_final = {}

    for color in df_input.columns:
        errores = df_input[color][0]  # Número de errores reportados

        if errores == 0:
            refuerzo_modelo[color] = "sin refuerzo"
            refuerzo_final[color] = "sin refuerzo"
        else:
            # Escalar la columna usando el StandardScaler entrenado
            df_input[color] = scalers[color].transform(df_input[[color]])

            # Predecir usando KMeans
            cluster = kmeans_models[color].predict(df_input[[color]])[0]

            # Mapear el cluster a la etiqueta correspondiente
            refuerzo_modelo[color] = labels.get(cluster, "desconocido")

            # Validar la predicción con los umbrales definidos
            if errores in umbrales:
                refuerzo_correcto = umbrales[errores]
            else:
                refuerzo_correcto = "intensivo"  # Cualquier valor superior a 3 se asigna como intensivo

            # Si el modelo acierta con el umbral definido, se mantiene, sino se corrige
            if refuerzo_modelo[color] == refuerzo_correcto:
                refuerzo_final[color] = refuerzo_modelo[color]
            else:
                refuerzo_final[color] = refuerzo_correcto

    return jsonify({
        "refuerzo_modelo": refuerzo_modelo,
        "refuerzo_validado": refuerzo_final
    })

if __name__ == '__main__':
    app.run(debug=True)
