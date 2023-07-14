import { FeedManager, FeedEntry } from "./feedManager";
import { SheetManager } from "./sheetManager";
import { TwitterClient } from "./twitterClient";
const twitterText = require("twitter-text");

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
    const tweetStringList = formatLongTweet(entry);
    client.postThread(tweetStringList);
    Logger.log(tweetStringList);
  });
}

function formatTweet(entry: FeedEntry) {
  const summary = entry["summary"];
  const url = entry["url"] + "?utm_source=gas_auto_post&utm_medium=twitter";

  const maybeLongTweet = url + " " + summary;

  const parseResults = twitterText.default.parseTweet(maybeLongTweet);
  if (parseResults.valid) return maybeLongTweet;

  const trancated = maybeLongTweet.substring(
    url.length + 1,
    parseResults.validRangeEnd - 3
  );
  return trancated + "... " + url;
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

export function testLongTweet() {
  const entry = {
    summary:
      "長めの文章を送るテスト：バッチ正規化の暗黙的バイアスについて．バッチ正規化付き線形モデルは，最大マージン解ではなく一様マージン解に収束する．一様マージンが最大マージンよりも有利である問題設定があることを議論．タイトルを見てBNは「暗黙的」ではないバイアスではないかと考えてしまったが，BNがあっても仮説空間は変わらない（線形モデルは線形モデルのまま）なのでやはり「暗黙的」なのか．",
    url: "https://3btheory.github.io/literature-memorandum/2023/07/13/the-implicit-bias-of-batch-normalization-in-linear-models-and-two-layer-linear-convolutional-neural-networks.-(arxiv_2306.11680v2-cs.lg-updated).html",
    id: "",
    published: "",
    updated: "",
    title: "",
  };
  const formattedTweetList = formatLongTweet(entry);
  const client = createTwitterClient();
  client.postThread(formattedTweetList);
}

function formatLongTweet(entry: FeedEntry) {
  const summary = entry["summary"];
  const url = entry["url"] + "?utm_source=gas_auto_post&utm_medium=twitter";

  const maybeLongTweet = url + " " + summary;

  const parseResults = twitterText.default.parseTweet(maybeLongTweet);
  if (parseResults.valid) {
    return [summary + " " + url];
  }

  const trancated = maybeLongTweet.substring(
    url.length + 1,
    parseResults.validRangeEnd - 3
  );
  let rest = maybeLongTweet.substring(parseResults.validRangeEnd - 3);

  const tweetList = [trancated + "... " + url];

  while (rest.length > 0) {
    const parseResults = twitterText.default.parseTweet(rest);
    if (parseResults.valid) {
      tweetList.push(rest);
      break;
    }
    const trancated = rest.substring(0, parseResults.validRangeEnd - 3);
    tweetList.push(trancated + "...");
    rest = rest.substring(parseResults.validRangeEnd - 3);
  }
  return tweetList;
}
