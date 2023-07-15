const twitterText = require("twitter-text");
const summary =
  "SGDのステップ幅（学習率）が有限であることの暗黙的な正則化効果について議論する．この筋の研究の中で，後方誤差解析によって勾配降下法を修正勾配流で近似するものは損失関数がステップごとに変わらないことを仮定しており，SGDには適用できなかった．本論文は，後方誤差解析を複数ステップのSGDに拡張した．その結果，$O(h^3)$ までの誤差で，従来から知られていた暗黙的勾配正則化項に加え，異なる時刻の勾配の内積を最大化するような項（gradient alignment）を持つ修正勾配流が得られた．また，この結果をGANなどの2プレイヤーゲームに拡張した．";
const url =
  "https://3btheory.github.io/literature-memorandum/2023/07/15/implicit-regularisation-in-stochastic-gradient-descent_-from-single-objective-to-two-player-games.-(arxiv_2307.05789v1-stat.ml-).html?utm_source=gas_auto_post&utm_medium=twitter";

const formatted = format(summary, url);
console.log(formatted);
formatted.forEach((entry) => console.log(twitterText.parseTweet(entry)));

function format(summary, url) {
  const maybeLongTweet = url + " " + summary;

  const parseResults = twitterText.parseTweet(maybeLongTweet);
  if (parseResults.valid) {
    return [summary + " " + url];
  }

  const trancateIndex = getMostSegments(
    maybeLongTweet,
    parseResults.validRangeEnd - 7
  );
  const trancated = maybeLongTweet.substring(url.length + 1, trancateIndex);
  let rest = "続き：" + maybeLongTweet.substring(trancateIndex);

  const tweetList = [trancated + " (続く) " + url];

  while (rest.length > 0) {
    const parseResults = twitterText.parseTweet(rest);
    if (parseResults.valid) {
      tweetList.push(rest);
      break;
    }
    const trancateIndex = getMostSegments(rest, parseResults.validRangeEnd - 6);
    const trancated = rest.substring(0, trancateIndex);
    tweetList.push(trancated + " (続く)");
    rest = "続き：" + rest.substring(trancateIndex);
  }
  return tweetList;
}

function getMostSegments(text, maxIndex, mode = "sentence") {
  let granularity = mode == "auto" ? "sentence" : mode;

  const segmenter = new Intl.Segmenter("ja-JP", { granularity: granularity });
  const segments = Array.from(segmenter.segment(text));

  let maxSegmentIndex = -1;
  for (let i = 1; i < segments.length; ++i) {
    if (segments[i].index > maxIndex) {
      maxSegmentIndex = i - 1;
      break;
    }
  }

  if (maxSegmentIndex > 0) {
    return segments[maxSegmentIndex].index;
  } else if (maxSegmentIndex == -1) {
    return segments.pop().index;
  } else if (mode == "auto") {
    return getMostSegments(text, maxIndex, "word");
  }
  return -1;
}
