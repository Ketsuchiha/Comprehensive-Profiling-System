function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasAnyKeyword(text, terms) {
  return terms.some((term) => text.includes(term));
}

function scoreExpertiseMatch(subjectName, expertiseText) {
  const subject = normalizeText(subjectName);
  const expertise = normalizeText(expertiseText);
  if (!subject || !expertise) return 0;

  const networkKeywords = ['network', 'networking', 'cybersecurity', 'security', 'hacking', 'ethical hacking', 'penetration'];
  const appKeywords = ['app', 'application', 'software', 'web', 'mobile', 'programming', 'development'];
  const introKeywords = ['intro', 'introduction', 'fundamentals', 'basic', 'computing'];

  if (hasAnyKeyword(subject, networkKeywords)) {
    return hasAnyKeyword(expertise, networkKeywords) ? 3 : 0;
  }

  if (hasAnyKeyword(subject, appKeywords)) {
    return hasAnyKeyword(expertise, appKeywords) ? 3 : 0;
  }

  if (hasAnyKeyword(subject, introKeywords)) {
    return hasAnyKeyword(expertise, introKeywords) ? 2 : 0;
  }

  const subjectTokens = subject.split(' ').filter((token) => token.length > 3);
  return subjectTokens.some((token) => expertise.includes(token)) ? 1 : 0;
}

function isFacultyQualifiedForSubject(subjectName, expertiseValues) {
  if (!Array.isArray(expertiseValues) || expertiseValues.length === 0) return false;

  const maxScore = expertiseValues
    .map((value) => scoreExpertiseMatch(subjectName, value))
    .reduce((best, current) => Math.max(best, current), 0);

  return maxScore > 0;
}

module.exports = {
  scoreExpertiseMatch,
  isFacultyQualifiedForSubject,
};
