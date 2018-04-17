export function setParam(_url, key, val) {
  var url = new URL(_url);

  url.searchParams.set(key, val);

  return url.toString();
}

export function getParam(key){

  var url = new URL(location.href);

  return url.searchParams.get(key);
}

export function paramExists(_url, key) {
  var url = new URL(_url);

  return !!url.searchParams.get(key);
}
