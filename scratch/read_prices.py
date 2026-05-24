import os
import pandas as pd

excel_path = "/Users/richardkovac/Google Drive/Môj disk/Cenník full American Living.xlsx"
if not os.path.exists(excel_path):
    excel_path = "/Users/richardkovac/Library/CloudStorage/GoogleDrive-living.cheap.american@gmail.com/Môj disk/Cenník full American Living.xlsx"

pd.set_option('display.max_columns', 15)
pd.set_option('display.max_rows', 100)
pd.set_option('display.width', 1000)

try:
    xl = pd.ExcelFile(excel_path)
    
    # We will search for Prosto House references in all sheets
    for sheet in xl.sheet_names:
        df = pd.read_excel(excel_path, sheet_name=sheet)
        print(f"\n==================================================")
        print(f"SHEET: {sheet} (Shape: {df.shape})")
        print(f"==================================================")
        
        # Check if "prosto" or "PH" exists in any column or value
        # We can search case-insensitive
        match_mask = df.astype(str).apply(lambda x: x.str.contains('prosto|ph-|ph00', case=False, na=False)).any(axis=1)
        matches = df[match_mask]
        
        if not matches.empty:
            print(f"Found {len(matches)} matching rows with 'prosto' or 'PH-':")
            print(matches.head(30))
        else:
            # If no matches, print first 15 rows to see what the sheet contains
            print("First 15 rows:")
            print(df.head(15))
            
except Exception as e:
    print(f"Error: {e}")
