export function detectAndLinkUrls(text) {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const urls = text.match(urlRegex) || [];

  const linkedText = text.replace(urlRegex, (url) => {
    return `<a target="_blank" title="${url}" href="${url}">${getUrlHost(url)}</a>`;
  });

  return { linkedText, urls };
}

export function getUrlHost(url) {
  let fullUrl = url;
  if (url.startsWith('www')) {
    fullUrl = 'https://' + url;
  }
  try {
    const hostname = new URL(fullUrl).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}
