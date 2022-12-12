
export const formatSize = (size: number) => {
    return Math.round((size / 1024 / 1024) * 100) / 100 + ' MB';
  };