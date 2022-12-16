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
