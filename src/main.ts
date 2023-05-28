import { FeedManager, FeedEntry } from "./feedManager";
import { SheetManager } from "./sheetManager";
import { TwitterClient } from "./twitterClient";

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
  if (newEntries.length == 0) {
    Logger.log("No new entries found. Will quit.");
    return;
  }

  Logger.log(
    "Added " + newEntries.length.toString() + " new entries to the Sheet."
  );
  Logger.log(newEntries);

  const client = createTwitterClient();
  newEntries.forEach((entry) => {
    const tweetString = formatTweet(entry);
    client.postTweet(tweetString);
    Logger.log(tweetString);
  });
}

function formatTweet(entry: FeedEntry) {
  const summary = entry["summary"];
  const url = entry["url"];

  let summaryWithUrl: string;
  if (summary.length > 110) {
    summaryWithUrl = summary.substring(0, 110) + "... " + url;
  } else {
    const urlTagged = url + "?utm_source=gas_auto_post&utm_medium=twitter";
    summaryWithUrl = summary + " " + urlTagged;
  }

  return summaryWithUrl;
}

function getPropertyOrThrow(propertyName: string): string {
  const property =
    PropertiesService.getScriptProperties().getProperty(propertyName);
  if (property == null) {
    throw Error("Failed to get the script property " + propertyName);
  }
  return property;
}

function createTwitterClient() {
  return new TwitterClient(
    getPropertyOrThrow("CLIENT_ID"),
    getPropertyOrThrow("CLIENT_SECRET"),
    "authCallback"
  );
}

export function authorizeTwitter() {
  createTwitterClient().authorize();
}

export function authCallback(request: object) {
  const service = createTwitterClient().getService();
  const authorized = service?.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput("Success!");
  } else {
    return HtmlService.createHtmlOutput("Denied.");
  }
}

export function testTweet() {
  const client = createTwitterClient();
  client.postTweet("test");
}
