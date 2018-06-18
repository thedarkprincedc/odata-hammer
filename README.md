## OData Hammer

OData Hammer is app designed to provide the following feature to users:
- Download a OData ServiceUrl Metadata and all Collections
- Generate OData Metadata and Collection JSON file from an Excel Spreadsheet
- Convert a Excel file to a ODATA collection JSON file

Download from NPM
- Install - npm install -g odata-hammer

Commands

- Import - Imports metadata and data file from service url
    - odata-hammer import <serviceurl> <destination:optional>
    - odata-hammer i <serviceurl> <destination:optional>

- Generate - Converts Excel file to json file and generate a metadata file
    - odata-hammer generate <filename.xlsx> <destination:optional>
    - odata-hammer g <filename.xlsx> <destination:optional>

- Excel to JSON - Converts Excel file to json file
    - odata-hammer xltojson <filename.xlsx> <destination:optional>
    - odata-hammer x <filename.xlsx> <destination:optional>

- Wizard - Runs the wizard cli tool
    - odata-hammer -w