import os
import pandas as pd

excel_path = "/Users/richardkovac/Google Drive/Môj disk/Cenník full American Living.xlsx"
if not os.path.exists(excel_path):
    excel_path = "/Users/richardkovac/Library/CloudStorage/GoogleDrive-living.cheap.american@gmail.com/Môj disk/Cenník full American Living.xlsx"

xl = pd.ExcelFile(excel_path)
print("Searching for Prosto House models...")
keywords = ["prosto", "ph-", "fjord", "nord", "flat", "barn", "a-frame", "double"]

for sheet in xl.sheet_names:
    df = pd.read_excel(excel_path, sheet_name=sheet)
    # Search all text columns
    for col in df.columns:
        # Convert column to string and check if it contains any keyword
        mask = df[col].astype(str).str.lower().str.contains("|".join(keywords))
        matches = df[mask]
        if not matches.empty:
            print(f"\n--- Found matches in sheet '{sheet}', column '{col}':")
            for idx, row in matches.iterrows():
                print(f"Row {idx}: {row.to_dict()}")
