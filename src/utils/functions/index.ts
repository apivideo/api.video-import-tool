export const formatSize = (size: number) => {
  return Math.round((size / 1024 / 1024) * 100) / 100 + ' MB';
};

export const formatDate = (date: Date) => {
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

export const formatDuration = (durationSec: number) => {
  const seconds = Math.round((durationSec % 60) * 100) / 100;
  const minutes = Math.floor(durationSec / 60) % 60;
  const hours = Math.floor(durationSec / 3600) % 3600;

  const twoDigits = (t: number) => (t < 10 ? '0' + t : t);

  if (hours > 0)
    return `${hours}h ${twoDigits(minutes)}m ${twoDigits(seconds)}s`;
  if (minutes > 0) return `${minutes}m ${twoDigits(seconds)}s`;
  return `${twoDigits(seconds)}s`;
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
