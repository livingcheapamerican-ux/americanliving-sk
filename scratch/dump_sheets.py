import os
import pandas as pd

excel_path = "/Users/richardkovac/Google Drive/Môj disk/Cenník full American Living.xlsx"
if not os.path.exists(excel_path):
    excel_path = "/Users/richardkovac/Library/CloudStorage/GoogleDrive-living.cheap.american@gmail.com/Môj disk/Cenník full American Living.xlsx"

output_path = "/Users/richardkovac/Documents/american_living_web/american-living-sk/scratch/prosto_house_cennik.txt"

with open(output_path, "w", encoding="utf-8") as out:
    xl = pd.ExcelFile(excel_path)
    for sheet in xl.sheet_names:
        df = pd.read_excel(excel_path, sheet_name=sheet)
        out.write(f"\n==================================================\n")
        out.write(f"SHEET: {sheet} (Shape: {df.shape})\n")
        out.write(f"==================================================\n")
        
        # Write first 50 rows of every sheet to look at its structure in detail
        out.write("First 100 rows:\n")
        out.write(df.head(100).to_string())
        out.write("\n\n")

print(f"Done writing all sheet data to {output_path}")
