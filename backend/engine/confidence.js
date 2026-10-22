// confidence.js - how much should we trust the results for this application?
// Low confidence OR low similarity ALWAYS forces human review (hard-coded on purpose).

export function calcConfidence({ completeness, similarity }, config) {
  const comp = completeness ?? 0;
  const close = similarity?.closeCount ?? 0;
  const reasons = [];

  const low = comp < config.lowCompleteness || close < config.lowClose;
  const high =
    !low && comp >= config.highCompleteness && close >= config.highClose;
  const level = low ? "Low" : high ? "High" : "Medium";

  reasons.push(`${Math.round(comp)}% of the questionnaire answered`);
  reasons.push(`${close} close historical case(s) found`);

  const lowSimilarity = ["Low", "Not enough data"].includes(
    similarity?.level ?? "Not enough data",
  );
  if (lowSimilarity)
    reasons.push("Similarity to past cases is low or unavailable");

  return {
    level,
    mandatoryReview: level === "Low" || lowSimilarity,
    reasons,
  };
}
