function downloadFile(text, fileName) {
  const tagA = document.createElement('a');
  const type = fileName.split('.').pop();
  tagA.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` }),
  );
  tagA.download = fileName;
  tagA.click();
}

export { downloadFile };
