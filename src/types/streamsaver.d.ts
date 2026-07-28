declare module 'streamsaver' {
  const streamSaver: {
    createWriteStream: (
      fileName: string,
      options?: {
        size?: number;
      },
    ) => WritableStream<Uint8Array>;
  };

  export default streamSaver;
}
