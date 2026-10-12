#!/bin/bash
# Script para generar keystore de firma para Examen de Conciencia
# Ejecutar en tu máquina (requiere Java/JDK instalado)

echo "=== Generando keystore para Examen de Conciencia ==="

# Configuración - CAMBIA ESTAS CONTRASEÑAS EN PRODUCCIÓN
STORE_PASS="examenconciencia2024"
KEY_PASS="examenconciencia2024"
ALIAS="examen-conciencia"
KEYSTORE_FILE="examen-conciencia.keystore"
VALIDITY_DAYS=10000

# Generar keystore
keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY_DAYS \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Examen de Conciencia, OU=Desarrollo, O=ExamenConciencia, L=Madrid, ST=Madrid, C=ES"

echo ""
echo "=== Keystore generado: $KEYSTORE_FILE ==="
echo "Alias: $ALIAS"
echo "Store password: $STORE_PASS"
echo "Key password: $KEY_PASS"
echo ""
echo "IMPORTANTE: Guarda estas contraseñas en un lugar seguro."
echo "Crea el archivo android/keystore.properties con:"
echo "storeFile=../examen-conciencia.keystore"
echo "storePassword=$STORE_PASS"
echo "keyAlias=$ALIAS"
echo "keyPassword=$KEY_PASS"