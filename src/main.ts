import { FeedManager } from "./feedManager";
import { SheetManager } from "./sheetManager";

export function main(): void {
  const feedUrl = getPropertyOrThrow("FEED_URL");
  const sheetName = getPropertyOrThrow("SHEET_NAME");

  const feedManager = new FeedManager(feedUrl);
  const sheetManager = new SheetManager(sheetName);

  const feedEntries = feedManager.fetchFeed();
  Logger.log(
    "Feched " + feedEntries.length.toString() + " entries from " + feedUrl + "."
  );

  const newEntries = sheetManager.addNewEntries(feedEntries);
  Logger.log(
    "Added " + newEntries.length.toString() + " new entries to the Sheet."
  );
  Logger.log(newEntries);
}

function getPropertyOrThrow(propertyName: string): string {
  const property =
    PropertiesService.getScriptProperties().getProperty(propertyName);
  if (property == null) {
    throw Error("Failed to get the script property " + propertyName);
  }
  return property;
}
