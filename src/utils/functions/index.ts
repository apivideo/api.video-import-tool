export const formatSize = (size: number) => {
  return Math.round((size / 1024 / 1024) * 100) / 100 + ' MB';
};

export const formatDate = (date: Date) => {
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

export const buildId = (length: number) => {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const uppercaseFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const arrayContains = <T,> (features: T[], feature: T) => features.indexOf(feature) !== -1;


export const joinStrings = (list: string[], lastSeparator: string) => {
  if (list.length === 1) {
    return list[0];
  }
  if (list.length === 2) {
    return list.join(` ${lastSeparator} `);
  }
  return list.slice(0, -1).join(', ') + ` ${lastSeparator} ` + list.slice(-1);
};