type FeedEntry = {
  id: string;
  url: string;
  published: string;
  updated: string;
  summary: string;
  title: string;
};
export class FeedManager {
  private url: string;
  namespace = XmlService.getNamespace("http://www.w3.org/2005/Atom");

  constructor(url: string) {
    this.url = url;
  }

  convertEntry = (entry: GoogleAppsScript.XML_Service.Element): FeedEntry => ({
    id: entry.getChild("id", this.namespace).getText(),
    url: entry.getChild("link", this.namespace).getAttribute("href").getValue(),
    published: entry.getChild("published", this.namespace).getText(),
    updated: entry.getChild("updated", this.namespace).getText(),
    summary: entry.getChild("summary", this.namespace).getText(),
    title: entry.getChild("title", this.namespace).getText(),
  });

  fetchFeed(): FeedEntry[] {
    const response = UrlFetchApp.fetch(this.url);
    const parsed = XmlService.parse(response.getContentText());
    const fetchedEntries: FeedEntry[] = [];
    parsed
      .getRootElement()
      .getChildren("entry", this.namespace)
      .forEach((entry) => {
        fetchedEntries.push(this.convertEntry(entry));
      });
    return fetchedEntries;
  }
}
