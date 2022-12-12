
export const formatSize = (size: number) => {
    return Math.round((size / 1024 / 1024) * 100) / 100 + ' MB';
  };

export const formatDate = (date: Date) => {
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};