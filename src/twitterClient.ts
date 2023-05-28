export class TwitterClient {
  private clientId: string;
  private clientSecret: string;
  private callbackFunctionName: string;

  constructor(
    clientId: string,
    clientSecret: string,
    callbackFunctionName: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callbackFunctionName = callbackFunctionName;
  }

  getService() {
    this.pkceChallengeVerifier();
    const userProps = PropertiesService.getUserProperties();
    const codeChallenge =
      PropertiesService.getUserProperties().getProperty("code_challenge");

    if (codeChallenge == null) {
      return undefined;
    }

    return OAuth2.createService("twitter")
      .setAuthorizationBaseUrl("https://twitter.com/i/oauth2/authorize")
      .setTokenUrl(
        "https://api.twitter.com/2/oauth2/token?code_verifier=" +
          userProps.getProperty("code_verifier")
      )
      .setClientId(this.clientId)
      .setClientSecret(this.clientSecret)
      .setCallbackFunction(this.callbackFunctionName)
      .setPropertyStore(userProps)
      .setScope("users.read tweet.read tweet.write offline.access")
      .setParam("response_type", "code")
      .setParam("code_challenge_method", "S256")
      .setParam("code_challenge", codeChallenge)
      .setTokenHeaders({
        Authorization:
          "Basic " +
          Utilities.base64Encode(this.clientId + ":" + this.clientSecret),
        "Content-Type": "application/x-www-form-urlencoded",
      });
  }

  pkceChallengeVerifier() {
    var userProps = PropertiesService.getUserProperties();
    if (!userProps.getProperty("code_verifier")) {
      var verifier = "";
      var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

      for (var i = 0; i < 128; i++) {
        verifier += possible.charAt(
          Math.floor(Math.random() * possible.length)
        );
      }

      var sha256Hash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        verifier
      );

      var challenge = Utilities.base64Encode(sha256Hash)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      userProps.setProperty("code_verifier", verifier);
      userProps.setProperty("code_challenge", challenge);
    }
  }

  logRedirectUri() {
    var service = this.getService();
    Logger.log(service?.getRedirectUri());
  }

  authorize() {
    const service = this.getService();
    if (service?.hasAccess()) {
      Logger.log("Already authorized");
    } else {
      const authorizationUrl = service?.getAuthorizationUrl();
      if (authorizationUrl != null) {
        Logger.log(
          "Open the following URL and re-run the script: %s",
          authorizationUrl
        );
      } else {
        console.error("Failed to create OAuth2 Twitter Service");
      }
    }
  }

  postTweet(tweet: string) {
    var payload = {
      text: tweet,
    };

    var service = this.getService();
    if (service?.hasAccess()) {
      var url = `https://api.twitter.com/2/tweets`;
      var response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + service.getAccessToken(),
        },
        muteHttpExceptions: true,
        payload: JSON.stringify(payload),
      });
      var result = JSON.parse(response.getContentText());
      Logger.log(JSON.stringify(result, null, 2));
    } else {
      Logger.log("No access to Twitter. Authorizing.");
      this.authorize();
    }
  }
}
