export const watchTheme = (callback: (theme: string) => void): (() => void) => {
  const callbackHandler: MutationCallback = data => {
    const targetRecord = data.find(record => record.type === 'attributes');
    if (targetRecord) {
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      const theme = targetRecord.target.getAttribute(targetRecord.attributeName);
      callback(theme);
    }
  };

  const observer = new MutationObserver(callbackHandler);
  observer.observe(document.body, {
    attributeFilter: ['data-theme'],
  });

  // initial call
  callback(document.body.getAttribute('data-theme') ?? '');

  return () => {
    observer.disconnect();
  };
};
