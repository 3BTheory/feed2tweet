type SheetEntry = {
  id: string;
  url: string;
  published: string;
  updated: string;
};

export class SheetManager {
  private spreadSheet;
  private sheet;

  constructor(sheetName: string) {
    this.spreadSheet = SpreadsheetApp.getActive();
    this.sheet = this.spreadSheet.getSheetByName(sheetName);
  }

  getAllEntries(): SheetEntry[] {
    const values = this?.sheet?.getDataRange().getValues() || [];
    const savedEntires: Array<SheetEntry | null> = values.map(
      (value, index) => {
        // ヘッダー部分を除く
        if (index === 0) return null;
        return {
          id: value[0],
          url: value[1],
          published: value[2],
          updated: value[3],
        };
      }
    );
    // nullを除くためのfilter(Boolean);
    return savedEntires.filter<SheetEntry>((x): x is SheetEntry => x != null);
  }

  private addEntries(newEntries: SheetEntry[]): number {
    const lastRow = this.sheet?.getDataRange().getLastRow();
    if (lastRow == null) return -1;
    newEntries.forEach((entry, index) => {
      this.sheet
        ?.getRange(lastRow + index + 1, 1, 1, 4)
        .setValues([
          [entry["id"], entry["url"], entry["published"], entry["updated"]],
        ]);
    });
    return newEntries.length;
  }

  addNewEntries(entries: SheetEntry[]): SheetEntry[] {
    const existingIds = new Set(this.getAllEntries().map((x) => x["id"]));
    const newEntries = entries.filter((entry) => !existingIds.has(entry["id"]));
    this.addEntries(newEntries);
    return newEntries;
  }
}
