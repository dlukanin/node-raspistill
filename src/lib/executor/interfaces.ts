export interface IRaspistillExecutor {
    /**
     * Executes raspistill and returns one image buffer
     * @param args
     */
    exec(args: string[]): Promise<Buffer>;
    /**
     * Spawns and returns one image buffer.
     * @param args
     */
    spawnAndGetImage(args: string[]): Promise<Buffer>;
    spawnAndGetImages(args: string[], cb: (image: Buffer) => any): Promise<void>;
    /**
     * Kills current raspistill execution process.
     */
    killProcess(): void;
}
