var twitter = require('twitter-text')
var longTweet = "https://3btheory.github.io/literature-memorandum/2023/05/25/segment-and-track-anything/html あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやいゆえよらりるれろわいうえをあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやいゆえよらりるれろわいうえをあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやいゆえよらりるれろわいうえを"
console.log(twitter.parseTweet(longTweet))
console.log(twitter.parseTweet(longTweet.substring(0, 220)))
