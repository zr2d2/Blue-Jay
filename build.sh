set -e #terminate on error

#cd to script directory
cd "$(dirname $0)"
SCRIPT_PATH="${PWD}"

#choose some locations
OUTPUT_PATH="${SCRIPT_PATH}/Bluejay.xpi"
SOURCE_PATH="${SCRIPT_PATH}/src"

#make zip
cd "${SOURCE_PATH}"

echo "Creating ${OUTPUT_PATH}"
rm -f "${OUTPUT_PATH}"
zip -r "${OUTPUT_PATH}" .
echo "Created ${OUTPUT_PATH}"