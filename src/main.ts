import { FeedManager } from "./feedManager";
import { SheetManager } from "./sheetManager";

function scriptPropNotFound(propName: string): void {
  console.error("Failed to get the script property " + propName);
}

export function main(): void {
  const userProps = PropertiesService.getUserProperties();
  const scriptProps = PropertiesService.getScriptProperties();

  const feedUrl = scriptProps.getProperty("FEED_URL");
  const sheetName = scriptProps.getProperty("SHEET_NAME");
  if (feedUrl == null) {
    scriptPropNotFound("FEED_URL");
    return;
  }
  if (sheetName == null) {
    scriptPropNotFound("SHEET_NAME");
    return;
  }

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
